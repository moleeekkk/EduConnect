package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Notice;
import com.educonnect.backend.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    private String getAuthenticatedUserIdentifier(Authentication authentication, String paramVal) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty()) {
            return authentication.getName();
        }
        return paramVal;
    }

    // Student Endpoints
    @GetMapping("/student/notices")
    public ResponseEntity<List<Map<String, Object>>> getStudentNotices(
            Authentication authentication,
            @RequestParam(required = false) String studentId) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, studentId);
        List<Map<String, Object>> notices = noticeService.getNoticesForStudent(activeUser);
        return ResponseEntity.ok(notices);
    }

    // Teacher Endpoints
    @GetMapping("/teacher/notices")
    public ResponseEntity<List<Map<String, Object>>> getTeacherNotices(
            Authentication authentication,
            @RequestParam(required = false) String teacherId) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, teacherId);
        List<Map<String, Object>> notices = noticeService.getNoticesForTeacher(activeUser);
        return ResponseEntity.ok(notices);
    }

    @PostMapping("/teacher/notices")
    public ResponseEntity<Notice> createTeacherNotice(
            Authentication authentication,
            @RequestBody Notice notice) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice created = noticeService.createNotice(notice, activeUser, "TEACHER");
        return ResponseEntity.ok(created);
    }

    @PutMapping("/teacher/notices/{id}")
    public ResponseEntity<Notice> updateTeacherNotice(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Notice notice) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice updated = noticeService.updateNotice(id, notice, activeUser, "TEACHER");
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/teacher/notices/{id}/archive")
    public ResponseEntity<Notice> archiveTeacherNotice(
            Authentication authentication,
            @PathVariable UUID id) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice archived = noticeService.archiveNotice(id, activeUser, "TEACHER");
        return ResponseEntity.ok(archived);
    }

    @DeleteMapping("/teacher/notices/{id}")
    public ResponseEntity<Notice> deleteTeacherNotice(
            Authentication authentication,
            @PathVariable UUID id) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice archived = noticeService.archiveNotice(id, activeUser, "TEACHER");
        return ResponseEntity.ok(archived);
    }

    // Admin Endpoints
    @GetMapping("/admin/notices")
    public ResponseEntity<List<Map<String, Object>>> getAdminNotices() {
        List<Map<String, Object>> notices = noticeService.getNoticesForAdmin();
        return ResponseEntity.ok(notices);
    }

    @PostMapping("/admin/notices")
    public ResponseEntity<Notice> createAdminNotice(
            Authentication authentication,
            @RequestBody Notice notice) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice created = noticeService.createNotice(notice, activeUser, "ADMIN");
        return ResponseEntity.ok(created);
    }

    @PutMapping("/admin/notices/{id}")
    public ResponseEntity<Notice> updateAdminNotice(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Notice notice) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice updated = noticeService.updateNotice(id, notice, activeUser, "ADMIN");
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/admin/notices/{id}/archive")
    public ResponseEntity<Notice> archiveAdminNotice(
            Authentication authentication,
            @PathVariable UUID id) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice archived = noticeService.archiveNotice(id, activeUser, "ADMIN");
        return ResponseEntity.ok(archived);
    }

    @DeleteMapping("/admin/notices/{id}")
    public ResponseEntity<Notice> deleteAdminNotice(
            Authentication authentication,
            @PathVariable UUID id) {
        String activeUser = getAuthenticatedUserIdentifier(authentication, null);
        Notice archived = noticeService.archiveNotice(id, activeUser, "ADMIN");
        return ResponseEntity.ok(archived);
    }
}
