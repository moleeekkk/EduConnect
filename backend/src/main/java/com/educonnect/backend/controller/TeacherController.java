package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(
            @RequestParam(required = false, defaultValue = "teach-demo-id") String teacherId) {
        Map<String, Object> data = teacherService.getTeacherDashboard(teacherId);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            @RequestParam(required = false, defaultValue = "teach-demo-id") String teacherId) {
        List<Map<String, Object>> grades = teacherService.getPendingGrades(teacherId);
        return ResponseEntity.ok(grades);
    }
}
