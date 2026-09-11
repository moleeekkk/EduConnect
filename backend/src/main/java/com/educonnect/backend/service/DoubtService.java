package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoubtService {

    private final DoubtRepository doubtRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final StudentService studentService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentDoubts(String identifier) {
        Student student = resolveStudentByIdentifier(identifier);
        List<Doubt> doubts = doubtRepository.findByStudentIdOrderByCreatedAtDesc(student.getStudentId());

        if (doubts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> subjectIds = doubts.stream().map(Doubt::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        Set<UUID> teacherIds = doubts.stream().map(Doubt::getTeacherId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Teacher> teacherMap = teacherRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(Teacher::getTeacherId, t -> t));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Doubt d : doubts) {
            result.add(mapDoubtToStudentMap(d, subjectMap.get(d.getSubjectId()), teacherMap.get(d.getTeacherId())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createStudentDoubt(String identifier, Map<String, Object> body) {
        Student student = resolveStudentByIdentifier(identifier);

        String title = parseString(body.get("title"));
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Doubt title is required.");
        }
        if (title.trim().length() > 255) {
            throw new IllegalArgumentException("Title exceeds maximum length of 255 characters.");
        }

        String description = parseString(body.get("description"));
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Detailed description is required.");
        }
        if (description.trim().length() > 5000) {
            throw new IllegalArgumentException("Description exceeds maximum length of 5000 characters.");
        }

        UUID rawSubjectId = parseUuid(body.get("subject_id"));
        if (rawSubjectId == null) {
            rawSubjectId = parseUuid(body.get("subjectId"));
        }
        if (rawSubjectId == null) {
            // Check fallback subject lists for student
            List<Subject> studentSubs = studentService.getSubjectsForStudent(student.getEnrollmentNo());
            if (!studentSubs.isEmpty()) {
                rawSubjectId = studentSubs.get(0).getSubjectId();
            }
        }

        if (rawSubjectId == null) {
            throw new IllegalArgumentException("Target subject is required.");
        }
        final UUID subjectId = rawSubjectId;

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with id: " + subjectId));

        // Resolve allocated teacher for this subject and student cohort
        Teacher teacher = resolveAllocatedTeacher(subjectId, student);

        Doubt doubt = Doubt.builder()
                .studentId(student.getStudentId())
                .teacherId(teacher != null ? teacher.getTeacherId() : null)
                .subjectId(subjectId)
                .departmentId(student.getDepartmentId())
                .semesterId(student.getSemesterId())
                .title(title.trim())
                .description(description.trim())
                .status("Pending")
                .build();

        Doubt saved = doubtRepository.save(doubt);
        return mapDoubtToStudentMap(saved, subject, teacher);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherDoubts(String identifier) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        List<UUID> allocatedSubjectIds = allocations.stream()
                .map(TeacherSubject::getSubjectId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Doubt> doubts;
        if (!allocatedSubjectIds.isEmpty()) {
            doubts = doubtRepository.findBySubjectIdInOrderByCreatedAtDesc(allocatedSubjectIds);
        } else {
            doubts = doubtRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getTeacherId());
        }

        if (doubts.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> studentIds = doubts.stream().map(Doubt::getStudentId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getStudentId, s -> s));

        Set<UUID> subjectIds = doubts.stream().map(Doubt::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Doubt d : doubts) {
            result.add(mapDoubtToTeacherMap(d, studentMap.get(d.getStudentId()), subjectMap.get(d.getSubjectId())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> replyTeacherDoubt(String identifier, UUID doubtId, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new NoSuchElementException("Doubt not found with id: " + doubtId));

        validateTeacherAccessToDoubt(teacher.getTeacherId(), doubt);

        String replyText = parseString(body.get("reply"));
        if (replyText == null) {
            replyText = parseString(body.get("replyText"));
        }

        if (replyText == null || replyText.trim().isEmpty()) {
            throw new IllegalArgumentException("Reply explanation cannot be blank.");
        }
        if (replyText.trim().length() > 5000) {
            throw new IllegalArgumentException("Reply text exceeds maximum length of 5000 characters.");
        }

        doubt.setTeacherId(teacher.getTeacherId());
        doubt.setReply(replyText.trim());
        doubt.setRepliedAt(LocalDateTime.now());
        doubt.setStatus("Answered");

        Doubt updated = doubtRepository.save(doubt);

        Student student = studentRepository.findById(updated.getStudentId()).orElse(null);
        Subject subject = subjectRepository.findById(updated.getSubjectId()).orElse(null);

        return mapDoubtToTeacherMap(updated, student, subject);
    }

    private Teacher resolveAllocatedTeacher(UUID subjectId, Student student) {
        List<TeacherSubject> allocations = teacherSubjectRepository.findBySubjectId(subjectId);
        if (allocations.isEmpty()) {
            return null;
        }

        // Try exact cohort match first
        for (TeacherSubject ts : allocations) {
            if (Boolean.TRUE.equals(ts.getIsActive())) {
                if (student.getBatchId() != null && student.getBatchId().equals(ts.getBatchId())) {
                    return teacherRepository.findById(ts.getTeacherId()).orElse(null);
                }
            }
        }

        // Fallback to active teacher for subject
        for (TeacherSubject ts : allocations) {
            if (Boolean.TRUE.equals(ts.getIsActive())) {
                return teacherRepository.findById(ts.getTeacherId()).orElse(null);
            }
        }
        return null;
    }

    private void validateTeacherAccessToDoubt(UUID teacherId, Doubt doubt) {
        if (SecurityUtils.isAdmin()) return;

        if (teacherId.equals(doubt.getTeacherId())) return;

        if (doubt.getSubjectId() != null) {
            List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
            boolean allocated = allocations.stream().anyMatch(a -> Objects.equals(a.getSubjectId(), doubt.getSubjectId()));
            if (allocated) return;
        }

        throw new AccessDeniedException("Access denied: Doubt is not assigned to or allocated to the responding teacher.");
    }

    private Student resolveStudentByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> opt = studentRepository.findByEnrollmentNo(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = studentRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return studentRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Student record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Student record not found for: " + cleanId);
        }
    }

    private Teacher resolveTeacherByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Teacher> opt = teacherRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = teacherRepository.findByEmployeeId(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return teacherRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Teacher record not found for: " + cleanId);
        }
    }

    private Map<String, Object> mapDoubtToStudentMap(Doubt d, Subject s, Teacher t) {
        Map<String, Object> map = new HashMap<>();
        String dIdStr = d.getDoubtId().toString();
        map.put("doubt_id", dIdStr);
        map.put("id", dIdStr);
        map.put("student_id", d.getStudentId().toString());
        map.put("subject_id", d.getSubjectId() != null ? d.getSubjectId().toString() : "");
        map.put("subject_code", s != null && s.getSubjectCode() != null ? s.getSubjectCode() : "");
        map.put("subject_name", s != null && s.getSubjectName() != null ? s.getSubjectName() : "General Query");
        map.put("teacher_name", t != null ? (t.getFirstName() + " " + t.getLastName()).trim() : "Faculty Mentor");
        map.put("title", d.getTitle());
        map.put("description", d.getDescription());
        map.put("reply", d.getReply());
        map.put("replied_at", d.getRepliedAt() != null ? d.getRepliedAt().toString() : null);
        map.put("status", d.getStatus() != null ? d.getStatus() : "Pending");
        map.put("created_at", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapDoubtToTeacherMap(Doubt d, Student stu, Subject s) {
        Map<String, Object> map = new HashMap<>();
        String dIdStr = d.getDoubtId().toString();
        map.put("doubt_id", dIdStr);
        map.put("id", dIdStr);
        map.put("student_id", d.getStudentId().toString());
        map.put("student_name", stu != null ? (stu.getFirstName() + " " + stu.getLastName()).trim() : "Student");
        map.put("enrollment_no", stu != null && stu.getEnrollmentNo() != null ? stu.getEnrollmentNo() : "");
        map.put("subject_id", d.getSubjectId() != null ? d.getSubjectId().toString() : "");
        map.put("subject_code", s != null && s.getSubjectCode() != null ? s.getSubjectCode() : "");
        map.put("subject_name", s != null && s.getSubjectName() != null ? s.getSubjectName() : "Subject");
        map.put("title", d.getTitle());
        map.put("description", d.getDescription());
        map.put("reply", d.getReply());
        map.put("replied_at", d.getRepliedAt() != null ? d.getRepliedAt().toString() : null);
        map.put("status", d.getStatus() != null ? d.getStatus() : "Pending");
        map.put("created_at", d.getCreatedAt() != null ? d.getCreatedAt().toString() : "");
        return map;
    }

    private String parseString(Object obj) {
        if (obj == null) return null;
        String s = String.valueOf(obj);
        return s.trim().isEmpty() ? null : s.trim();
    }

    private UUID parseUuid(Object obj) {
        if (obj == null) return null;
        String str = String.valueOf(obj).trim();
        if (str.isEmpty()) return null;
        try {
            return UUID.fromString(str);
        } catch (Exception e) {
            return null;
        }
    }
}
