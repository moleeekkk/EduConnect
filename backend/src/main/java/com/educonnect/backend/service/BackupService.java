package com.educonnect.backend.service;

import com.educonnect.backend.entity.BackupLog;
import com.educonnect.backend.repository.BackupLogRepository;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupService {

    private final BackupLogRepository backupLogRepository;

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/educonnect_db}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:EC@123}")
    private String datasourcePassword;

    private static final String BACKUP_DIR = "backups";
    private static final String UPLOADS_DIR = "uploads";

    private File getBackupDirectory() {
        File dir = new File(BACKUP_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    private boolean isPgDumpAvailable() {
        try {
            Process process = new ProcessBuilder("pg_dump", "--version").start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String[] parseDatabaseUrl() {
        // e.g. jdbc:postgresql://localhost:5432/educonnect_db
        String host = "localhost";
        String port = "5432";
        String dbName = "educonnect_db";

        try {
            String cleanUrl = datasourceUrl.replace("jdbc:postgresql://", "");
            int slashIdx = cleanUrl.indexOf("/");
            if (slashIdx > 0) {
                String hostPort = cleanUrl.substring(0, slashIdx);
                dbName = cleanUrl.substring(slashIdx + 1);
                int qIdx = dbName.indexOf("?");
                if (qIdx > 0) {
                    dbName = dbName.substring(0, qIdx);
                }
                int colonIdx = hostPort.indexOf(":");
                if (colonIdx > 0) {
                    host = hostPort.substring(0, colonIdx);
                    port = hostPort.substring(colonIdx + 1);
                } else {
                    host = hostPort;
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing datasource URL for backup: {}", e.getMessage());
        }

        return new String[]{host, port, dbName};
    }

    @Transactional
    public List<BackupLog> triggerBackup(String requestedType) {
        String adminUser = SecurityUtils.getCurrentUserIdentifier();
        if (adminUser == null || adminUser.trim().isEmpty()) {
            adminUser = "Super Admin";
        }

        File backupDir = getBackupDirectory();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        List<BackupLog> createdLogs = new ArrayList<>();

        String targetType = (requestedType != null && !requestedType.trim().isEmpty()) 
                ? requestedType.trim().toUpperCase() 
                : "ALL";

        // 1. PostgreSQL DB Dump Backup
        if ("DB".equals(targetType) || "ALL".equals(targetType)) {
            String dbFilename = "db_backup_" + timestamp + ".dump";
            File outputFile = new File(backupDir, dbFilename);

            if (!isPgDumpAvailable()) {
                BackupLog unavailableLog = BackupLog.builder()
                        .filename(dbFilename)
                        .backupType("DB_DUMP")
                        .fileSize(0L)
                        .status("UNAVAILABLE")
                        .errorMessage("Backup unavailable: pg_dump executable tool is not installed on system PATH")
                        .createdAt(LocalDateTime.now())
                        .createdBy(adminUser)
                        .build();
                createdLogs.add(backupLogRepository.save(unavailableLog));
            } else {
                try {
                    String[] parsed = parseDatabaseUrl();
                    String host = parsed[0];
                    String port = parsed[1];
                    String dbName = parsed[2];

                    ProcessBuilder pb = new ProcessBuilder(
                            "pg_dump",
                            "-h", host,
                            "-p", port,
                            "-U", datasourceUsername,
                            "-F", "c",
                            "-f", outputFile.getAbsolutePath(),
                            dbName
                    );

                    pb.environment().put("PGPASSWORD", datasourcePassword);
                    Process process = pb.start();

                    boolean finished = process.waitFor(120, java.util.concurrent.TimeUnit.SECONDS);
                    if (finished && process.exitValue() == 0 && outputFile.exists()) {
                        BackupLog successLog = BackupLog.builder()
                                .filename(dbFilename)
                                .backupType("DB_DUMP")
                                .fileSize(outputFile.length())
                                .status("SUCCESS")
                                .errorMessage(null)
                                .createdAt(LocalDateTime.now())
                                .createdBy(adminUser)
                                .build();
                        createdLogs.add(backupLogRepository.save(successLog));
                    } else {
                        String errMsg = "pg_dump failed with exit code: " + (finished ? process.exitValue() : "TIMED_OUT");
                        BackupLog failedLog = BackupLog.builder()
                                .filename(dbFilename)
                                .backupType("DB_DUMP")
                                .fileSize(outputFile.exists() ? outputFile.length() : 0L)
                                .status("FAILED")
                                .errorMessage(errMsg)
                                .createdAt(LocalDateTime.now())
                                .createdBy(adminUser)
                                .build();
                        createdLogs.add(backupLogRepository.save(failedLog));
                    }
                } catch (Exception e) {
                    log.error("Database backup error:", e);
                    BackupLog errLog = BackupLog.builder()
                            .filename(dbFilename)
                            .backupType("DB_DUMP")
                            .fileSize(0L)
                            .status("FAILED")
                            .errorMessage(e.getMessage() != null ? e.getMessage() : e.toString())
                            .createdAt(LocalDateTime.now())
                            .createdBy(adminUser)
                            .build();
                    createdLogs.add(backupLogRepository.save(errLog));
                }
            }
        }

        // 2. Durable Uploads Directory ZIP Backup
        if ("UPLOADS".equals(targetType) || "ALL".equals(targetType)) {
            String zipFilename = "uploads_backup_" + timestamp + ".zip";
            File zipOutputFile = new File(backupDir, zipFilename);
            File uploadsDirFile = new File(UPLOADS_DIR);

            try {
                if (!uploadsDirFile.exists()) {
                    uploadsDirFile.mkdirs();
                }

                try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipOutputFile))) {
                    zipFolder(uploadsDirFile, uploadsDirFile.getName(), zos);
                }

                BackupLog zipSuccessLog = BackupLog.builder()
                        .filename(zipFilename)
                        .backupType("UPLOADS_ZIP")
                        .fileSize(zipOutputFile.length())
                        .status("SUCCESS")
                        .errorMessage(null)
                        .createdAt(LocalDateTime.now())
                        .createdBy(adminUser)
                        .build();
                createdLogs.add(backupLogRepository.save(zipSuccessLog));
            } catch (Exception e) {
                log.error("Uploads backup error:", e);
                BackupLog zipFailLog = BackupLog.builder()
                        .filename(zipFilename)
                        .backupType("UPLOADS_ZIP")
                        .fileSize(0L)
                        .status("FAILED")
                        .errorMessage(e.getMessage() != null ? e.getMessage() : e.toString())
                        .createdAt(LocalDateTime.now())
                        .createdBy(adminUser)
                        .build();
                createdLogs.add(backupLogRepository.save(zipFailLog));
            }
        }

        return createdLogs;
    }

    private void zipFolder(File fileToZip, String fileName, ZipOutputStream zos) throws IOException {
        if (fileToZip.isHidden()) return;
        if (fileToZip.isDirectory()) {
            if (fileName.endsWith("/")) {
                zos.putNextEntry(new ZipEntry(fileName));
                zos.closeEntry();
            } else {
                zos.putNextEntry(new ZipEntry(fileName + "/"));
                zos.closeEntry();
            }
            File[] children = fileToZip.listFiles();
            if (children != null) {
                for (File childFile : children) {
                    zipFolder(childFile, fileName + "/" + childFile.getName(), zos);
                }
            }
            return;
        }

        try (FileInputStream fis = new FileInputStream(fileToZip)) {
            ZipEntry zipEntry = new ZipEntry(fileName);
            zos.putNextEntry(zipEntry);
            byte[] bytes = new byte[8192];
            int length;
            while ((length = fis.read(bytes)) >= 0) {
                zos.write(bytes, 0, length);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BackupLog> getBackups() {
        return backupLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Resource downloadBackup(String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IllegalArgumentException("Invalid filename specification.");
        }

        File file = new File(getBackupDirectory(), filename);
        if (!file.exists() || !file.isFile()) {
            throw new NoSuchElementException("Backup file not found: " + filename);
        }

        return new FileSystemResource(file);
    }
}
