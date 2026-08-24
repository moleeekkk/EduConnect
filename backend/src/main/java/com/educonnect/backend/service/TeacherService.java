package com.educonnect.backend.service;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubjectAllocation;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.repository.TeacherSubjectAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final TeacherSubjectAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    // --- SECURITY RESOLVER ---
    public Teacher getAuthenticatedTeacher(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "401 Unauthorized: Authentication token is missing");
        }
        String identifier = principal.getName().trim().toLowerCase();

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(identifier);
        if (teacherOpt.isEmpty()) {
            try {
                UUID id = UUID.fromString(identifier);
                teacherOpt = teacherRepository.findById(id);
            } catch (Exception ignored) {}
        }

        return teacherOpt.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated teacher profile not found"));
    }

    private void enforceTeacherAccess(String requestedIdentifier, Teacher authenticatedTeacher) {
        if (requestedIdentifier != null && !requestedIdentifier.isBlank()) {
            String reqClean = requestedIdentifier.trim().toLowerCase();
            boolean isEmailMatch = reqClean.equalsIgnoreCase(authenticatedTeacher.getEmail());
            boolean isIdMatch = reqClean.equalsIgnoreCase(authenticatedTeacher.getTeacherId().toString());

            if (!isEmailMatch && !isIdMatch) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to access another teacher's data");
            }
        }
    }

    // --- TEACHER PROFILE ---
    public Map<String, Object> getTeacherProfile(Principal principal) {
        Teacher t = getAuthenticatedTeacher(principal);
        return mapTeacherProfileToMap(t);
    }

    public Map<String, Object> updateTeacherProfile(Map<String, Object> body, Principal principal) {
        Teacher t = getAuthenticatedTeacher(principal);

        if (body.containsKey("first_name")) t.setFirstName((String) body.get("first_name"));
        if (body.containsKey("firstName")) t.setFirstName((String) body.get("firstName"));

        if (body.containsKey("last_name")) t.setLastName((String) body.get("last_name"));
        if (body.containsKey("lastName")) t.setLastName((String) body.get("lastName"));

        if (body.containsKey("mobile")) t.setMobile((String) body.get("mobile"));
        if (body.containsKey("gender")) t.setGender((String) body.get("gender"));
        if (body.containsKey("address")) t.setAddress((String) body.get("address"));
        if (body.containsKey("designation")) t.setDesignation((String) body.get("designation"));
        if (body.containsKey("profile_photo")) t.setProfilePhoto((String) body.get("profile_photo"));
        if (body.containsKey("profilePhoto")) t.setProfilePhoto((String) body.get("profilePhoto"));

        Teacher updated = teacherRepository.save(t);
        Map<String, Object> res = mapTeacherProfileToMap(updated);
        res.put("success", true);
        res.put("message", "Faculty profile updated successfully in PostgreSQL");
        return res;
    }

    // --- TEACHER DASHBOARD ---
    public Map<String, Object> getTeacherDashboard(String requestedTeacherId, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);
        enforceTeacherAccess(requestedTeacherId, authenticatedTeacher);

        List<TeacherSubjectAllocation> allocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());

        Set<UUID> studentIds = new HashSet<>();
        List<Map<String, Object>> todayClasses = new ArrayList<>();

        for (TeacherSubjectAllocation a : allocations) {
            if (a.getProgram() != null && a.getSemester() != null) {
                List<Student> students = studentRepository.findByProgram_ProgramIdAndSemester_SemesterId(
                        a.getProgram().getProgramId(), a.getSemester().getSemesterId());
                students.forEach(s -> studentIds.add(s.getStudentId()));
            }

            Map<String, Object> session = new HashMap<>();
            session.put("allocation_id", a.getAllocationId().toString());
            session.put("subject_code", a.getSubject() != null ? a.getSubject().getSubjectCode() : "");
            session.put("subject_name", a.getSubject() != null ? a.getSubject().getSubjectName() : "");
            session.put("program_name", a.getProgram() != null ? a.getProgram().getProgramName() : "");
            session.put("semester_name", a.getSemester() != null ? a.getSemester().getSemesterName() : "");
            session.put("topic", "Lecture - " + (a.getSubject() != null ? a.getSubject().getSubjectName() : "Course Session"));
            session.put("start_time", "09:30 AM");
            session.put("end_time", "11:00 AM");
            todayClasses.add(session);
        }

        String empId = authenticatedTeacher.getTeacherId().toString().length() >= 8 
                ? "TCH-" + authenticatedTeacher.getTeacherId().toString().substring(0, 8).toUpperCase() 
                : authenticatedTeacher.getTeacherId().toString();

        Map<String, Object> data = new HashMap<>();
        data.put("teacherId", authenticatedTeacher.getTeacherId().toString());
        data.put("teacher_id", authenticatedTeacher.getTeacherId().toString());
        data.put("employee_id", empId);
        data.put("employeeId", empId);
        data.put("teacherName", authenticatedTeacher.getFirstName() + " " + authenticatedTeacher.getLastName());
        data.put("first_name", authenticatedTeacher.getFirstName());
        data.put("last_name", authenticatedTeacher.getLastName());
        data.put("email", authenticatedTeacher.getEmail());
        data.put("department", authenticatedTeacher.getDesignation() != null ? authenticatedTeacher.getDesignation() : "Computer Applications");
        data.put("designation", authenticatedTeacher.getDesignation() != null ? authenticatedTeacher.getDesignation() : "Faculty Member");

        data.put("assignedCoursesCount", allocations.size());
        data.put("totalStudents", studentIds.size());
        data.put("pendingGradingCount", 0);
        data.put("attendanceRate", "95%");
        data.put("todayClasses", todayClasses);

        return data;
    }

    // --- ASSIGNED SUBJECTS ---
    public List<Map<String, Object>> getMyAssignedSubjects(String requestedTeacherId, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);
        enforceTeacherAccess(requestedTeacherId, authenticatedTeacher);

        List<TeacherSubjectAllocation> allocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());
        List<Map<String, Object>> list = new ArrayList<>();

        for (TeacherSubjectAllocation a : allocations) {
            Map<String, Object> m = new HashMap<>();
            m.put("allocation_id", a.getAllocationId().toString());
            m.put("allocationId", a.getAllocationId().toString());

            if (a.getSubject() != null) {
                m.put("subject_id", a.getSubject().getSubjectId().toString());
                m.put("subjectId", a.getSubject().getSubjectId().toString());
                m.put("subject_code", a.getSubject().getSubjectCode());
                m.put("subjectCode", a.getSubject().getSubjectCode());
                m.put("subject_name", a.getSubject().getSubjectName());
                m.put("subjectName", a.getSubject().getSubjectName());
                m.put("credits", a.getSubject().getCredits());
                m.put("type", a.getSubject().getSubjectType());
            }

            if (a.getProgram() != null) {
                m.put("program_id", a.getProgram().getProgramId().toString());
                m.put("programId", a.getProgram().getProgramId().toString());
                m.put("program_name", a.getProgram().getProgramName());
                m.put("programName", a.getProgram().getProgramName());
            }

            if (a.getSemester() != null) {
                m.put("semester_id", a.getSemester().getSemesterId().toString());
                m.put("semesterId", a.getSemester().getSemesterId().toString());
                m.put("semester_number", a.getSemester().getSemesterNumber());
                m.put("semesterNumber", a.getSemester().getSemesterNumber());
                m.put("semester_name", a.getSemester().getSemesterName());
                m.put("semesterName", a.getSemester().getSemesterName());
            }

            if (a.getProgram() != null && a.getSemester() != null) {
                long studentCount = studentRepository.countByProgram_ProgramIdAndSemester_SemesterId(
                        a.getProgram().getProgramId(), a.getSemester().getSemesterId());
                m.put("applicableStudentsCount", studentCount);
            } else {
                m.put("applicableStudentsCount", 0);
            }

            list.add(m);
        }

        return list;
    }

    // --- ASSIGNED STUDENTS ---
    public List<Map<String, Object>> getAssignedStudents(String requestedTeacherId, UUID allocationId, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);
        enforceTeacherAccess(requestedTeacherId, authenticatedTeacher);

        List<TeacherSubjectAllocation> allocations;
        if (allocationId != null) {
            TeacherSubjectAllocation alloc = allocationRepository.findById(allocationId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher allocation not found"));

            if (!alloc.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You do not have access to another teacher's allocation");
            }
            allocations = List.of(alloc);
        } else {
            allocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());
        }

        Set<UUID> processedStudentIds = new HashSet<>();
        List<Map<String, Object>> list = new ArrayList<>();

        for (TeacherSubjectAllocation a : allocations) {
            if (a.getProgram() != null && a.getSemester() != null) {
                List<Student> students = studentRepository.findByProgram_ProgramIdAndSemester_SemesterId(
                        a.getProgram().getProgramId(), a.getSemester().getSemesterId());

                for (Student s : students) {
                    if (processedStudentIds.add(s.getStudentId())) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("student_id", s.getStudentId().toString());
                        m.put("studentId", s.getStudentId().toString());
                        m.put("enrollment_no", s.getEnrollmentNo());
                        m.put("enrollmentNo", s.getEnrollmentNo());
                        m.put("name", s.getFirstName() + " " + s.getLastName());
                        m.put("firstName", s.getFirstName());
                        m.put("lastName", s.getLastName());
                        m.put("email", s.getEmail());
                        m.put("mobile", s.getMobile() != null ? s.getMobile() : "");
                        m.put("gender", s.getGender());
                        m.put("program_name", a.getProgram().getProgramName());
                        m.put("semester_name", a.getSemester().getSemesterName());
                        m.put("subject_name", a.getSubject() != null ? a.getSubject().getSubjectName() : "");
                        m.put("is_active", s.getIsActive());
                        m.put("status", s.getIsActive() ? "Active" : "Inactive");
                        list.add(m);
                    }
                }
            }
        }

        return list;
    }

    private Map<String, Object> mapTeacherProfileToMap(Teacher t) {
        Map<String, Object> m = new HashMap<>();
        String empId = t.getTeacherId().toString().length() >= 8 
                ? "TCH-" + t.getTeacherId().toString().substring(0, 8).toUpperCase() 
                : t.getTeacherId().toString();

        m.put("teacher_id", t.getTeacherId().toString());
        m.put("teacherId", t.getTeacherId().toString());
        m.put("employee_id", empId);
        m.put("employeeId", empId);

        m.put("first_name", t.getFirstName());
        m.put("firstName", t.getFirstName());

        m.put("last_name", t.getLastName());
        m.put("lastName", t.getLastName());

        m.put("name", t.getFirstName() + " " + t.getLastName());
        m.put("email", t.getEmail());
        m.put("mobile", t.getMobile() != null ? t.getMobile() : "");
        m.put("gender", t.getGender() != null ? t.getGender() : "Female");
        m.put("designation", t.getDesignation() != null ? t.getDesignation() : "Assistant Professor");
        m.put("date_of_birth", t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : "");
        m.put("dateOfBirth", t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : "");
        m.put("address", t.getAddress() != null ? t.getAddress() : "");
        m.put("profile_photo", t.getProfilePhoto() != null ? t.getProfilePhoto() : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
        m.put("profilePhoto", t.getProfilePhoto() != null ? t.getProfilePhoto() : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");

        m.put("institute_name", t.getInstitute() != null ? t.getInstitute().getInstituteName() : "Computer Applications");
        m.put("is_active", t.getIsActive() != null ? t.getIsActive() : true);
        return m;
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
