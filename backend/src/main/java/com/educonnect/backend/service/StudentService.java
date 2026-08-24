package com.educonnect.backend.service;

import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.TeacherSubjectAllocation;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherSubjectAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final TeacherSubjectAllocationRepository teacherSubjectAllocationRepository;

    public Map<String, Object> getStudentDashboard(String studentIdOrEnrollment) {
        Map<String, Object> data = new HashMap<>();
        Optional<Student> studentOpt = findStudent(studentIdOrEnrollment);

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            data.put("studentName", s.getFirstName() + " " + s.getLastName());
            data.put("enrollmentNo", s.getEnrollmentNo());
            data.put("program", s.getProgram() != null ? s.getProgram().getProgramName() : "Master of Computer Applications");
            data.put("semester", s.getSemester() != null ? s.getSemester().getSemesterName() : "Semester 1");

            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(s.getStudentId());
            long presentCount = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            int total = records.size();
            int percentage = total > 0 ? (int) Math.round((double) presentCount / total * 100) : 100;

            data.put("overallAttendance", percentage + "%");
            data.put("cgpa", "8.5 / 10");
            data.put("todayClasses", Collections.emptyList());
        } else {
            data.put("studentName", "Student");
            data.put("enrollmentNo", studentIdOrEnrollment != null ? studentIdOrEnrollment : "");
            data.put("program", "Master of Computer Applications");
            data.put("semester", "Semester 1");
            data.put("overallAttendance", "100%");
            data.put("cgpa", "8.5 / 10");
            data.put("todayClasses", Collections.emptyList());
        }

        return data;
    }

    public List<Map<String, Object>> getStudentAttendance(String studentIdOrEnrollment) {
        Optional<Student> studentOpt = findStudent(studentIdOrEnrollment);
        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Student student = studentOpt.get();
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(student.getStudentId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (AttendanceRecord r : records) {
            Map<String, Object> item = new HashMap<>();
            item.put("attendance_id", r.getAttendanceId().toString());
            item.put("attendanceId", r.getAttendanceId().toString());
            item.put("status", r.getAttendanceStatus());
            item.put("attendance_status", r.getAttendanceStatus());
            item.put("remarks", r.getRemarks() != null ? r.getRemarks() : "");

            Optional<AttendanceSession> sessionOpt = attendanceSessionRepository.findById(r.getSessionId());
            if (sessionOpt.isPresent()) {
                AttendanceSession s = sessionOpt.get();
                item.put("session_date", s.getSessionDate().toString());
                item.put("sessionDate", s.getSessionDate().toString());
                item.put("lecture_no", s.getLectureNo());
                item.put("lectureNo", s.getLectureNo());
                item.put("topic", s.getTopic());
                item.put("start_time", s.getStartTime().toString());
                item.put("end_time", s.getEndTime().toString());

                if (s.getTeacherSubjectId() != null) {
                    Optional<TeacherSubjectAllocation> allocOpt = teacherSubjectAllocationRepository.findById(s.getTeacherSubjectId());
                    if (allocOpt.isPresent()) {
                        TeacherSubjectAllocation alloc = allocOpt.get();
                        item.put("subject_code", alloc.getSubject() != null ? alloc.getSubject().getSubjectCode() : "");
                        item.put("subject_name", alloc.getSubject() != null ? alloc.getSubject().getSubjectName() : "");
                        item.put("subjectCode", alloc.getSubject() != null ? alloc.getSubject().getSubjectCode() : "");
                        item.put("subjectName", alloc.getSubject() != null ? alloc.getSubject().getSubjectName() : "");
                    }
                }
            }
            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        return Collections.emptyList();
    }

    public Map<String, Object> getStudentResults(String enrollmentNo) {
        Map<String, Object> results = new HashMap<>();
        results.put("sgpa", 8.4);
        results.put("cgpa", 8.5);
        results.put("totalCredits", 24);
        results.put("subjects", Collections.emptyList());
        return results;
    }

    public Map<String, Object> getStudentProfile(String enrollmentNo) {
        Optional<Student> studentOpt = findStudent(enrollmentNo);

        Map<String, Object> profile = new HashMap<>();
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            profile.put("enrollmentNo", s.getEnrollmentNo());
            profile.put("name", s.getFirstName() + " " + s.getLastName());
            profile.put("email", s.getEmail() != null ? s.getEmail() : "");
            profile.put("mobile", s.getMobile() != null ? s.getMobile() : "");
            profile.put("gender", s.getGender() != null ? s.getGender() : "");
            profile.put("dob", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
            profile.put("address", s.getAddress() != null ? s.getAddress() : "");
            profile.put("program", s.getProgram() != null ? s.getProgram().getProgramName() : "Master of Computer Applications");
            profile.put("semester", s.getSemester() != null ? s.getSemester().getSemesterName() : "Semester 1");
        } else {
            profile.put("enrollmentNo", enrollmentNo != null ? enrollmentNo : "");
            profile.put("name", "Student");
            profile.put("email", "");
            profile.put("mobile", "");
            profile.put("gender", "Male");
            profile.put("dob", "");
            profile.put("address", "");
            profile.put("program", "Master of Computer Applications");
            profile.put("semester", "Semester 1");
        }

        return profile;
    }

    private Optional<Student> findStudent(String queryStr) {
        if (queryStr == null || queryStr.isBlank()) {
            return studentRepository.findAll().stream().findFirst();
        }
        try {
            UUID id = UUID.fromString(queryStr);
            Optional<Student> s = studentRepository.findById(id);
            if (s.isPresent()) return s;
        } catch (Exception ignored) {}

        Optional<Student> s = studentRepository.findByEnrollmentNo(queryStr.trim().toUpperCase());
        if (s.isPresent()) return s;

        return studentRepository.findByEmail(queryStr.trim().toLowerCase());
    }
}
