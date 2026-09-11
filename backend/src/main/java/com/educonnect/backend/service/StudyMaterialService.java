package com.educonnect.backend.service;

import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.StudyMaterial;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherStudyMaterials(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        List<StudyMaterial> materials = studyMaterialRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (StudyMaterial sm : materials) {
            result.add(mapMaterialToResponse(sm));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createStudyMaterial(
            String title,
            String description,
            String resourceType,
            UUID subjectId,
            MultipartFile file,
            String identifier) {

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Material title is required.");
        }

        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        if (allocations.isEmpty()) {
            throw new IllegalStateException("Teacher has no active subject allocations.");
        }

        TeacherSubject matchedAlloc = null;
        if (subjectId != null) {
            matchedAlloc = allocations.stream()
                    .filter(a -> Objects.equals(a.getSubjectId(), subjectId))
                    .findFirst()
                    .orElse(allocations.get(0));
        } else {
            matchedAlloc = allocations.get(0);
        }

        UUID targetSubjectId = matchedAlloc.getSubjectId();
        Subject subject = targetSubjectId != null ? subjectRepository.findById(targetSubjectId).orElse(null) : null;

        StudyMaterial material = new StudyMaterial();
        material.setTitle(title.trim());
        material.setDescription(description != null ? description.trim() : "");
        material.setResourceType(resourceType != null && !resourceType.trim().isEmpty() ? resourceType.trim() : "Study Material");
        material.setSubjectId(targetSubjectId);
        material.setTeacherId(teacher.getTeacherId());

        if (subject != null) {
            material.setDepartmentId(subject.getDepartmentId());
            material.setSemesterId(subject.getSemesterId());
        }
        if (matchedAlloc.getBatchId() != null) {
            material.setBatchId(matchedAlloc.getBatchId());
        }

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFileMetaData meta = fileStorageService.storeFile(file, "materials");
            material.setFileName(meta.getFileName());
            material.setFileType(meta.getFileType());
            material.setFileSize(meta.getFileSize());
            material.setStorageKey(meta.getStorageKey());
        }

        StudyMaterial saved = studyMaterialRepository.save(material);
        String apiFilePath = "/api/v1/study-materials/" + saved.getMaterialId() + "/file";
        saved.setFilePath(apiFilePath);
        saved.setAttachment(apiFilePath);
        studyMaterialRepository.save(saved);

        return mapMaterialToResponse(saved);
    }

    @Transactional
    public Map<String, Object> updateStudyMaterial(
            UUID id,
            String title,
            String description,
            String resourceType,
            UUID subjectId,
            MultipartFile file,
            String identifier) {

        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Study material not found with id: " + id));

        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        if (!teacher.getTeacherId().equals(material.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You do not own this study material.");
        }

        if (title != null && !title.trim().isEmpty()) {
            material.setTitle(title.trim());
        }
        if (description != null) {
            material.setDescription(description.trim());
        }
        if (resourceType != null && !resourceType.trim().isEmpty()) {
            material.setResourceType(resourceType.trim());
        }
        if (subjectId != null) {
            material.setSubjectId(subjectId);
            subjectRepository.findById(subjectId).ifPresent(sub -> {
                material.setDepartmentId(sub.getDepartmentId());
                material.setSemesterId(sub.getSemesterId());
            });
        }

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFileMetaData meta = fileStorageService.storeFile(file, "materials");
            material.setFileName(meta.getFileName());
            material.setFileType(meta.getFileType());
            material.setFileSize(meta.getFileSize());
            material.setStorageKey(meta.getStorageKey());
        }

        StudyMaterial saved = studyMaterialRepository.save(material);
        return mapMaterialToResponse(saved);
    }

    @Transactional
    public void deleteStudyMaterial(UUID id, String identifier) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Study material not found with id: " + id));

        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        if (!teacher.getTeacherId().equals(material.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You do not own this study material.");
        }

        material.setIsActive(false);
        studyMaterialRepository.save(material);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentStudyMaterials(String enrollmentNo) {
        String cleanIdentifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(cleanIdentifier);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(cleanIdentifier);
        }

        Student student = studentOpt.orElse(null);
        List<StudyMaterial> activeMaterials = studyMaterialRepository.findByIsActiveTrue();

        List<StudyMaterial> permittedMaterials;
        if (student != null) {
            UUID deptId = student.getDepartmentId();
            UUID semId = student.getSemesterId();
            UUID batchId = student.getBatchId();

            permittedMaterials = activeMaterials.stream()
                    .filter(sm -> (deptId == null || sm.getDepartmentId() == null || Objects.equals(sm.getDepartmentId(), deptId)))
                    .filter(sm -> (semId == null || sm.getSemesterId() == null || Objects.equals(sm.getSemesterId(), semId)))
                    .filter(sm -> (batchId == null || sm.getBatchId() == null || Objects.equals(sm.getBatchId(), batchId)))
                    .toList();
        } else {
            permittedMaterials = activeMaterials;
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (StudyMaterial sm : permittedMaterials) {
            result.add(mapMaterialToResponse(sm));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getStudyMaterialFileResource(UUID materialId, boolean isDownload) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to access study material file.");
        }

        StudyMaterial material = studyMaterialRepository.findById(materialId)
                .orElseThrow(() -> new NoSuchElementException("Study material not found with id: " + materialId));

        if (!Boolean.TRUE.equals(material.getIsActive())) {
            throw new NoSuchElementException("Study material is archived or inactive.");
        }

        validateStudyMaterialAccess(material);

        String storageKey = material.getStorageKey();
        String originalFileName = material.getFileName() != null ? material.getFileName() : material.getTitle() + ".pdf";

        if (storageKey == null || storageKey.trim().isEmpty()) {
            throw new IllegalStateException("No file attachment is associated with this study material.");
        }

        try {
            Path resolvedPath = fileStorageService.resolveAndValidatePath(storageKey);
            Resource resource = new FileSystemResource(resolvedPath);

            String contentType = material.getFileType();
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = determineContentType(resolvedPath, originalFileName);
            }
            MediaType mediaType = MediaType.parseMediaType(contentType);

            ContentDisposition contentDisposition = (isDownload ? ContentDisposition.attachment() : ContentDisposition.inline())
                    .filename(originalFileName, StandardCharsets.UTF_8)
                    .build();

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .contentLength(Files.size(resolvedPath))
                    .body(resource);

        } catch (FileNotFoundException e) {
            throw new NoSuchElementException("Physical file not found on server.");
        } catch (Exception e) {
            log.error("Error serving study material file {}: {}", storageKey, e.getMessage(), e);
            throw new RuntimeException("Unable to read study material file.", e);
        }
    }

    private void validateStudyMaterialAccess(StudyMaterial material) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        String userIdentifier = SecurityUtils.getCurrentUserIdentifier();
        if (userIdentifier == null) {
            throw new AccessDeniedException("Unauthorized user context.");
        }

        if (SecurityUtils.isTeacher()) {
            return;
        }

        if (SecurityUtils.isStudent()) {
            Student student = studentRepository.findByEnrollmentNo(userIdentifier)
                    .or(() -> studentRepository.findByEmail(userIdentifier))
                    .orElse(null);

            if (student == null) {
                throw new AccessDeniedException("Student identity not found.");
            }

            if (material.getDepartmentId() != null && student.getDepartmentId() != null &&
                    !material.getDepartmentId().equals(student.getDepartmentId())) {
                throw new AccessDeniedException("Out-of-scope department study material download denied.");
            }
            if (material.getSemesterId() != null && student.getSemesterId() != null &&
                    !material.getSemesterId().equals(student.getSemesterId())) {
                throw new AccessDeniedException("Out-of-scope semester study material download denied.");
            }
            return;
        }

        throw new AccessDeniedException("Role not authorized to access this study material file.");
    }

    private Map<String, Object> mapMaterialToResponse(StudyMaterial sm) {
        Map<String, Object> map = new HashMap<>();
        String matIdStr = sm.getMaterialId() != null ? sm.getMaterialId().toString() : "";
        map.put("material_id", matIdStr);
        map.put("resource_id", matIdStr);
        map.put("title", sm.getTitle() != null ? sm.getTitle() : "");
        map.put("description", sm.getDescription() != null ? sm.getDescription() : "");
        map.put("resource_type", sm.getResourceType() != null ? sm.getResourceType() : "Study Material");
        map.put("subject_id", sm.getSubjectId() != null ? sm.getSubjectId().toString() : "");
        map.put("teacher_id", sm.getTeacherId() != null ? sm.getTeacherId().toString() : "");
        map.put("file_name", sm.getFileName() != null ? sm.getFileName() : "");

        String filePath = "/api/v1/study-materials/" + matIdStr + "/file";
        map.put("file_path", filePath);
        map.put("attachment", filePath);
        map.put("file_type", sm.getFileType() != null ? sm.getFileType() : "");
        map.put("file_size", sm.getFileSize() != null ? sm.getFileSize() : 0);
        map.put("uploaded_date", sm.getUploadedDate());
        map.put("created_at", sm.getCreatedAt() != null ? sm.getCreatedAt().toString() : "");
        map.put("updated_at", sm.getUpdatedAt() != null ? sm.getUpdatedAt().toString() : "");

        if (sm.getSubjectId() != null) {
            subjectRepository.findById(sm.getSubjectId()).ifPresent(sub -> {
                map.put("subject_code", sub.getSubjectCode());
                map.put("subject_name", sub.getSubjectName());
            });
        }
        return map;
    }

    private Optional<Teacher> resolveTeacherByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return Optional.empty();
        String clean = identifier.trim();
        Optional<Teacher> opt = teacherRepository.findByEmail(clean);
        if (opt.isPresent()) return opt;
        opt = teacherRepository.findByEmployeeId(clean);
        if (opt.isPresent()) return opt;
        try {
            return teacherRepository.findById(UUID.fromString(clean));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String determineContentType(Path path, String fileName) {
        try {
            String probeType = Files.probeContentType(path);
            if (probeType != null && !probeType.trim().isEmpty()) {
                return probeType;
            }
        } catch (Exception ignored) {}

        return MediaTypeFactory.getMediaType(fileName)
                .map(MediaType::toString)
                .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    }
}
