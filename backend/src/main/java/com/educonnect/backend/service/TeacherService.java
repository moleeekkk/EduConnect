package com.educonnect.backend.service;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;

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
        if (teacher.getPassword() == null || teacher.getPassword().trim().isEmpty()) {
            teacher.setPassword("teacher123");
        }
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
}
