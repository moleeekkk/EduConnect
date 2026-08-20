package com.educonnect.backend.controller;

import com.educonnect.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/student", "/api/student"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    private String getEffectiveEnrollmentNo(String requestedNo, Principal principal) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName();
        }
        return requestedNo != null ? requestedNo : "";
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(
            @RequestParam(required = false) String enrollmentNo,
            Principal principal) {
        String targetNo = getEffectiveEnrollmentNo(enrollmentNo, principal);
        Map<String, Object> data = studentService.getStudentDashboard(targetNo);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(
            @RequestParam(required = false) String enrollmentNo,
            Principal principal) {
        String targetNo = getEffectiveEnrollmentNo(enrollmentNo, principal);
        List<Map<String, Object>> attendance = studentService.getStudentAttendance(targetNo);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments(
            @RequestParam(required = false) String enrollmentNo,
            Principal principal) {
        String targetNo = getEffectiveEnrollmentNo(enrollmentNo, principal);
        List<Map<String, Object>> assignments = studentService.getStudentAssignments(targetNo);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getStudentResults(
            @RequestParam(required = false) String enrollmentNo,
            Principal principal) {
        String targetNo = getEffectiveEnrollmentNo(enrollmentNo, principal);
        Map<String, Object> results = studentService.getStudentResults(targetNo);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getStudentProfile(
            @RequestParam(required = false) String enrollmentNo,
            Principal principal) {
        String targetNo = getEffectiveEnrollmentNo(enrollmentNo, principal);
        Map<String, Object> profile = studentService.getStudentProfile(targetNo);
        return ResponseEntity.ok(profile);
    }
}
