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
        data.put("teacherName", "");
        data.put("department", "");
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
