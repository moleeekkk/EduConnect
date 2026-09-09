package com.educonnect.backend.controller;

import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    private String getAuthenticatedEnrollmentNo(Authentication authentication, String paramEnrollmentNo) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty()) {
            return authentication.getName();
        }
        return paramEnrollmentNo;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        Map<String, Object> data = studentService.getStudentDashboard(activeEnrollment);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        List<Map<String, Object>> attendance = studentService.getStudentAttendance(activeEnrollment);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        List<Map<String, Object>> assignments = studentService.getStudentAssignments(activeEnrollment);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<AssignmentSubmission> submitAssignment(
            Authentication authentication,
            @PathVariable UUID assignmentId,
            @RequestParam(required = false) String enrollmentNo,
            @RequestBody Map<String, Object> reqData) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        AssignmentSubmission submission = studentService.submitAssignment(assignmentId, activeEnrollment, reqData);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getStudentResults(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        Map<String, Object> results = studentService.getStudentResults(activeEnrollment);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getStudentProfile(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        Map<String, Object> profile = studentService.getStudentProfile(activeEnrollment);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateStudentProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> reqData) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, null);
        if (activeEnrollment != null && !reqData.containsKey("enrollment_no")) {
            reqData.put("enrollment_no", activeEnrollment);
        }
        Map<String, Object> updated = studentService.updateStudentProfile(reqData);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/weekly-tests")
    public ResponseEntity<Map<String, Object>> getWeeklyTests(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        return ResponseEntity.ok(studentService.getWeeklyTestsForStudent(activeEnrollment));
    }
}
