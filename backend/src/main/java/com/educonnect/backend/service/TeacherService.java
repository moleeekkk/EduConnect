package com.educonnect.backend.service;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;

    public Map<String, Object> getTeacherDashboard(String teacherId) {
        Map<String, Object> data = new HashMap<>();
        data.put("teacherName", "Dr. Sarah Jenkins");
        data.put("department", "Department of Computer Science");
        data.put("assignedCoursesCount", 4);
        data.put("totalStudents", 142);
        data.put("pendingGradingCount", 12);
        data.put("attendanceRate", "96.2%");

        List<Map<String, Object>> todayClasses = Arrays.asList(
                Map.of("id", 1, "course", "MCA301: Advanced Web Technologies", "room", "Lab 302", "time", "09:30 AM - 11:00 AM", "totalStudents", 42, "status", "Attendance Marked"),
                Map.of("id", 2, "course", "MCA303: Database Architecture Practical", "room", "Lab 105", "time", "02:00 PM - 04:00 PM", "totalStudents", 38, "status", "Pending Attendance"),
                Map.of("id", 3, "course", "MCA102: Data Structures & Algorithms", "room", "Hall A", "time", "04:30 PM - 05:30 PM", "totalStudents", 62, "status", "Upcoming")
        );
        data.put("todayClasses", todayClasses);

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
        List<Map<String, Object>> submissions = new ArrayList<>();
        submissions.add(Map.of("id", "SUB-801", "studentName", "Alex Johnson", "enrollmentNo", "2024MCA001", "assignmentTitle", "Docker Containerization", "totalMarks", 100, "status", "Pending", "submittedDate", "06-AUG-2026"));
        submissions.add(Map.of("id", "SUB-802", "studentName", "Beatrix Kiddo", "enrollmentNo", "2024MCA002", "assignmentTitle", "Docker Containerization", "totalMarks", 100, "status", "Pending", "submittedDate", "06-AUG-2026"));
        submissions.add(Map.of("id", "SUB-803", "studentName", "Charles Xavier", "enrollmentNo", "2024MCA003", "assignmentTitle", "React 19 Hooks", "totalMarks", 50, "status", "Graded", "obtainedMarks", 48));
        return submissions;
    }
}
