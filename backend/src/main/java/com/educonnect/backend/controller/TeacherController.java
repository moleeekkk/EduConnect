package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/teacher", "/api/teacher"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    // --- TEACHER PROFILE ---
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(Principal principal) {
        Map<String, Object> profile = teacherService.getTeacherProfile(principal);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateTeacherProfile(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        Map<String, Object> updated = teacherService.updateTeacherProfile(body, principal);
        return ResponseEntity.ok(updated);
    }

    // --- TEACHER DASHBOARD ---
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        Map<String, Object> data = teacherService.getTeacherDashboard(teacherId, principal);
        return ResponseEntity.ok(data);
    }

    // --- ASSIGNED SUBJECTS ---
    @GetMapping({"/subjects", "/my-subjects"})
    public ResponseEntity<List<Map<String, Object>>> getMyAssignedSubjects(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getMyAssignedSubjects(teacherId, principal);
        return ResponseEntity.ok(list);
    }

    // --- ASSIGNED STUDENTS ---
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAssignedStudents(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) UUID allocationId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getAssignedStudents(teacherId, allocationId, principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/allocations/{allocationId}/students")
    public ResponseEntity<List<Map<String, Object>>> getApplicableStudentsForAllocation(
            @PathVariable UUID allocationId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getAssignedStudents(null, allocationId, principal);
        return ResponseEntity.ok(list);
    }

    // --- ATTENDANCE & GRADES ---
    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            @RequestParam(required = false) String teacherId) {
        List<Map<String, Object>> grades = teacherService.getPendingGrades(teacherId);
        return ResponseEntity.ok(grades);
    }
}
