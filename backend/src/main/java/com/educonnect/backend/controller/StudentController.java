package com.educonnect.backend.controller;

import com.educonnect.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> data = studentService.getStudentDashboard(enrollmentNo);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        List<Map<String, Object>> attendance = studentService.getStudentAttendance(enrollmentNo);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        List<Map<String, Object>> assignments = studentService.getStudentAssignments(enrollmentNo);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getStudentResults(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> results = studentService.getStudentResults(enrollmentNo);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getStudentProfile(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> profile = studentService.getStudentProfile(enrollmentNo);
        return ResponseEntity.ok(profile);
    }
}
