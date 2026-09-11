package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService syllabusService;

    @GetMapping("/api/student/syllabus")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentSyllabus(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(syllabusService.getStudentSyllabus(identifier));
    }

    @GetMapping("/api/teacher/syllabus")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherSyllabus(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(syllabusService.getTeacherSyllabus(identifier));
    }

    @PostMapping(value = "/api/teacher/subjects/{subjectId}/syllabus", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> saveSyllabus(
            @PathVariable UUID subjectId,
            @RequestParam(value = "unitsJson", required = false) String unitsJson,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        Map<String, Object> result = syllabusService.saveSyllabus(identifier, subjectId, unitsJson, file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/v1/syllabus/{syllabusId}/file")
    public ResponseEntity<Resource> downloadSyllabusFile(
            @PathVariable UUID syllabusId,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            try {
                userEmail = SecurityUtils.getCurrentUserIdentifier();
            } catch (Exception ignored) {
            }
        }
        Resource resource = syllabusService.loadSyllabusFileResource(syllabusId, userEmail);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"syllabus.pdf\"")
                .body(resource);
    }

    private String getAuthenticatedIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().isEmpty()) {
            return authentication.getName();
        }
        return SecurityUtils.getCurrentUserIdentifier();
    }
}
