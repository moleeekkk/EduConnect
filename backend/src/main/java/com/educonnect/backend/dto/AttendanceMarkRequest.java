package com.educonnect.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceMarkRequest {

    @JsonProperty("subjectId")
    @JsonAlias({"subject_id", "teacherSubjectId", "teacher_subject_id"})
    private UUID subjectId;

    public UUID getTeacherSubjectId() {
        return subjectId;
    }

    public void setTeacherSubjectId(UUID teacherSubjectId) {
        this.subjectId = teacherSubjectId;
    }

    @JsonProperty("sessionDate")
    @JsonAlias({"session_date", "date"})
    private String sessionDate;

    @JsonProperty("startTime")
    @JsonAlias({"start_time", "startTime"})
    private String startTime;

    @JsonProperty("endTime")
    @JsonAlias({"end_time", "endTime"})
    private String endTime;

    @JsonProperty("studentStatuses")
    @JsonAlias({"records", "student_statuses"})
    private List<StudentStatus> studentStatuses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentStatus {

        @JsonProperty("studentId")
        @JsonAlias({"student_id", "id"})
        private UUID studentId;

        @JsonProperty("status")
        @JsonAlias({"attendance_status", "attendanceStatus", "status"})
        private String status; // "Present", "Absent", "Late"
    }
}
