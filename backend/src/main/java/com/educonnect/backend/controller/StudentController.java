package com.educonnect.backend.controller;

import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.Batch;
import com.educonnect.backend.entity.Subject;
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

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getStudentSubjects(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        return ResponseEntity.ok(studentService.getSubjectsForStudent(activeEnrollment));
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getStudentBatches(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        return ResponseEntity.ok(studentService.getBatchesForStudent(activeEnrollment));
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<AssignmentSubmission> submitAssignment(
            Authentication authentication,
            @PathVariable UUID assignmentId,
            @RequestParam(required = false) String enrollmentNo,
            @RequestBody Map<String, Object> reqData) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        String bodyEnrollment = reqData.get("enrollment_no") != null ? String.valueOf(reqData.get("enrollment_no")) : String.valueOf(reqData.get("enrollmentNo"));
        if (bodyEnrollment != null && !bodyEnrollment.equalsIgnoreCase("null") && !bodyEnrollment.trim().isEmpty()) {
            if (activeEnrollment != null && !activeEnrollment.equalsIgnoreCase(bodyEnrollment.trim())) {
                throw new IllegalArgumentException("Submitting assignment for another enrollment identity is forbidden.");
            }
        }
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
        String bodyEnrollment = reqData.get("enrollment_no") != null ? String.valueOf(reqData.get("enrollment_no")) : String.valueOf(reqData.get("enrollmentNo"));
        if (bodyEnrollment != null && !bodyEnrollment.equalsIgnoreCase("null") && !bodyEnrollment.trim().isEmpty()) {
            if (activeEnrollment != null && !activeEnrollment.equalsIgnoreCase(bodyEnrollment.trim())) {
                throw new IllegalArgumentException("Updating profile for another enrollment identity is forbidden.");
            }
        }
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

    @GetMapping("/digital-id")
    public ResponseEntity<Map<String, Object>> getStudentDigitalID(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {
        String activeEnrollment = getAuthenticatedEnrollmentNo(authentication, enrollmentNo);
        Map<String, Object> digitalIdData = studentService.getStudentDigitalID(activeEnrollment);
        return ResponseEntity.ok(digitalIdData);
    }
}

