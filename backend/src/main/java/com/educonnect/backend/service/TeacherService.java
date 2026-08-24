package com.educonnect.backend.service;

import com.educonnect.backend.dto.AssignmentDto;
import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubjectAllocation;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;
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
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

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

    // --- ATTENDANCE MANAGEMENT ---
    public Map<String, Object> markAttendance(AttendanceMarkRequest request, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        Object idObj = request.getTeacherSubjectId();
        if (idObj == null) idObj = request.getAllocationId();
        if (idObj == null) idObj = request.getSubjectId();
        if (idObj == null) idObj = request.getSelectedSubject();

        TeacherSubjectAllocation allocation = null;
        UUID targetId = null;

        if (idObj != null && !idObj.toString().isBlank()) {
            try {
                UUID parsedId = UUID.fromString(idObj.toString());
                Optional<TeacherSubjectAllocation> allocOpt = allocationRepository.findById(parsedId);
                if (allocOpt.isPresent()) {
                    allocation = allocOpt.get();
                    targetId = allocation.getAllocationId();
                } else {
                    targetId = parsedId;
                }
            } catch (Exception e) {
                targetId = UUID.nameUUIDFromBytes(idObj.toString().getBytes());
            }
        }

        List<TeacherSubjectAllocation> teacherAllocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());

        if (allocation != null) {
            if (!allocation.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to mark attendance for another teacher's allocation");
            }
        } else if (!teacherAllocations.isEmpty()) {
            allocation = teacherAllocations.get(0);
            targetId = allocation.getAllocationId();
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You do not have any assigned subjects to mark attendance for");
        }

        LocalDate sessionDate = LocalDate.now();
        if (request.getSessionDate() != null && !request.getSessionDate().isBlank()) {
            try {
                sessionDate = LocalDate.parse(request.getSessionDate());
            } catch (Exception ignored) {}
        }

        Integer lectureNo = request.getLectureNo() != null ? request.getLectureNo() : 1;

        LocalTime startTime = LocalTime.of(9, 30);
        if (request.getStartTime() != null && !request.getStartTime().isBlank()) {
            try {
                startTime = LocalTime.parse(request.getStartTime());
            } catch (Exception ignored) {}
        }

        LocalTime endTime = LocalTime.of(11, 0);
        if (request.getEndTime() != null && !request.getEndTime().isBlank()) {
            try {
                endTime = LocalTime.parse(request.getEndTime());
            } catch (Exception ignored) {}
        }

        String topic = request.getTopic() != null && !request.getTopic().isBlank() 
                ? request.getTopic() 
                : "Lecture Session - " + (allocation.getSubject() != null ? allocation.getSubject().getSubjectName() : "Class Session");

        Optional<AttendanceSession> existingSessionOpt = sessionRepository.findByTeacherSubjectIdAndSessionDateAndLectureNo(
                targetId, sessionDate, lectureNo);

        AttendanceSession session;
        if (existingSessionOpt.isPresent()) {
            session = existingSessionOpt.get();
            session.setStartTime(startTime);
            session.setEndTime(endTime);
            session.setTopic(topic);
        } else {
            session = AttendanceSession.builder()
                    .teacherSubjectId(targetId)
                    .sessionDate(sessionDate)
                    .lectureNo(lectureNo)
                    .startTime(startTime)
                    .endTime(endTime)
                    .topic(topic)
                    .build();
        }
        AttendanceSession savedSession = sessionRepository.save(session);

        List<Student> authorizedStudents = Collections.emptyList();
        if (allocation.getProgram() != null && allocation.getSemester() != null) {
            authorizedStudents = studentRepository.findByProgram_ProgramIdAndSemester_SemesterId(
                    allocation.getProgram().getProgramId(), allocation.getSemester().getSemesterId());
        } else {
            authorizedStudents = studentRepository.findAll();
        }

        Map<UUID, Student> authorizedStudentMap = new HashMap<>();
        authorizedStudents.forEach(s -> authorizedStudentMap.put(s.getStudentId(), s));

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;
        int totalProcessed = 0;

        if (request.getStudentStatuses() != null && !request.getStudentStatuses().isEmpty()) {
            for (AttendanceMarkRequest.StudentStatus statusItem : request.getStudentStatuses()) {
                UUID studentId = statusItem.getStudentId();
                if (studentId == null && statusItem.getStudentIdStr() != null && !statusItem.getStudentIdStr().isBlank()) {
                    try {
                        studentId = UUID.fromString(statusItem.getStudentIdStr());
                    } catch (Exception ignored) {}
                }

                if (studentId != null && authorizedStudentMap.containsKey(studentId)) {
                    String status = statusItem.getStatus() != null ? statusItem.getStatus() : "Present";
                    upsertRecord(savedSession.getSessionId(), studentId, status, statusItem.getRemarks());

                    totalProcessed++;
                    if ("Present".equalsIgnoreCase(status)) presentCount++;
                    else if ("Late".equalsIgnoreCase(status)) lateCount++;
                    else absentCount++;
                }
            }
        } 
        else if (request.getStudentStatusMap() != null && !request.getStudentStatusMap().isEmpty()) {
            for (Map.Entry<String, String> entry : request.getStudentStatusMap().entrySet()) {
                try {
                    UUID studentId = UUID.fromString(entry.getKey());
                    if (authorizedStudentMap.containsKey(studentId)) {
                        String status = entry.getValue() != null ? entry.getValue() : "Present";
                        upsertRecord(savedSession.getSessionId(), studentId, status, null);

                        totalProcessed++;
                        if ("Present".equalsIgnoreCase(status)) presentCount++;
                        else if ("Late".equalsIgnoreCase(status)) lateCount++;
                        else absentCount++;
                    }
                } catch (Exception ignored) {}
            }
        }
        else if (!authorizedStudents.isEmpty()) {
            for (Student s : authorizedStudents) {
                upsertRecord(savedSession.getSessionId(), s.getStudentId(), "Present", null);
                totalProcessed++;
                presentCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lecture session and attendance records saved successfully in PostgreSQL");
        response.put("sessionId", savedSession.getSessionId().toString());
        response.put("totalRecords", totalProcessed);
        response.put("presentCount", presentCount);
        response.put("absentCount", absentCount);
        response.put("lateCount", lateCount);

        return response;
    }

    private void upsertRecord(UUID sessionId, UUID studentId, String status, String remarks) {
        Optional<AttendanceRecord> existing = recordRepository.findBySessionIdAndStudentId(sessionId, studentId);
        AttendanceRecord record;
        if (existing.isPresent()) {
            record = existing.get();
            record.setAttendanceStatus(status);
            if (remarks != null) record.setRemarks(remarks);
        } else {
            record = AttendanceRecord.builder()
                    .sessionId(sessionId)
                    .studentId(studentId)
                    .attendanceStatus(status)
                    .remarks(remarks)
                    .build();
        }
        recordRepository.save(record);
    }

    public List<Map<String, Object>> getAttendanceHistory(String allocationIdStr, String dateStr, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        List<TeacherSubjectAllocation> allocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());
        List<UUID> targetIds = allocations.stream().map(TeacherSubjectAllocation::getAllocationId).toList();

        if (targetIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<AttendanceSession> sessions = sessionRepository.findByTeacherSubjectIdIn(targetIds);
        List<Map<String, Object>> history = new ArrayList<>();

        for (AttendanceSession s : sessions) {
            if (dateStr != null && !dateStr.isBlank() && !s.getSessionDate().toString().equalsIgnoreCase(dateStr.trim())) {
                continue;
            }

            List<AttendanceRecord> records = recordRepository.findBySessionId(s.getSessionId());
            long present = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            long absent = records.stream().filter(r -> "Absent".equalsIgnoreCase(r.getAttendanceStatus())).count();
            long late = records.stream().filter(r -> "Late".equalsIgnoreCase(r.getAttendanceStatus())).count();

            Map<String, Object> item = new HashMap<>();
            item.put("session_id", s.getSessionId().toString());
            item.put("sessionId", s.getSessionId().toString());
            item.put("session_date", s.getSessionDate().toString());
            item.put("sessionDate", s.getSessionDate().toString());
            item.put("lecture_no", s.getLectureNo());
            item.put("lectureNo", s.getLectureNo());
            item.put("start_time", s.getStartTime().toString());
            item.put("end_time", s.getEndTime().toString());
            item.put("topic", s.getTopic());
            item.put("totalStudents", records.size());
            item.put("presentCount", present);
            item.put("absentCount", absent);
            item.put("lateCount", late);
            history.add(item);
        }

        return history;
    }

    // --- ASSIGNMENT MANAGEMENT ---
    public List<Map<String, Object>> getTeacherAssignments(Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);
        List<TeacherSubjectAllocation> allocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());
        List<UUID> allocIds = allocations.stream().map(TeacherSubjectAllocation::getAllocationId).toList();

        if (allocIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Assignment> assignments = assignmentRepository.findByTeacherSubjectIdIn(allocIds);
        List<Map<String, Object>> list = new ArrayList<>();

        for (Assignment a : assignments) {
            TeacherSubjectAllocation alloc = allocations.stream()
                    .filter(al -> al.getAllocationId().equals(a.getTeacherSubjectId()))
                    .findFirst().orElse(null);

            List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(a.getAssignmentId());

            Map<String, Object> m = new HashMap<>();
            m.put("assignment_id", a.getAssignmentId().toString());
            m.put("assignmentId", a.getAssignmentId().toString());
            m.put("title", a.getTitle());
            m.put("description", a.getDescription() != null ? a.getDescription() : "");
            m.put("due_date", a.getDueDate().toString());
            m.put("dueDate", a.getDueDate().toString());
            m.put("total_marks", a.getTotalMarks());
            m.put("totalMarks", a.getTotalMarks());
            m.put("attachment", a.getAttachment() != null ? a.getAttachment() : "");
            m.put("status", "Active");
            m.put("submissionCount", subs.size());

            if (alloc != null) {
                m.put("subject_name", alloc.getSubject() != null ? alloc.getSubject().getSubjectName() : "");
                m.put("subject_code", alloc.getSubject() != null ? alloc.getSubject().getSubjectCode() : "");
                m.put("program_name", alloc.getProgram() != null ? alloc.getProgram().getProgramName() : "");
                m.put("semester_name", alloc.getSemester() != null ? alloc.getSemester().getSemesterName() : "");
            }

            list.add(m);
        }

        return list;
    }

    public Map<String, Object> createAssignment(AssignmentDto dto, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        Object allocObj = dto.getTeacherSubjectId();
        if (allocObj == null) allocObj = dto.getAllocationId();
        if (allocObj == null) allocObj = dto.getSubjectId();

        TeacherSubjectAllocation allocation = null;
        if (allocObj != null && !allocObj.toString().isBlank()) {
            try {
                UUID parsedId = UUID.fromString(allocObj.toString());
                Optional<TeacherSubjectAllocation> allocOpt = allocationRepository.findById(parsedId);
                if (allocOpt.isPresent()) {
                    allocation = allocOpt.get();
                }
            } catch (Exception ignored) {}
        }

        List<TeacherSubjectAllocation> teacherAllocations = allocationRepository.findByTeacher_TeacherId(authenticatedTeacher.getTeacherId());

        if (allocation != null) {
            if (!allocation.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to create assignments for another teacher's subject");
            }
        } else if (!teacherAllocations.isEmpty()) {
            allocation = teacherAllocations.get(0);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You do not have any assigned subjects to create assignments for");
        }

        LocalDate dueDate = LocalDate.now().plusDays(7);
        String dueStr = dto.getDueDate() != null ? dto.getDueDate() : dto.getDue_date();
        if (dueStr != null && !dueStr.isBlank()) {
            try {
                dueDate = LocalDate.parse(dueStr);
            } catch (Exception ignored) {}
        }

        Integer marks = dto.getTotalMarks() != null ? dto.getTotalMarks() : dto.getTotal_marks();
        if (marks == null) marks = 50;

        String attachment = dto.getAttachment() != null && !dto.getAttachment().isBlank() 
                ? dto.getAttachment() 
                : dto.getRefFileName();

        Assignment assignment = Assignment.builder()
                .teacherSubjectId(allocation.getAllocationId())
                .title(dto.getTitle() != null ? dto.getTitle() : "Class Assignment")
                .description(dto.getDescription() != null ? dto.getDescription() : "")
                .dueDate(dueDate)
                .totalMarks(marks)
                .attachment(attachment)
                .build();

        Assignment saved = assignmentRepository.save(assignment);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Assignment published successfully in PostgreSQL");
        res.put("assignment_id", saved.getAssignmentId().toString());
        res.put("assignmentId", saved.getAssignmentId().toString());
        res.put("title", saved.getTitle());
        res.put("due_date", saved.getDueDate().toString());
        res.put("total_marks", saved.getTotalMarks());
        return res;
    }

    public Map<String, Object> updateAssignment(UUID assignmentId, AssignmentDto dto, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        TeacherSubjectAllocation alloc = allocationRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
        if (alloc == null || !alloc.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to update another teacher's assignment");
        }

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) assignment.setTitle(dto.getTitle());
        if (dto.getDescription() != null) assignment.setDescription(dto.getDescription());

        String dueStr = dto.getDueDate() != null ? dto.getDueDate() : dto.getDue_date();
        if (dueStr != null && !dueStr.isBlank()) {
            try {
                assignment.setDueDate(LocalDate.parse(dueStr));
            } catch (Exception ignored) {}
        }

        Integer marks = dto.getTotalMarks() != null ? dto.getTotalMarks() : dto.getTotal_marks();
        if (marks != null) assignment.setTotalMarks(marks);

        String attachment = dto.getAttachment() != null ? dto.getAttachment() : dto.getRefFileName();
        if (attachment != null) assignment.setAttachment(attachment);

        Assignment updated = assignmentRepository.save(assignment);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Assignment updated successfully in PostgreSQL");
        res.put("assignment_id", updated.getAssignmentId().toString());
        res.put("title", updated.getTitle());
        return res;
    }

    public Map<String, Object> deleteAssignment(UUID assignmentId, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        TeacherSubjectAllocation alloc = allocationRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
        if (alloc == null || !alloc.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to delete another teacher's assignment");
        }

        List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(assignmentId);
        submissionRepository.deleteAll(subs);
        assignmentRepository.delete(assignment);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Assignment deleted successfully from PostgreSQL");
        return res;
    }

    public List<Map<String, Object>> getAssignmentSubmissions(UUID assignmentId, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        TeacherSubjectAllocation alloc = allocationRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
        if (alloc == null || !alloc.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to view submissions for another teacher's assignment");
        }

        List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(assignmentId);
        List<Map<String, Object>> list = new ArrayList<>();

        for (AssignmentSubmission s : subs) {
            Optional<Student> studentOpt = studentRepository.findById(s.getStudentId());

            Map<String, Object> m = new HashMap<>();
            m.put("submission_id", s.getSubmissionId().toString());
            m.put("submissionId", s.getSubmissionId().toString());
            m.put("assignment_id", s.getAssignmentId().toString());
            m.put("student_id", s.getStudentId().toString());

            if (studentOpt.isPresent()) {
                Student st = studentOpt.get();
                m.put("student_name", st.getFirstName() + " " + st.getLastName());
                m.put("enrollment_no", st.getEnrollmentNo());
            } else {
                m.put("student_name", "Student (" + s.getStudentId().toString().substring(0, 8) + ")");
                m.put("enrollment_no", "ENR-" + s.getStudentId().toString().substring(0, 6).toUpperCase());
            }

            m.put("submission_date", s.getSubmissionDate().toString());
            m.put("attachment", s.getAttachment());
            m.put("submission_status", s.getSubmissionStatus() != null ? s.getSubmissionStatus() : "Timely");
            m.put("obtained_marks", s.getObtainedMarks());
            m.put("feedback", s.getFeedback() != null ? s.getFeedback() : "");
            list.add(m);
        }

        return list;
    }

    public Map<String, Object> gradeSubmission(UUID submissionId, AssignmentDto dto, Principal principal) {
        Teacher authenticatedTeacher = getAuthenticatedTeacher(principal);

        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment submission not found"));

        Assignment assignment = assignmentRepository.findById(sub.getAssignmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Associated assignment not found"));

        TeacherSubjectAllocation alloc = allocationRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
        if (alloc == null || !alloc.getTeacher().getTeacherId().equals(authenticatedTeacher.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "403 Forbidden: You are not authorized to grade submissions for another teacher's assignment");
        }

        Integer marks = dto.getObtainedMarks() != null ? dto.getObtainedMarks() : dto.getObtained_marks();
        if (marks != null) sub.setObtainedMarks(marks);

        if (dto.getFeedback() != null) sub.setFeedback(dto.getFeedback());
        sub.setSubmissionStatus("Graded");

        AssignmentSubmission updated = submissionRepository.save(sub);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Submission graded successfully in PostgreSQL");
        res.put("submission_id", updated.getSubmissionId().toString());
        res.put("obtained_marks", updated.getObtainedMarks());
        res.put("feedback", updated.getFeedback());
        return res;
    }

    public List<Map<String, Object>> getPendingGrades(String teacherId) {
        return Collections.emptyList();
    }
}
