package com.educonnect.backend.service;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentFileService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    @Value("${app.upload.directory:uploads}")
    private String uploadDirectory;

    /**
     * Resolves an assignment reference file resource and constructs a ResponseEntity<Resource>
     * with inline or attachment Content-Disposition.
     */
    public ResponseEntity<Resource> getAssignmentFileResource(UUID assignmentId, boolean isDownload) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found with id: " + assignmentId));

        String rawPath = getStoredFilePath(assignment.getFilePath(), assignment.getAttachment());
        String originalFileName = resolveFileName(assignment.getFileName(), assignment.getTitle(), rawPath, "assignment.pdf");

        return buildFileResponse(rawPath, originalFileName, isDownload);
    }

    /**
     * Resolves a student submission file resource and constructs a ResponseEntity<Resource>
     * with inline or attachment Content-Disposition.
     */
    public ResponseEntity<Resource> getSubmissionFileResource(UUID submissionId, boolean isDownload) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Assignment submission not found with id: " + submissionId));

        String rawPath = getStoredFilePath(submission.getFilePath(), submission.getAttachment());
        String originalFileName = resolveFileName(submission.getFileName(), "Submission_" + submissionId, rawPath, "submission.pdf");

        return buildFileResponse(rawPath, originalFileName, isDownload);
    }

    private String getStoredFilePath(String primaryPath, String fallbackAttachment) {
        if (primaryPath != null && !primaryPath.trim().isEmpty()) {
            return primaryPath.trim();
        }
        if (fallbackAttachment != null && !fallbackAttachment.trim().isEmpty() && !fallbackAttachment.startsWith("data:")) {
            return fallbackAttachment.trim();
        }
        throw new IllegalStateException("No file path is associated with this entity.");
    }

    private String resolveFileName(String storedFileName, String titleFallback, String rawPath, String defaultName) {
        if (storedFileName != null && !storedFileName.trim().isEmpty()) {
            return storedFileName.trim();
        }
        if (rawPath != null && !rawPath.trim().isEmpty()) {
            try {
                Path path = Paths.get(rawPath);
                String fileName = path.getFileName().toString();
                if (fileName.contains("_")) {
                    // Strips UUID prefix if present e.g. 8f5a2c7e-xxx_Java_Practical.pdf -> Java_Practical.pdf
                    int idx = fileName.indexOf('_');
                    if (idx > 0 && idx < fileName.length() - 1) {
                        return fileName.substring(idx + 1);
                    }
                }
                return fileName;
            } catch (Exception ignored) {}
        }
        if (titleFallback != null && !titleFallback.trim().isEmpty()) {
            return titleFallback.replaceAll("[^a-zA-Z0-9._-]", "_");
        }
        return defaultName;
    }

    private ResponseEntity<Resource> buildFileResponse(String rawPath, String originalFileName, boolean isDownload) {
        try {
            // 1. Resolve Root Directory safely
            Path rootPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();

            // 2. Resolve relative or full file path safely against root upload directory
            Path resolvedPath = Paths.get(rawPath).isAbsolute() 
                    ? Paths.get(rawPath).normalize()
                    : rootPath.resolve(rawPath).normalize();

            // 3. Security: Prevent Path Traversal attacks
            if (!resolvedPath.startsWith(rootPath) && !Files.exists(resolvedPath)) {
                log.error("Security warning: Attempted path traversal attack or unauthorized file access: {}", rawPath);
                throw new SecurityException("Access to requested file path is restricted.");
            }

            // 4. Verify physical file existence and readability
            if (!Files.exists(resolvedPath) || !Files.isReadable(resolvedPath) || Files.isDirectory(resolvedPath)) {
                log.warn("File not found or not readable at path: {}", resolvedPath);
                throw new FileNotFoundException("Requested physical file does not exist on server.");
            }

            // 5. Create Spring FileSystemResource
            Resource resource = new FileSystemResource(resolvedPath);

            // 6. Determine MIME Content-Type dynamically
            String contentType = determineContentType(resolvedPath, originalFileName);
            MediaType mediaType = MediaType.parseMediaType(contentType);

            // 7. Build Content-Disposition Header (inline or attachment)
            ContentDisposition contentDisposition = (isDownload ? ContentDisposition.attachment() : ContentDisposition.inline())
                    .filename(originalFileName, StandardCharsets.UTF_8)
                    .build();

            // 8. Return ResponseEntity<Resource>
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .contentLength(Files.size(resolvedPath))
                    .body(resource);

        } catch (SecurityException e) {
            throw e;
        } catch (FileNotFoundException e) {
            throw new RuntimeException("File not found", e);
        } catch (Exception e) {
            log.error("Error serving assignment file: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to read assignment file", e);
        }
    }

    private String determineContentType(Path path, String fileName) {
        try {
            String probeType = Files.probeContentType(path);
            if (probeType != null && !probeType.trim().isEmpty()) {
                return probeType;
            }
        } catch (Exception ignored) {}

        return MediaTypeFactory.getMediaType(fileName)
                .map(MediaType::toString)
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    }
}
