package com.educonnect.backend.controller;

import com.educonnect.backend.service.ParentEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class ParentEmailController {

    private final ParentEmailService parentEmailService;

    private String getAuthenticatedTeacherIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty()) {
            return authentication.getName();
        }
        return null;
    }

    @PostMapping("/parent-email/preview")
    public ResponseEntity<Map<String, Object>> previewParentEmail(
            Authentication authentication,
            @RequestBody Map<String, Object> reqData) {
        String activeUser = getAuthenticatedTeacherIdentifier(authentication);
        String studentIdStr = reqData.get("student_id") != null ? reqData.get("student_id").toString() : null;
        UUID studentId = (studentIdStr != null && !studentIdStr.trim().isEmpty()) ? UUID.fromString(studentIdStr.trim()) : null;
        String category = reqData.get("category") != null ? reqData.get("category").toString() : "Attendance Report";

        Map<String, Object> preview = parentEmailService.generatePreview(studentId, category, activeUser);
        return ResponseEntity.ok(preview);
    }

    @PostMapping("/parent-email")
    public ResponseEntity<Map<String, Object>> sendParentEmail(
            Authentication authentication,
            @RequestBody Map<String, Object> reqData) {
        String activeUser = getAuthenticatedTeacherIdentifier(authentication);
        Map<String, Object> result = parentEmailService.sendParentEmails(reqData, activeUser);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/parent-email/send")
    public ResponseEntity<Map<String, Object>> sendParentEmailAlt(
            Authentication authentication,
            @RequestBody Map<String, Object> reqData) {
        String activeUser = getAuthenticatedTeacherIdentifier(authentication);
        Map<String, Object> result = parentEmailService.sendParentEmails(reqData, activeUser);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/assignments/{assignmentId}/reminders")
    public ResponseEntity<Map<String, Object>> sendAssignmentReminders(
            Authentication authentication,
            @PathVariable UUID assignmentId) {
        String activeUser = getAuthenticatedTeacherIdentifier(authentication);
        Map<String, Object> result = parentEmailService.sendAssignmentReminders(assignmentId, activeUser);
        return ResponseEntity.ok(result);
    }
}
