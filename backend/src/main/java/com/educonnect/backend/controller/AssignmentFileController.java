package com.educonnect.backend.controller;

import com.educonnect.backend.service.AssignmentFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssignmentFileController {

    private final AssignmentFileService fileService;

    // ==========================================
    // 1. ASSIGNMENT REFERENCE FILE ENDPOINTS
    // ==========================================

    @GetMapping({"/api/assignments/{assignmentId}/file", "/api/v1/assignments/{assignmentId}/file"})
    public ResponseEntity<Resource> viewAssignmentFile(@PathVariable UUID assignmentId) {
        return fileService.getAssignmentFileResource(assignmentId, false);
    }

    @GetMapping({"/api/assignments/{assignmentId}/file/download", "/api/v1/assignments/{assignmentId}/file/download"})
    public ResponseEntity<Resource> downloadAssignmentFile(@PathVariable UUID assignmentId) {
        return fileService.getAssignmentFileResource(assignmentId, true);
    }

    // ==========================================
    // 2. ASSIGNMENT SUBMISSION FILE ENDPOINTS
    // ==========================================

    @GetMapping({"/api/submissions/{submissionId}/file", "/api/v1/submissions/{submissionId}/file"})
    public ResponseEntity<Resource> viewSubmissionFile(@PathVariable UUID submissionId) {
        return fileService.getSubmissionFileResource(submissionId, false);
    }

    @GetMapping({"/api/submissions/{submissionId}/file/download", "/api/v1/submissions/{submissionId}/file/download"})
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable UUID submissionId) {
        return fileService.getSubmissionFileResource(submissionId, true);
    }
}
