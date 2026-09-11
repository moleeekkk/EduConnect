package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.DoubtService;
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
public class DoubtController {

    private final DoubtService doubtService;

    @GetMapping("/student/doubts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentDoubts(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String identifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo
                : getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(doubtService.getStudentDoubts(identifier));
    }

    @PostMapping("/student/doubts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> createStudentDoubt(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(doubtService.createStudentDoubt(identifier, body));
    }

    @GetMapping("/teacher/doubts")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherDoubts(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(doubtService.getTeacherDoubts(identifier));
    }

    @RequestMapping(value = "/teacher/doubts/{id}/reply", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> replyTeacherDoubt(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(doubtService.replyTeacherDoubt(identifier, id, body));
    }

    private String getAuthenticatedIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().isEmpty()) {
            return authentication.getName();
        }
        return SecurityUtils.getCurrentUserIdentifier();
    }
}
