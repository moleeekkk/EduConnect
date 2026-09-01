package com.educonnect.backend.service;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.SubjectRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.repository.TeacherSubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignmentsForTeacher(String identifier) {
        List<Assignment> assignments = assignmentRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Assignment a : assignments) {
            Map<String, Object> map = new HashMap<>();
            map.put("assignment_id", a.getAssignmentId() != null ? a.getAssignmentId().toString() : "");
            map.put("teacher_subject_id", a.getTeacherSubjectId() != null ? a.getTeacherSubjectId().toString() : "");
            map.put("subject_id", a.getSubjectId() != null ? a.getSubjectId().toString() : "");
            map.put("title", a.getTitle() != null ? a.getTitle() : "");
            map.put("description", a.getDescription() != null ? a.getDescription() : "");
            map.put("due_date", a.getDueDate() != null ? a.getDueDate().toString() : "");
            map.put("total_marks", a.getTotalMarks() != null ? a.getTotalMarks() : 50);
            map.put("attachment", a.getAttachment() != null ? a.getAttachment() : "");
            map.put("created_at", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");

            if (a.getSubjectId() != null) {
                subjectRepository.findById(a.getSubjectId()).ifPresent(sub -> {
                    map.put("subject_code", sub.getSubjectCode());
                    map.put("subject_name", sub.getSubjectName());
                });
            }
            list.add(map);
        }
        return list;
    }

    @Transactional
    public Assignment createAssignment(Map<String, Object> reqData) {
        Assignment assignment = new Assignment();
        assignment.setTitle((String) reqData.get("title"));
        assignment.setDescription((String) reqData.get("description"));

        if (reqData.get("due_date") != null) {
            try {
                assignment.setDueDate(LocalDate.parse((String) reqData.get("due_date")));
            } catch (Exception e) {
                assignment.setDueDate(LocalDate.now().plusDays(7));
            }
        } else {
            assignment.setDueDate(LocalDate.now().plusDays(7));
        }

        if (reqData.get("total_marks") != null) {
            Object marksObj = reqData.get("total_marks");
            if (marksObj instanceof Number) assignment.setTotalMarks(((Number) marksObj).intValue());
            else if (marksObj instanceof String) {
                try { assignment.setTotalMarks(Integer.parseInt((String) marksObj)); } catch (Exception ignored) {}
            }
        }
        if (assignment.getTotalMarks() == null) assignment.setTotalMarks(50);

        assignment.setAttachment((String) reqData.get("attachment"));

        if (reqData.get("subject_id") != null && !((String) reqData.get("subject_id")).trim().isEmpty()) {
            try {
                assignment.setSubjectId(UUID.fromString((String) reqData.get("subject_id")));
            } catch (Exception ignored) {}
        }

        if (reqData.get("teacher_subject_id") != null && !((String) reqData.get("teacher_subject_id")).trim().isEmpty()) {
            try {
                assignment.setTeacherSubjectId(UUID.fromString((String) reqData.get("teacher_subject_id")));
            } catch (Exception ignored) {}
        }
        if (assignment.getTeacherSubjectId() == null) {
            assignment.setTeacherSubjectId(UUID.randomUUID());
        }

        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment updateAssignment(UUID id, Map<String, Object> reqData) {
        Optional<Assignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            Assignment assignment = opt.get();
            if (reqData.containsKey("title")) assignment.setTitle((String) reqData.get("title"));
            if (reqData.containsKey("description")) assignment.setDescription((String) reqData.get("description"));
            if (reqData.get("due_date") != null) {
                try {
                    assignment.setDueDate(LocalDate.parse((String) reqData.get("due_date")));
                } catch (Exception ignored) {}
            }
            if (reqData.get("total_marks") != null) {
                Object marksObj = reqData.get("total_marks");
                if (marksObj instanceof Number) assignment.setTotalMarks(((Number) marksObj).intValue());
                else if (marksObj instanceof String) {
                    try { assignment.setTotalMarks(Integer.parseInt((String) marksObj)); } catch (Exception ignored) {}
                }
            }
            if (reqData.containsKey("attachment")) assignment.setAttachment((String) reqData.get("attachment"));
            if (reqData.get("subject_id") != null) {
                try {
                    assignment.setSubjectId(UUID.fromString((String) reqData.get("subject_id")));
                } catch (Exception ignored) {}
            }
            return assignmentRepository.save(assignment);
        }
        return null;
    }

    @Transactional
    public void deleteAssignment(UUID id) {
        assignmentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Subject> getAssignedSubjectsForTeacher(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return subjectRepository.findAll();
        }

        Optional<Teacher> teacherOpt = Optional.empty();
        String clean = identifier.trim();
        try {
            UUID uuid = UUID.fromString(clean);
            teacherOpt = teacherRepository.findById(uuid);
        } catch (IllegalArgumentException ignored) {}

        if (teacherOpt.isEmpty()) {
            teacherOpt = teacherRepository.findByEmail(clean.toLowerCase());
        }

        if (teacherOpt.isPresent()) {
            UUID teacherId = teacherOpt.get().getTeacherId();
            List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherId(teacherId);
            if (allocations.isEmpty()) {
                return subjectRepository.findAll();
            }

            List<UUID> assignedSubjectIds = allocations.stream()
                    .filter(ts -> Boolean.TRUE.equals(ts.getIsActive()))
                    .map(TeacherSubject::getSubjectId)
                    .filter(Objects::nonNull)
                    .toList();

            if (assignedSubjectIds.isEmpty()) {
                return subjectRepository.findAll();
            }

            return subjectRepository.findAllById(assignedSubjectIds);
        }

        return subjectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> getTeacherById(UUID id) {
        return teacherRepository.findById(id);
    }

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        teacher.setTeacherId(null); // Ensure Hibernate performs INSERT with generated UUID
        if (teacher.getIsActive() == null) {
            teacher.setIsActive(true);
        }
        String rawPass = (teacher.getPassword() == null || teacher.getPassword().trim().isEmpty())
                ? "teacher123"
                : teacher.getPassword().trim();
        teacher.setPassword(passwordEncoder.encode(rawPass));
        if (teacher.getFirstName() == null || teacher.getFirstName().trim().isEmpty()) {
            teacher.setFirstName("Faculty");
        }
        if (teacher.getLastName() == null) {
            teacher.setLastName("");
        }
        if (teacher.getEmployeeId() == null || teacher.getEmployeeId().trim().isEmpty()) {
            teacher.setEmployeeId("EMP" + (System.currentTimeMillis() % 100000));
        }
        if (teacher.getEmail() == null || teacher.getEmail().trim().isEmpty() || !teacher.getEmail().contains("@")) {
            teacher.setEmail("teacher" + (System.currentTimeMillis() % 10000) + "@educonnect.ac.in");
        } else if (teacherRepository.existsByEmail(teacher.getEmail())) {
            String[] parts = teacher.getEmail().split("@");
            teacher.setEmail(parts[0] + "+" + (System.currentTimeMillis() % 10000) + "@" + (parts.length > 1 ? parts[1] : "educonnect.ac.in"));
        }
        if (teacher.getMobile() == null || teacher.getMobile().trim().isEmpty()) teacher.setMobile("N/A");
        if (teacher.getGender() == null || teacher.getGender().trim().isEmpty()) teacher.setGender("Male");
        if (teacher.getDesignation() == null || teacher.getDesignation().trim().isEmpty()) teacher.setDesignation("Assistant Professor");
        if (teacher.getQualification() == null) teacher.setQualification("");
        if (teacher.getExperience() == null) teacher.setExperience(0);
        if (teacher.getAddress() == null) teacher.setAddress("");
        if (teacher.getCreatedAt() == null) teacher.setCreatedAt(java.time.LocalDateTime.now());
        if (teacher.getUpdatedAt() == null) teacher.setUpdatedAt(java.time.LocalDateTime.now());

        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(UUID id, Teacher updatedTeacher) {
        return teacherRepository.findById(id).map(existing -> {
            if (updatedTeacher.getEmployeeId() != null && !updatedTeacher.getEmployeeId().trim().isEmpty()) {
                existing.setEmployeeId(updatedTeacher.getEmployeeId());
            }
            if (updatedTeacher.getFirstName() != null && !updatedTeacher.getFirstName().trim().isEmpty()) {
                existing.setFirstName(updatedTeacher.getFirstName());
            }
            if (updatedTeacher.getLastName() != null) {
                existing.setLastName(updatedTeacher.getLastName());
            }
            if (updatedTeacher.getSurname() != null) {
                existing.setSurname(updatedTeacher.getSurname());
            }
            if (updatedTeacher.getEmail() != null && !updatedTeacher.getEmail().trim().isEmpty() && !updatedTeacher.getEmail().equals(existing.getEmail())) {
                if (teacherRepository.existsByEmail(updatedTeacher.getEmail())) {
                    String[] parts = updatedTeacher.getEmail().split("@");
                    existing.setEmail(parts[0] + "+" + (System.currentTimeMillis() % 10000) + "@" + (parts.length > 1 ? parts[1] : "educonnect.ac.in"));
                } else {
                    existing.setEmail(updatedTeacher.getEmail());
                }
            }
            if (updatedTeacher.getMobile() != null) existing.setMobile(updatedTeacher.getMobile());
            if (updatedTeacher.getGender() != null) existing.setGender(updatedTeacher.getGender());
            if (updatedTeacher.getDesignation() != null) existing.setDesignation(updatedTeacher.getDesignation());
            if (updatedTeacher.getQualification() != null) existing.setQualification(updatedTeacher.getQualification());
            if (updatedTeacher.getExperience() != null) existing.setExperience(updatedTeacher.getExperience());
            if (updatedTeacher.getJoiningDate() != null) existing.setJoiningDate(updatedTeacher.getJoiningDate());
            if (updatedTeacher.getDateOfBirth() != null) existing.setDateOfBirth(updatedTeacher.getDateOfBirth());
            if (updatedTeacher.getAddress() != null) existing.setAddress(updatedTeacher.getAddress());
            if (updatedTeacher.getProfilePhoto() != null) existing.setProfilePhoto(updatedTeacher.getProfilePhoto());
            if (updatedTeacher.getIsActive() != null) existing.setIsActive(updatedTeacher.getIsActive());
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            return teacherRepository.save(existing);
        }).orElseGet(() -> {
            updatedTeacher.setTeacherId(id);
            if (updatedTeacher.getCreatedAt() == null) updatedTeacher.setCreatedAt(java.time.LocalDateTime.now());
            if (updatedTeacher.getUpdatedAt() == null) updatedTeacher.setUpdatedAt(java.time.LocalDateTime.now());
            return teacherRepository.save(updatedTeacher);
        });
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        teacherRepository.deleteById(id);
    }

    public Map<String, Object> getTeacherDashboard(String teacherId) {
        Map<String, Object> data = new HashMap<>();
        data.put("teacherName", "Faculty Member");
        data.put("department", "Academic Department");
        data.put("assignedCoursesCount", 0);
        data.put("totalStudents", 0);
        data.put("pendingGradingCount", 0);
        data.put("attendanceRate", "0%");
        data.put("todayClasses", Collections.emptyList());

        return data;
    }

    public Map<String, Object> markAttendance(AttendanceMarkRequest request) {
        UUID teacherSubjectId = request.getTeacherSubjectId() != null
                ? request.getTeacherSubjectId()
                : UUID.randomUUID();

        AttendanceSession session = AttendanceSession.builder()
                .teacherSubjectId(teacherSubjectId)
                .sessionDate(LocalDate.now())
                .lectureNo(request.getLectureNo() != null ? request.getLectureNo() : 1)
                .startTime(LocalTime.of(9, 30))
                .endTime(LocalTime.of(11, 0))
                .topic(request.getTopic() != null ? request.getTopic() : "Lecture Session")
                .build();

        AttendanceSession savedSession = sessionRepository.save(session);

        int presentCount = 0;
        int absentCount = 0;

        if (request.getStudentStatuses() != null) {
            for (AttendanceMarkRequest.StudentStatus status : request.getStudentStatuses()) {
                UUID studentId = status.getStudentId() != null ? status.getStudentId() : UUID.randomUUID();
                AttendanceRecord record = AttendanceRecord.builder()
                        .sessionId(savedSession.getSessionId())
                        .studentId(studentId)
                        .attendanceStatus(status.getStatus() != null ? status.getStatus() : "Present")
                        .remarks(status.getRemarks())
                        .build();
                recordRepository.save(record);

                if ("Present".equalsIgnoreCase(status.getStatus())) presentCount++;
                else absentCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Attendance session saved successfully");
        response.put("sessionId", savedSession.getSessionId().toString());
        response.put("totalRecords", request.getStudentStatuses() != null ? request.getStudentStatuses().size() : 0);
        response.put("presentCount", presentCount);
        response.put("absentCount", absentCount);

        return response;
    }

    public List<Map<String, Object>> getPendingGrades(String teacherId) {
        return Collections.emptyList();
    }

    // --- Teacher Subject Allocation Methods ---
    @Transactional(readOnly = true)
    public List<TeacherSubject> getAllTeacherSubjects() {
        return teacherSubjectRepository.findAll();
    }

    @Transactional
    public TeacherSubject assignTeacherSubject(TeacherSubject allocation) {
        Optional<TeacherSubject> existing = teacherSubjectRepository
                .findByTeacherIdAndSubjectId(allocation.getTeacherId(), allocation.getSubjectId());
        if (existing.isPresent()) {
            TeacherSubject ts = existing.get();
            ts.setIsActive(allocation.getIsActive() != null ? allocation.getIsActive() : true);
            return teacherSubjectRepository.save(ts);
        } else {
            allocation.setAllocationId(null);
            if (allocation.getIsActive() == null) {
                allocation.setIsActive(true);
            }
            return teacherSubjectRepository.save(allocation);
        }
    }

    @Transactional
    public void deleteTeacherSubject(UUID allocationId) {
        teacherSubjectRepository.deleteById(allocationId);
    }

    @Transactional
    public Map<String, Object> toggleTeacherSubject(UUID teacherId, UUID subjectId) {
        Optional<TeacherSubject> existing = teacherSubjectRepository
                .findByTeacherIdAndSubjectId(teacherId, subjectId);
        Map<String, Object> res = new HashMap<>();
        if (existing.isPresent()) {
            teacherSubjectRepository.delete(existing.get());
            res.put("assigned", false);
            res.put("message", "Subject unassigned from teacher");
        } else {
            TeacherSubject newAlloc = TeacherSubject.builder()
                    .teacherId(teacherId)
                    .subjectId(subjectId)
                    .isActive(true)
                    .build();
            TeacherSubject saved = teacherSubjectRepository.save(newAlloc);
            res.put("assigned", true);
            res.put("allocation", saved);
            res.put("message", "Subject assigned to teacher successfully");
        }
        return res;
    }

    @Transactional
    public Map<String, Object> changeTeacherPassword(String emailOrId, String currentPassword, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        if (newPassword == null || newPassword.trim().length() < 4) {
            response.put("success", false);
            response.put("message", "New password must be at least 4 characters long.");
            return response;
        }

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(emailOrId);
        if (!teacherOpt.isPresent()) {
            try {
                UUID id = UUID.fromString(emailOrId);
                teacherOpt = teacherRepository.findById(id);
            } catch (Exception e) {
                // Ignore
            }
        }

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            String storedHash = teacher.getPassword();

            boolean currentMatches = false;
            if (storedHash != null && (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$"))) {
                currentMatches = currentPassword != null && passwordEncoder.matches(currentPassword.trim(), storedHash);
            } else {
                String defaultPass = (storedHash != null && !storedHash.trim().isEmpty()) ? storedHash.trim() : "teacher123";
                currentMatches = currentPassword != null && currentPassword.trim().equals(defaultPass);
            }

            if (currentMatches) {
                teacher.setPassword(passwordEncoder.encode(newPassword.trim()));
                teacher.setUpdatedAt(java.time.LocalDateTime.now());
                teacherRepository.save(teacher);

                response.put("success", true);
                response.put("message", "Password changed successfully! Please use your new password for future logins.");
                return response;
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect. Please enter your valid current password.");
                return response;
            }
        }

        response.put("success", false);
        response.put("message", "Teacher account not found.");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherProfile(String identifier) {
        if (identifier != null && !identifier.trim().isEmpty()) {
            String clean = identifier.trim();

            // 1. Try by UUID teacher_id
            try {
                UUID uuid = UUID.fromString(clean);
                Optional<Teacher> tOpt = teacherRepository.findById(uuid);
                if (tOpt.isPresent()) {
                    return convertTeacherToMap(tOpt.get());
                }
            } catch (IllegalArgumentException ignored) {}

            // 2. Try by email
            Optional<Teacher> tOptEmail = teacherRepository.findByEmail(clean.toLowerCase());
            if (tOptEmail.isPresent()) {
                return convertTeacherToMap(tOptEmail.get());
            }
        }

        // 3. Fallback to first teacher record if present
        List<Teacher> all = teacherRepository.findAll();
        if (!all.isEmpty()) {
            return convertTeacherToMap(all.get(0));
        }

        return Collections.emptyMap();
    }

    @Transactional
    public Map<String, Object> updateTeacherProfile(Map<String, Object> updateData) {
        String teacherIdStr = (String) updateData.get("teacher_id");
        String email = (String) updateData.get("email");

        Optional<Teacher> teacherOpt = Optional.empty();
        if (teacherIdStr != null && !teacherIdStr.trim().isEmpty()) {
            try {
                teacherOpt = teacherRepository.findById(UUID.fromString(teacherIdStr));
            } catch (IllegalArgumentException ignored) {}
        }
        if (teacherOpt.isEmpty() && email != null && !email.trim().isEmpty()) {
            teacherOpt = teacherRepository.findByEmail(email.toLowerCase());
        }

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            if (updateData.containsKey("first_name")) teacher.setFirstName((String) updateData.get("first_name"));
            if (updateData.containsKey("last_name")) teacher.setLastName((String) updateData.get("last_name"));
            if (updateData.containsKey("mobile")) teacher.setMobile((String) updateData.get("mobile"));
            if (updateData.containsKey("designation")) teacher.setDesignation((String) updateData.get("designation"));
            if (updateData.containsKey("qualification")) teacher.setQualification((String) updateData.get("qualification"));
            if (updateData.containsKey("address")) teacher.setAddress((String) updateData.get("address"));
            if (updateData.containsKey("profile_photo")) teacher.setProfilePhoto((String) updateData.get("profile_photo"));
            if (updateData.containsKey("experience")) {
                Object expObj = updateData.get("experience");
                if (expObj instanceof Number) teacher.setExperience(((Number) expObj).intValue());
                else if (expObj instanceof String) {
                    try { teacher.setExperience(Integer.parseInt((String) expObj)); } catch (Exception ignored) {}
                }
            }
            teacherRepository.save(teacher);
            return Map.of("success", true, "message", "Profile updated successfully in database");
        }
        return Map.of("success", false, "message", "Teacher not found in database");
    }

    private Map<String, Object> convertTeacherToMap(Teacher t) {
        Map<String, Object> map = new HashMap<>();
        map.put("teacher_id", t.getTeacherId() != null ? t.getTeacherId().toString() : "");
        map.put("employee_id", t.getEmployeeId() != null ? t.getEmployeeId() : "");
        map.put("first_name", t.getFirstName() != null ? t.getFirstName() : "");
        map.put("last_name", t.getLastName() != null ? t.getLastName() : "");
        map.put("surname", t.getSurname() != null ? t.getSurname() : "");
        map.put("email", t.getEmail() != null ? t.getEmail() : "");
        map.put("mobile", t.getMobile() != null ? t.getMobile() : "");
        map.put("gender", t.getGender() != null ? t.getGender() : "");
        map.put("designation", t.getDesignation() != null ? t.getDesignation() : "");
        map.put("qualification", t.getQualification() != null ? t.getQualification() : "");
        map.put("experience", t.getExperience() != null ? t.getExperience() : 0);
        map.put("joining_date", t.getJoiningDate() != null ? t.getJoiningDate().toString() : "");
        map.put("date_of_birth", t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : "");
        map.put("address", t.getAddress() != null ? t.getAddress() : "");
        map.put("profile_photo", t.getProfilePhoto() != null ? t.getProfilePhoto() : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
        map.put("is_active", t.getIsActive() != null ? t.getIsActive() : true);
        return map;
    }
}
