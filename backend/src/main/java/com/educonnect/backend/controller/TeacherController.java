package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/teacher", "/api/teacher"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    private String getEffectiveTeacherId(String requestedId, Principal principal) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName();
        }
        return requestedId != null ? requestedId : "";
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        String targetId = getEffectiveTeacherId(teacherId, principal);
        Map<String, Object> data = teacherService.getTeacherDashboard(targetId);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        String targetId = getEffectiveTeacherId(teacherId, principal);
        List<Map<String, Object>> grades = teacherService.getPendingGrades(targetId);
        return ResponseEntity.ok(grades);
    }
}
