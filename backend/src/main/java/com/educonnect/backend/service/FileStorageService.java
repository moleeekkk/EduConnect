package com.educonnect.backend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.directory:uploads}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt",
            "png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "zip", "rar", "7z",
            "csv", "json", "xml", "html", "css", "js", "java", "py", "sql", "md", "rtf"
    ));

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoredFileMetaData {
        private String fileName;
        private String filePath;
        private String fileType;
        private Long fileSize;
        private String storageKey;

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

        public String getStorageKey() { return storageKey; }
        public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    }

    /**
     * Stores an uploaded multipart file under the configured upload directory.
     */
    public StoredFileMetaData storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty or missing file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 25MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "file_" + System.currentTimeMillis();
        } else {
            // Strip client-side directory paths (e.g., C:\fakepath\ or ../)
            originalFilename = Paths.get(originalFilename).getFileName().toString();
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File extension '." + extension + "' is not permitted.");
        }

        String storageKey = UUID.randomUUID().toString() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        try {
            Path rootPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
            Path targetDir = (subFolder != null && !subFolder.trim().isEmpty())
                    ? rootPath.resolve(subFolder.trim()).normalize()
                    : rootPath;

            if (!targetDir.startsWith(rootPath)) {
                throw new SecurityException("Invalid subfolder destination path.");
            }

            Files.createDirectories(targetDir);

            Path targetFile = targetDir.resolve(storageKey).normalize();
            if (!targetFile.startsWith(rootPath)) {
                throw new SecurityException("Storage destination escapes root upload directory.");
            }

            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            String relativePathStr = rootPath.relativize(targetFile).toString().replace('\\', '/');
            String contentType = file.getContentType();
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = "application/octet-stream";
            }

            log.info("Successfully stored file: {} at relative path: {}", originalFilename, relativePathStr);

            return new StoredFileMetaData(
                    originalFilename,
                    relativePathStr,
                    contentType,
                    file.getSize(),
                    storageKey
            );

        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new RuntimeException("Could not store file. Please try again.", e);
        }
    }

    /**
     * Resolves a stored relative path or filename against the root upload directory with strict canonical path checking.
     */
    public Path resolveAndValidatePath(String rawPath) throws FileNotFoundException {
        if (rawPath == null || rawPath.trim().isEmpty()) {
            throw new IllegalArgumentException("Raw file path cannot be null or empty.");
        }

        String cleanRawPath = rawPath.trim();
        Path rootPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        Path candidatePath = Paths.get(cleanRawPath);

        Path resolvedPath;
        if (candidatePath.isAbsolute()) {
            resolvedPath = candidatePath.normalize();
            if (!resolvedPath.startsWith(rootPath)) {
                log.error("Security violation: Caller provided absolute path outside root upload dir: {}", cleanRawPath);
                throw new SecurityException("Access to requested absolute file path is restricted.");
            }
        } else {
            resolvedPath = rootPath.resolve(candidatePath).normalize();
        }

        if (!resolvedPath.startsWith(rootPath)) {
            log.error("Security violation: Path traversal attempt detected for path: {}", cleanRawPath);
            throw new SecurityException("Access to requested file path is restricted.");
        }

        if (!Files.exists(resolvedPath) || !Files.isReadable(resolvedPath) || Files.isDirectory(resolvedPath)) {
            log.warn("Physical file not found or not readable at: {}", resolvedPath);
            throw new FileNotFoundException("Physical file not found: " + cleanRawPath);
        }

        try {
            Path realRoot = rootPath.toRealPath();
            Path realTarget = resolvedPath.toRealPath();
            if (!realTarget.startsWith(realRoot)) {
                log.error("Security violation: Symlink escape detected for path: {}", cleanRawPath);
                throw new SecurityException("Access to requested file path is restricted.");
            }
            return realTarget;
        } catch (IOException e) {
            log.warn("Unable to resolve real canonical path for file: {}", cleanRawPath);
            throw new FileNotFoundException("Physical file not found on server.");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex > 0 && lastIndex < filename.length() - 1) {
            return filename.substring(lastIndex + 1);
        }
        return "";
    }
}
