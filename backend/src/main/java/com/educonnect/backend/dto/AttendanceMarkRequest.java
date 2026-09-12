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

    @JsonProperty("teacherSubjectId")
    @JsonAlias({"teacher_subject_id", "subject_id", "subjectId"})
    private UUID teacherSubjectId;

    @JsonProperty("sessionDate")
    @JsonAlias({"session_date", "date"})
    private String sessionDate;

    @JsonProperty("lectureNo")
    @JsonAlias({"lecture_number", "lecture_no", "lectureNo"})
    private Integer lectureNo;

    @JsonProperty("topic")
    @JsonAlias({"topic_covered", "topicCovered"})
    private String topic;

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
        private String status; // "Present", "Absent", "Late"

        @JsonProperty("remarks")
        private String remarks;
    }
}
