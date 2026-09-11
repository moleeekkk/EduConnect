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

    @JsonProperty("teacher_subject_id")
    @JsonAlias({"teacherSubjectId", "allocation_id", "allocationId", "subject_id", "subjectId"})
    private UUID teacherSubjectId;

    @JsonProperty("session_date")
    @JsonAlias({"sessionDate", "date"})
    private String sessionDate;

    @JsonProperty("lecture_no")
    @JsonAlias({"lectureNo", "lecture_number", "lectureNumber"})
    private Integer lectureNo;

    @JsonProperty("start_time")
    @JsonAlias({"startTime"})
    private String startTime;

    @JsonProperty("end_time")
    @JsonAlias({"endTime"})
    private String endTime;

    @JsonProperty("topic")
    @JsonAlias({"topic_covered", "topicCovered"})
    private String topic;

    @JsonProperty("student_statuses")
    @JsonAlias({"studentStatuses", "records"})
    private List<StudentStatus> studentStatuses;

    public UUID getTeacherSubjectId() { return teacherSubjectId; }
    public void setTeacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; }

    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }

    public Integer getLectureNo() { return lectureNo; }
    public void setLectureNo(Integer lectureNo) { this.lectureNo = lectureNo; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public List<StudentStatus> getStudentStatuses() { return studentStatuses; }
    public void setStudentStatuses(List<StudentStatus> studentStatuses) { this.studentStatuses = studentStatuses; }

    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentStatus {

        @JsonProperty("student_id")
        @JsonAlias({"studentId", "id"})
        private UUID studentId;

        @JsonProperty("status")
        @JsonAlias({"attendance_status", "attendanceStatus"})
        private String status; // "Present", "Absent", "Late"

        @JsonProperty("remarks")
        private String remarks;

        public UUID getStudentId() { return studentId; }
        public void setStudentId(UUID studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
