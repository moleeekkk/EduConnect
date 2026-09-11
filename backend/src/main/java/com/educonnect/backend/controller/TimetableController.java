package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.TimetableService;
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
public class TimetableController {

    private final TimetableService timetableService;

    // Student Timetable GET Endpoint
    @GetMapping("/student/timetable")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStudentTimetable(
            @RequestParam(required = false) String enrollmentNo) {
        String identifier = (enrollmentNo != null && !enrollmentNo.trim().isEmpty())
                ? enrollmentNo.trim()
                : SecurityUtils.getCurrentUserIdentifier();
        List<Map<String, Object>> result = timetableService.getStudentTimetable(identifier);
        return ResponseEntity.ok(result);
    }

    // Teacher Schedule GET Endpoints
    @GetMapping({"/teacher/timetable", "/teacher/schedule"})
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherSchedule(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String teacherId) {
        String identifier = email != null && !email.trim().isEmpty() ? email.trim() : teacherId;
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = SecurityUtils.getCurrentUserIdentifier();
        }
        List<Map<String, Object>> result = timetableService.getTeacherSchedule(identifier);
        return ResponseEntity.ok(result);
    }

    // Admin Timetable Endpoints
    @GetMapping("/admin/timetables")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAdminTimetables() {
        List<Map<String, Object>> list = timetableService.getAdminTimetables();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/timetables")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTimetable(@RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> created = timetableService.createTimetable(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/timetables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTimetable(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> updated = timetableService.updateTimetable(id, body);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/timetables/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> archiveTimetablePatch(@PathVariable UUID id) {
        try {
            Map<String, Object> archived = timetableService.archiveTimetable(id);
            return ResponseEntity.ok(archived);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/timetables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> archiveTimetableDelete(@PathVariable UUID id) {
        try {
            Map<String, Object> archived = timetableService.archiveTimetable(id);
            return ResponseEntity.ok(archived);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
