package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.StudyMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    @GetMapping("/teacher/study-materials")
    public ResponseEntity<List<Map<String, Object>>> getTeacherStudyMaterials(Authentication authentication) {
        String identifier = getAuthenticatedIdentifier(authentication);
        return ResponseEntity.ok(studyMaterialService.getTeacherStudyMaterials(identifier));
    }

    @PostMapping("/teacher/study-materials")
    public ResponseEntity<Map<String, Object>> createStudyMaterial(
            Authentication authentication,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "resource_type", required = false) String resourceType,
            @RequestParam(value = "subject_id", required = false) String subjectIdStr,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        String identifier = getAuthenticatedIdentifier(authentication);
        UUID subjectId = parseUuid(subjectIdStr);

        Map<String, Object> result = studyMaterialService.createStudyMaterial(
                title, description, resourceType, subjectId, file, identifier);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/teacher/study-materials/{id}")
    public ResponseEntity<Map<String, Object>> updateStudyMaterial(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "resource_type", required = false) String resourceType,
            @RequestParam(value = "subject_id", required = false) String subjectIdStr,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        String identifier = getAuthenticatedIdentifier(authentication);
        UUID subjectId = parseUuid(subjectIdStr);

        Map<String, Object> result = studyMaterialService.updateStudyMaterial(
                id, title, description, resourceType, subjectId, file, identifier);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/teacher/study-materials/{id}")
    public ResponseEntity<Map<String, String>> deleteStudyMaterial(
            Authentication authentication,
            @PathVariable UUID id) {

        String identifier = getAuthenticatedIdentifier(authentication);
        studyMaterialService.deleteStudyMaterial(id, identifier);
        return ResponseEntity.ok(Map.of("message", "Study material deleted successfully from database"));
    }

    @GetMapping("/student/study-materials")
    public ResponseEntity<List<Map<String, Object>>> getStudentStudyMaterials(
            Authentication authentication,
            @RequestParam(required = false) String enrollmentNo) {

        String identifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo
                : getAuthenticatedIdentifier(authentication);

        return ResponseEntity.ok(studyMaterialService.getStudentStudyMaterials(identifier));
    }

    @GetMapping({"/api/study-materials/{id}/file", "/api/v1/study-materials/{id}/file"})
    public ResponseEntity<Resource> getMaterialFile(@PathVariable UUID id) {
        return studyMaterialService.getStudyMaterialFileResource(id, false);
    }

    @GetMapping({"/api/study-materials/{id}/file/download", "/api/v1/study-materials/{id}/file/download"})
    public ResponseEntity<Resource> downloadMaterialFile(@PathVariable UUID id) {
        return studyMaterialService.getStudyMaterialFileResource(id, true);
    }

    private String getAuthenticatedIdentifier(Authentication authentication) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().isEmpty()) {
            return authentication.getName();
        }
        return SecurityUtils.getCurrentUserIdentifier();
    }

    private UUID parseUuid(String str) {
        if (str == null || str.trim().isEmpty()) return null;
        try {
            return UUID.fromString(str.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
