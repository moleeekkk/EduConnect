package com.educonnect.backend.controller;

import com.educonnect.backend.security.SecurityUtils;
import com.educonnect.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/files", "/api/v1/files"})
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<FileStorageService.StoredFileMetaData> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "purpose", required = false, defaultValue = "attachments") String purpose) {

        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required to upload files.");
        }

        String safeSubFolder = purpose.replaceAll("[^a-zA-Z0-9_-]", "_").toLowerCase();
        FileStorageService.StoredFileMetaData metadata = fileStorageService.storeFile(file, safeSubFolder);

        return ResponseEntity.ok(metadata);
    }
}
