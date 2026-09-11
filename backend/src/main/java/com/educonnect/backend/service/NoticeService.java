package com.educonnect.backend.service;

import com.educonnect.backend.entity.Notice;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.NoticeRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.repository.TeacherSubjectRepository;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;

    @Transactional
    public Notice createNotice(Notice notice, String authorIdentifier, String userRole) {
        String cleanIdentifier = (authorIdentifier != null && !authorIdentifier.trim().isEmpty())
                ? authorIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Author identity is required to create a notice.");
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole);
        boolean isTeacher = "TEACHER".equalsIgnoreCase(userRole);

        UUID authorId = null;
        String authorName = "System Admin";

        if (isTeacher) {
            Optional<Teacher> teacherOpt = teacherRepository.findByEmployeeId(cleanIdentifier);
            if (teacherOpt.isEmpty()) {
                teacherOpt = teacherRepository.findByEmail(cleanIdentifier);
            }
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                authorId = t.getTeacherId();
                authorName = ((t.getFirstName() != null ? t.getFirstName() : "") + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
            } else {
                authorId = UUID.nameUUIDFromBytes(cleanIdentifier.getBytes());
                authorName = "Teacher (" + cleanIdentifier + ")";
            }

            // Enforce Prompt Rule: Reject teacher attempts to publish institute-wide / admin-only notices!
            String target = notice.getTargetRole() != null ? notice.getTargetRole().trim().toUpperCase() : "";
            if ("ALL".equalsIgnoreCase(target) || "INSTITUTE".equalsIgnoreCase(target) || (notice.getDepartmentId() == null && notice.getBatchId() == null && notice.getTeacherSubjectId() == null)) {
                throw new IllegalArgumentException("Teachers are forbidden from publishing institute-wide notices. Target must specify an allocated cohort.");
            }
            notice.setAuthorRole("TEACHER");
        } else if (isAdmin) {
            authorId = UUID.nameUUIDFromBytes(cleanIdentifier.getBytes());
            authorName = "Administrator";
            notice.setAuthorRole("ADMIN");
        } else {
            authorId = UUID.nameUUIDFromBytes(cleanIdentifier.getBytes());
            authorName = cleanIdentifier;
            notice.setAuthorRole(userRole != null ? userRole : "ADMIN");
        }

        notice.setAuthorId(authorId);
        notice.setAuthorName(authorName);
        if (notice.getPublishDate() == null) {
            notice.setPublishDate(LocalDateTime.now());
        }
        if (notice.getIsActive() == null) notice.setIsActive(true);
        if (notice.getIsArchived() == null) notice.setIsArchived(false);

        return noticeRepository.save(notice);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNoticesForStudent(String studentIdentifier) {
        String cleanIdentifier = (studentIdentifier != null && !studentIdentifier.trim().isEmpty())
                ? studentIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> studentOpt = Optional.empty();
        if (cleanIdentifier != null && !cleanIdentifier.isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(cleanIdentifier);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(cleanIdentifier);
            }
        }

        UUID deptId = studentOpt.map(Student::getDepartmentId).orElse(null);
        UUID batchId = studentOpt.map(Student::getBatchId).orElse(null);

        LocalDateTime now = LocalDateTime.now();
        List<Notice> activeNotices = noticeRepository.findActiveUnexpiredNotices(now);

        return activeNotices.stream()
                .filter(n -> {
                    String target = n.getTargetRole() != null ? n.getTargetRole().toUpperCase() : "ALL";
                    if ("TEACHER".equals(target)) return false;

                    if (n.getDepartmentId() != null && !Objects.equals(n.getDepartmentId(), deptId)) {
                        return false;
                    }
                    if (n.getBatchId() != null && !Objects.equals(n.getBatchId(), batchId)) {
                        return false;
                    }
                    return true;
                })
                .map(this::mapNoticeToResponseMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNoticesForTeacher(String teacherIdentifier) {
        String cleanIdentifier = (teacherIdentifier != null && !teacherIdentifier.trim().isEmpty())
                ? teacherIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        UUID teacherId = null;
        if (cleanIdentifier != null && !cleanIdentifier.isEmpty()) {
            Optional<Teacher> teacherOpt = teacherRepository.findByEmployeeId(cleanIdentifier);
            if (teacherOpt.isEmpty()) {
                teacherOpt = teacherRepository.findByEmail(cleanIdentifier);
            }
            if (teacherOpt.isPresent()) {
                teacherId = teacherOpt.get().getTeacherId();
            }
        }

        final UUID finalTeacherId = teacherId;
        LocalDateTime now = LocalDateTime.now();
        List<Notice> activeNotices = noticeRepository.findAllActiveNotices();

        return activeNotices.stream()
                .filter(n -> {
                    if (n.getAuthorId() != null && Objects.equals(n.getAuthorId(), finalTeacherId)) {
                        return true;
                    }
                    if (Boolean.TRUE.equals(n.getIsArchived()) || !Boolean.TRUE.equals(n.getIsActive())) {
                        return false;
                    }
                    if (n.getPublishDate() != null && n.getPublishDate().isAfter(now)) {
                        return false;
                    }
                    if (n.getExpiryDate() != null && n.getExpiryDate().isBefore(now)) {
                        return false;
                    }
                    String target = n.getTargetRole() != null ? n.getTargetRole().toUpperCase() : "ALL";
                    return "ALL".equals(target) || "TEACHER".equals(target) || "INSTITUTE".equals(target);
                })
                .map(this::mapNoticeToResponseMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNoticesForAdmin() {
        return noticeRepository.findAll().stream()
                .sorted(Comparator.comparing(Notice::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapNoticeToResponseMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public Notice updateNotice(UUID noticeId, Notice updated, String authorIdentifier, String userRole) {
        Notice existing = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found with ID: " + noticeId));

        if (updated.getTitle() != null && !updated.getTitle().trim().isEmpty()) {
            existing.setTitle(updated.getTitle());
        }
        if (updated.getDescription() != null && !updated.getDescription().trim().isEmpty()) {
            existing.setDescription(updated.getDescription());
        }
        if (updated.getTargetRole() != null) {
            existing.setTargetRole(updated.getTargetRole());
        }
        if (updated.getDepartmentId() != null) existing.setDepartmentId(updated.getDepartmentId());
        if (updated.getBatchId() != null) existing.setBatchId(updated.getBatchId());
        if (updated.getExpiryDate() != null) existing.setExpiryDate(updated.getExpiryDate());
        if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
        if (updated.getIsArchived() != null) existing.setIsArchived(updated.getIsArchived());

        return noticeRepository.save(existing);
    }

    @Transactional
    public Notice archiveNotice(UUID noticeId, String authorIdentifier, String userRole) {
        Notice existing = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found with ID: " + noticeId));
        existing.setIsArchived(true);
        existing.setIsActive(false);
        return noticeRepository.save(existing);
    }

    private Map<String, Object> mapNoticeToResponseMap(Notice n) {
        Map<String, Object> map = new HashMap<>();
        map.put("notice_id", n.getNoticeId() != null ? n.getNoticeId().toString() : "");
        map.put("id", n.getNoticeId() != null ? n.getNoticeId().toString() : "");
        map.put("title", n.getTitle() != null ? n.getTitle() : "");
        map.put("description", n.getDescription() != null ? n.getDescription() : "");
        map.put("author_id", n.getAuthorId() != null ? n.getAuthorId().toString() : "");
        map.put("author_role", n.getAuthorRole() != null ? n.getAuthorRole() : "");
        map.put("author_name", n.getAuthorName() != null ? n.getAuthorName() : "");
        map.put("target_role", n.getTargetRole() != null ? n.getTargetRole() : "ALL");
        map.put("department_id", n.getDepartmentId() != null ? n.getDepartmentId().toString() : null);
        map.put("batch_id", n.getBatchId() != null ? n.getBatchId().toString() : null);
        map.put("publish_date", n.getPublishDate() != null ? n.getPublishDate().toString() : "");
        map.put("date", n.getPublishDate() != null ? n.getPublishDate().toLocalDate().toString() : "");
        map.put("expiry_date", n.getExpiryDate() != null ? n.getExpiryDate().toString() : null);
        map.put("is_active", Boolean.TRUE.equals(n.getIsActive()));
        map.put("is_archived", Boolean.TRUE.equals(n.getIsArchived()));
        map.put("created_at", n.getCreatedAt() != null ? n.getCreatedAt().toString() : "");
        return map;
    }
}
