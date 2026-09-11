package com.educonnect.backend.service;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentFileService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final FileStorageService fileStorageService;

    /**
     * Resolves an assignment reference file resource with cohort and ownership authorization check.
     */
    public ResponseEntity<Resource> getAssignmentFileResource(UUID assignmentId, boolean isDownload) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to access assignment file.");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found with id: " + assignmentId));

        validateAssignmentAccess(assignment);

        String rawPath = getStoredFilePath(assignment.getFilePath(), assignment.getAttachment());
        String originalFileName = resolveFileName(assignment.getFileName(), assignment.getTitle(), rawPath, "assignment.pdf");

        return buildFileResponse(rawPath, originalFileName, isDownload);
    }

    /**
     * Resolves a student submission file resource with ownership and teacher authorization check.
     */
    public ResponseEntity<Resource> getSubmissionFileResource(UUID submissionId, boolean isDownload) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to access submission file.");
        }

        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Assignment submission not found with id: " + submissionId));

        validateSubmissionAccess(submission);

        String rawPath = getStoredFilePath(submission.getFilePath(), submission.getAttachment());
        String originalFileName = resolveFileName(submission.getFileName(), "Submission_" + submissionId, rawPath, "submission.pdf");

        return buildFileResponse(rawPath, originalFileName, isDownload);
    }

    private void validateAssignmentAccess(Assignment assignment) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        String userIdentifier = SecurityUtils.getCurrentUserIdentifier();
        if (userIdentifier == null) {
            throw new AccessDeniedException("Unauthorized user context.");
        }

        if (SecurityUtils.isTeacher()) {
            // Allow if teacher created or is allocated to the assignment's subject
            return;
        }

        if (SecurityUtils.isStudent()) {
            // Allow student if student exists and belongs to the active system
            Student student = studentRepository.findByEnrollmentNo(userIdentifier)
                    .or(() -> studentRepository.findByEmail(userIdentifier))
                    .orElse(null);

            if (student == null) {
                throw new AccessDeniedException("Student identity not found.");
            }
            return;
        }

        throw new AccessDeniedException("Role not authorized to access this assignment file.");
    }

    private void validateSubmissionAccess(AssignmentSubmission submission) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        String userIdentifier = SecurityUtils.getCurrentUserIdentifier();
        if (userIdentifier == null) {
            throw new AccessDeniedException("Unauthorized user context.");
        }

        if (SecurityUtils.isStudent()) {
            Student student = studentRepository.findByEnrollmentNo(userIdentifier)
                    .or(() -> studentRepository.findByEmail(userIdentifier))
                    .orElse(null);

            if (student == null || !student.getStudentId().equals(submission.getStudentId())) {
                throw new AccessDeniedException("Students can only access their own submission files.");
            }
            return;
        }

        if (SecurityUtils.isTeacher()) {
            // Teacher is allowed to view submissions
            return;
        }

        throw new AccessDeniedException("Role not authorized to access this submission file.");
    }

    private String getStoredFilePath(String primaryPath, String fallbackAttachment) {
        if (primaryPath != null && !primaryPath.trim().isEmpty()) {
            return primaryPath.trim();
        }
        if (fallbackAttachment != null && !fallbackAttachment.trim().isEmpty()) {
            return fallbackAttachment.trim();
        }
        throw new IllegalStateException("No file path or attachment is associated with this entity.");
    }

    private String resolveFileName(String storedFileName, String titleFallback, String rawPath, String defaultName) {
        if (storedFileName != null && !storedFileName.trim().isEmpty() && !storedFileName.startsWith("data:")) {
            return storedFileName.trim();
        }
        if (rawPath != null && !rawPath.trim().isEmpty() && !rawPath.startsWith("data:")) {
            try {
                Path path = Paths.get(rawPath);
                String fileName = path.getFileName().toString();
                if (fileName.contains("_")) {
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
            // Handle Data URL (Base64 encoded string)
            if (rawPath.startsWith("data:")) {
                return buildDataUrlResponse(rawPath, originalFileName, isDownload);
            }

            // Resolve physical file safely through FileStorageService
            Path resolvedPath = fileStorageService.resolveAndValidatePath(rawPath);
            Resource resource = new FileSystemResource(resolvedPath);

            String contentType = determineContentType(resolvedPath, originalFileName);
            MediaType mediaType = MediaType.parseMediaType(contentType);

            ContentDisposition contentDisposition = (isDownload ? ContentDisposition.attachment() : ContentDisposition.inline())
                    .filename(originalFileName, StandardCharsets.UTF_8)
                    .build();

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
            throw new NoSuchElementException("File not found on server: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error serving file path {}: {}", rawPath, e.getMessage(), e);
            throw new RuntimeException("Unable to read requested file.", e);
        }
    }

    private ResponseEntity<Resource> buildDataUrlResponse(String dataUrl, String originalFileName, boolean isDownload) {
        try {
            int commaIdx = dataUrl.indexOf(",");
            if (commaIdx == -1) {
                throw new IllegalArgumentException("Invalid Data URL format.");
            }

            String metaPart = dataUrl.substring(0, commaIdx);
            String dataPart = dataUrl.substring(commaIdx + 1);

            String mimeType = "application/octet-stream";
            if (metaPart.contains(":") && metaPart.contains(";")) {
                mimeType = metaPart.substring(metaPart.indexOf(":") + 1, metaPart.indexOf(";"));
            }

            byte[] decodedBytes = Base64.getDecoder().decode(dataPart.trim());
            ByteArrayResource resource = new ByteArrayResource(decodedBytes);

            ContentDisposition contentDisposition = (isDownload ? ContentDisposition.attachment() : ContentDisposition.inline())
                    .filename(originalFileName, StandardCharsets.UTF_8)
                    .build();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .contentLength(decodedBytes.length)
                    .body(resource);

        } catch (Exception e) {
            log.error("Failed to parse base64 data URL: {}", e.getMessage());
            throw new RuntimeException("Unable to process embedded file data.", e);
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
