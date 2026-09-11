package com.educonnect.backend.service;

import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.Syllabus;
import com.educonnect.backend.entity.SyllabusUnit;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final SyllabusUnitRepository syllabusUnitRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentSyllabus(String enrollmentNo) {
        String cleanIdentifier = enrollmentNo != null && !enrollmentNo.trim().isEmpty()
                ? enrollmentNo.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        List<Subject> studentSubjects = studentService.getSubjectsForStudent(cleanIdentifier);
        if (studentSubjects.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Subject sub : studentSubjects) {
            Map<String, Object> map = new HashMap<>();
            String subjIdStr = sub.getSubjectId() != null ? sub.getSubjectId().toString() : "";
            map.put("subject_id", subjIdStr);
            map.put("id", subjIdStr);
            map.put("subject_code", sub.getSubjectCode() != null ? sub.getSubjectCode() : "");
            map.put("code", sub.getSubjectCode() != null ? sub.getSubjectCode() : "");
            map.put("subject_name", sub.getSubjectName() != null ? sub.getSubjectName() : "");
            map.put("name", sub.getSubjectName() != null ? sub.getSubjectName() : "");
            map.put("credits", sub.getCredits() != null ? sub.getCredits() : 4);

            Optional<Syllabus> sylOpt = syllabusRepository.findBySubjectId(sub.getSubjectId());
            if (sylOpt.isPresent() && Boolean.TRUE.equals(sylOpt.get().getIsPublished())) {
                Syllabus syl = sylOpt.get();
                String sylIdStr = syl.getSyllabusId() != null ? syl.getSyllabusId().toString() : "";
                map.put("syllabus_id", sylIdStr);
                map.put("title", syl.getTitle() != null ? syl.getTitle() : sub.getSubjectName() + " Syllabus");
                map.put("has_syllabus", true);

                if (syl.getStorageKey() != null && !syl.getStorageKey().trim().isEmpty()) {
                    String filePath = "/api/v1/syllabus/" + sylIdStr + "/file";
                    map.put("file_path", filePath);
                    map.put("file_name", syl.getFileName() != null ? syl.getFileName() : "syllabus.pdf");
                } else {
                    map.put("file_path", null);
                    map.put("file_name", null);
                }

                List<SyllabusUnit> dbUnits = syllabusUnitRepository.findBySyllabusIdOrderByUnitNumberAsc(syl.getSyllabusId());
                List<Map<String, Object>> unitList = new ArrayList<>();
                for (SyllabusUnit u : dbUnits) {
                    Map<String, Object> uMap = new HashMap<>();
                    uMap.put("unit_id", u.getUnitId() != null ? u.getUnitId().toString() : "");
                    uMap.put("unit_number", u.getUnitNumber() != null ? u.getUnitNumber() : 1);
                    uMap.put("unit_title", u.getUnitTitle() != null ? u.getUnitTitle() : "");
                    uMap.put("title", u.getUnitTitle() != null ? u.getUnitTitle() : "");
                    uMap.put("description", u.getDescription() != null ? u.getDescription() : "");
                    uMap.put("topics", u.getTopics() != null ? u.getTopics() : "");
                    unitList.add(uMap);
                }
                map.put("units", unitList);
            } else {
                map.put("syllabus_id", null);
                map.put("has_syllabus", false);
                map.put("file_path", null);
                map.put("file_name", null);
                map.put("units", Collections.emptyList());
            }
            list.add(map);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherSyllabus(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> subjectIds = allocations.stream()
                .map(TeacherSubject::getSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (subjectIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        List<Map<String, Object>> list = new ArrayList<>();

        for (Subject sub : subjects) {
            Map<String, Object> map = new HashMap<>();
            String subjIdStr = sub.getSubjectId() != null ? sub.getSubjectId().toString() : "";
            map.put("subject_id", subjIdStr);
            map.put("subject_code", sub.getSubjectCode() != null ? sub.getSubjectCode() : "");
            map.put("subject_name", sub.getSubjectName() != null ? sub.getSubjectName() : "");
            map.put("credits", sub.getCredits() != null ? sub.getCredits() : 4);

            Optional<Syllabus> sylOpt = syllabusRepository.findBySubjectId(sub.getSubjectId());
            if (sylOpt.isPresent()) {
                Syllabus syl = sylOpt.get();
                String sylIdStr = syl.getSyllabusId() != null ? syl.getSyllabusId().toString() : "";
                map.put("syllabus_id", sylIdStr);
                map.put("title", syl.getTitle() != null ? syl.getTitle() : "");
                map.put("is_published", syl.getIsPublished() != null ? syl.getIsPublished() : true);
                if (syl.getStorageKey() != null && !syl.getStorageKey().trim().isEmpty()) {
                    String filePath = "/api/v1/syllabus/" + sylIdStr + "/file";
                    map.put("file_path", filePath);
                    map.put("file_name", syl.getFileName() != null ? syl.getFileName() : "syllabus.pdf");
                }

                List<SyllabusUnit> dbUnits = syllabusUnitRepository.findBySyllabusIdOrderByUnitNumberAsc(syl.getSyllabusId());
                List<Map<String, Object>> unitList = new ArrayList<>();
                for (SyllabusUnit u : dbUnits) {
                    Map<String, Object> uMap = new HashMap<>();
                    uMap.put("unit_id", u.getUnitId() != null ? u.getUnitId().toString() : "");
                    uMap.put("unit_number", u.getUnitNumber());
                    uMap.put("unit_title", u.getUnitTitle());
                    uMap.put("description", u.getDescription() != null ? u.getDescription() : "");
                    uMap.put("topics", u.getTopics() != null ? u.getTopics() : "");
                    unitList.add(uMap);
                }
                map.put("units", unitList);
            } else {
                map.put("syllabus_id", null);
                map.put("units", Collections.emptyList());
            }
            list.add(map);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> saveSyllabus(String identifier, UUID subjectId, String unitsJson, MultipartFile file) {
        return saveTeacherSyllabus(subjectId, null, unitsJson, file, identifier);
    }

    @Transactional(readOnly = true)
    public Resource loadSyllabusFileResource(UUID syllabusId, String userEmail) {
        ResponseEntity<Resource> response = getSyllabusFileResource(syllabusId, false);
        return response.getBody();
    }

    @Transactional
    public Map<String, Object> saveTeacherSyllabus(
            UUID subjectId,
            String title,
            String unitsJson,
            MultipartFile file,
            String identifier) {

        if (subjectId == null) {
            throw new IllegalArgumentException("Subject ID is required.");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with id: " + subjectId));

        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        boolean allocated = allocations.stream().anyMatch(a -> Objects.equals(a.getSubjectId(), subjectId));
        if (!allocated && !SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("Access denied: Subject not allocated to authenticated teacher.");
        }

        Syllabus syllabus = syllabusRepository.findBySubjectId(subjectId)
                .orElseGet(() -> {
                    Syllabus s = new Syllabus();
                    s.setSubjectId(subjectId);
                    return s;
                });

        syllabus.setTeacherId(teacher.getTeacherId());
        syllabus.setDepartmentId(subject.getDepartmentId());
        syllabus.setSemesterId(subject.getSemesterId());
        syllabus.setTitle(title != null && !title.trim().isEmpty() ? title.trim() : subject.getSubjectName() + " Syllabus");
        syllabus.setIsPublished(true);

        if (file != null && !file.isEmpty()) {
            FileStorageService.StoredFileMetaData meta = fileStorageService.storeFile(file, "syllabus");
            syllabus.setFileName(meta.getFileName());
            syllabus.setFileType(meta.getFileType());
            syllabus.setFileSize(meta.getFileSize());
            syllabus.setStorageKey(meta.getStorageKey());
        }

        Syllabus saved = syllabusRepository.save(syllabus);
        String filePath = "/api/v1/syllabus/" + saved.getSyllabusId() + "/file";
        saved.setFilePath(filePath);
        syllabusRepository.save(saved);

        if (unitsJson != null && !unitsJson.trim().isEmpty()) {
            try {
                List<Map<String, Object>> unitMaps = objectMapper.readValue(unitsJson, new TypeReference<List<Map<String, Object>>>() {});
                syllabusUnitRepository.deleteBySyllabusId(saved.getSyllabusId());

                int idx = 1;
                for (Map<String, Object> uItem : unitMaps) {
                    String unitTitle = (String) uItem.get("unit_title");
                    if (unitTitle == null || unitTitle.trim().isEmpty()) {
                        unitTitle = (String) uItem.get("title");
                    }
                    if (unitTitle == null || unitTitle.trim().isEmpty()) {
                        unitTitle = "Unit " + idx;
                    }

                    int unitNo = idx;
                    if (uItem.get("unit_number") != null) {
                        Object unObj = uItem.get("unit_number");
                        if (unObj instanceof Number) unitNo = ((Number) unObj).intValue();
                        else {
                            try { unitNo = Integer.parseInt(String.valueOf(unObj)); } catch (Exception ignored) {}
                        }
                    }

                    SyllabusUnit u = new SyllabusUnit();
                    u.setSyllabusId(saved.getSyllabusId());
                    u.setUnitNumber(unitNo);
                    u.setUnitTitle(unitTitle.trim());
                    u.setDescription(uItem.get("description") != null ? String.valueOf(uItem.get("description")).trim() : "");
                    u.setTopics(uItem.get("topics") != null ? String.valueOf(uItem.get("topics")).trim() : "");
                    syllabusUnitRepository.save(u);
                    idx++;
                }
            } catch (Exception e) {
                log.error("Failed to parse and save syllabus units JSON: {}", e.getMessage(), e);
                throw new IllegalArgumentException("Invalid syllabus units JSON data format.");
            }
        }

        return mapSyllabusToResponse(saved, subject);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getSyllabusFileResource(UUID syllabusId, boolean isDownload) {
        if (!SecurityUtils.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to access syllabus file.");
        }

        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new NoSuchElementException("Syllabus not found with id: " + syllabusId));

        validateSyllabusAccess(syllabus);

        String storageKey = syllabus.getStorageKey();
        String originalFileName = syllabus.getFileName() != null ? syllabus.getFileName() : "syllabus.pdf";

        if (storageKey == null || storageKey.trim().isEmpty()) {
            throw new IllegalStateException("No file attachment is associated with this syllabus.");
        }

        try {
            Path resolvedPath = fileStorageService.resolveAndValidatePath(storageKey);
            Resource resource = new FileSystemResource(resolvedPath);

            String contentType = syllabus.getFileType();
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
            log.error("Error serving syllabus file {}: {}", storageKey, e.getMessage(), e);
            throw new RuntimeException("Unable to read syllabus file.", e);
        }
    }

    private void validateSyllabusAccess(Syllabus syllabus) {
        if (SecurityUtils.isAdmin() || SecurityUtils.isTeacher()) {
            return;
        }

        String userIdentifier = SecurityUtils.getCurrentUserIdentifier();
        if (userIdentifier == null) {
            throw new AccessDeniedException("Unauthorized user context.");
        }

        if (SecurityUtils.isStudent()) {
            Student student = studentRepository.findByEnrollmentNo(userIdentifier)
                    .or(() -> studentRepository.findByEmail(userIdentifier))
                    .orElse(null);

            if (student == null) {
                throw new AccessDeniedException("Student identity not found.");
            }

            if (syllabus.getDepartmentId() != null && student.getDepartmentId() != null &&
                    !syllabus.getDepartmentId().equals(student.getDepartmentId())) {
                throw new AccessDeniedException("Out-of-scope department syllabus download denied.");
            }
            if (syllabus.getSemesterId() != null && student.getSemesterId() != null &&
                    !syllabus.getSemesterId().equals(student.getSemesterId())) {
                throw new AccessDeniedException("Out-of-scope semester syllabus download denied.");
            }
            return;
        }

        throw new AccessDeniedException("Role not authorized to access this syllabus file.");
    }

    private Map<String, Object> mapSyllabusToResponse(Syllabus syl, Subject sub) {
        Map<String, Object> map = new HashMap<>();
        String sylIdStr = syl.getSyllabusId() != null ? syl.getSyllabusId().toString() : "";
        map.put("syllabus_id", sylIdStr);
        map.put("subject_id", sub.getSubjectId() != null ? sub.getSubjectId().toString() : "");
        map.put("subject_code", sub.getSubjectCode() != null ? sub.getSubjectCode() : "");
        map.put("subject_name", sub.getSubjectName() != null ? sub.getSubjectName() : "");
        map.put("credits", sub.getCredits() != null ? sub.getCredits() : 4);
        map.put("title", syl.getTitle() != null ? syl.getTitle() : "");
        map.put("is_published", syl.getIsPublished() != null ? syl.getIsPublished() : true);

        if (syl.getStorageKey() != null && !syl.getStorageKey().trim().isEmpty()) {
            String filePath = "/api/v1/syllabus/" + sylIdStr + "/file";
            map.put("file_path", filePath);
            map.put("file_name", syl.getFileName() != null ? syl.getFileName() : "syllabus.pdf");
        }

        List<SyllabusUnit> dbUnits = syllabusUnitRepository.findBySyllabusIdOrderByUnitNumberAsc(syl.getSyllabusId());
        List<Map<String, Object>> unitList = new ArrayList<>();
        for (SyllabusUnit u : dbUnits) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("unit_id", u.getUnitId() != null ? u.getUnitId().toString() : "");
            uMap.put("unit_number", u.getUnitNumber());
            uMap.put("unit_title", u.getUnitTitle());
            uMap.put("description", u.getDescription() != null ? u.getDescription() : "");
            uMap.put("topics", u.getTopics() != null ? u.getTopics() : "");
            unitList.add(uMap);
        }
        map.put("units", unitList);
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
