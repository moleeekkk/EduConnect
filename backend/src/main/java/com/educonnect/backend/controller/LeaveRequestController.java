package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping("/student/leave-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentLeaveRequests(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String identifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo
                : getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(leaveRequestService.getStudentLeaveRequests(identifier));
    }

    @PostMapping("/student/leave-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> createStudentLeaveRequest(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(leaveRequestService.createStudentLeaveRequest(identifier, body));
    }

    @GetMapping("/teacher/leave-requests")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherLeaveRequests(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(leaveRequestService.getTeacherLeaveRequests(identifier));
    }

    @PutMapping("/teacher/leave-requests/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> updateTeacherLeaveStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(leaveRequestService.updateTeacherLeaveStatus(identifier, id, body));
    }

    private String getAuthenticatedIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().isEmpty()) {
            return authentication.getName();
        }
        return SecurityUtils.getCurrentUserIdentifier();
    }
}
