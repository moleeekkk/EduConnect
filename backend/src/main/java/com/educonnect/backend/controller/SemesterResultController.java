package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.SemesterResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SemesterResultController {

    private final SemesterResultService semesterResultService;

    // Student Marksheet & Results GET Endpoint
    @GetMapping({"/student/marksheet", "/student/results"})
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getStudentMarksheet(
            @RequestParam(required = false) String semesterId,
            @RequestParam(required = false) String enrollmentNo) {
        String identifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo.trim()
                : SecurityUtils.getCurrentUserIdentifier();
        Map<String, Object> result = semesterResultService.getStudentMarksheet(identifier, semesterId);
        return ResponseEntity.ok(result);
    }

    // Teacher Semester Marks Roster & Save
    @GetMapping("/teacher/semester-marks")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherSubjectRoster(
            @RequestParam UUID subjectId,
            @RequestParam(required = false) UUID semesterId,
            @RequestParam(required = false) String email) {
        String identifier = email != null && !email.trim().isEmpty() ? email.trim() : SecurityUtils.getCurrentUserIdentifier();
        List<Map<String, Object>> roster = semesterResultService.getTeacherSubjectRoster(identifier, subjectId, semesterId);
        return ResponseEntity.ok(roster);
    }

    @PostMapping("/teacher/semester-marks")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> saveTeacherSubjectMarks(
            @RequestParam(required = false) String email,
            @RequestBody Map<String, Object> body) {
        try {
            String identifier = email != null && !email.trim().isEmpty() ? email.trim() : SecurityUtils.getCurrentUserIdentifier();
            List<Map<String, Object>> updated = semesterResultService.saveTeacherSubjectMarks(identifier, body);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin Semester Results Overview & Publication
    @GetMapping("/admin/semester-results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAdminCohortResults(
            @RequestParam UUID departmentId,
            @RequestParam UUID semesterId) {
        List<Map<String, Object>> results = semesterResultService.getAdminCohortResults(departmentId, semesterId);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/admin/semester-results/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> publishCohortResults(@RequestBody Map<String, Object> body) {
        try {
            UUID departmentId = UUID.fromString(body.get("department_id").toString());
            UUID semesterId = UUID.fromString(body.get("semester_id").toString());
            String adminIdentifier = SecurityUtils.getCurrentUserIdentifier();
            Map<String, Object> res = semesterResultService.publishCohortResults(adminIdentifier, departmentId, semesterId);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
