package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "teacher_subject_id", nullable = false)
    private UUID teacherSubjectId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "lecture_no", nullable = false)
    private Integer lectureNo;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "topic", length = 255)
    private String topic;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public UUID getTeacherSubjectId() { return teacherSubjectId; }
    public void setTeacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public Integer getLectureNo() { return lectureNo; }
    public void setLectureNo(Integer lectureNo) { this.lectureNo = lectureNo; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static AttendanceSessionBuilder builder() {
        return new AttendanceSessionBuilder();
    }

    public static class AttendanceSessionBuilder {
        private UUID teacherSubjectId;
        private LocalDate sessionDate;
        private Integer lectureNo;
        private LocalTime startTime;
        private LocalTime endTime;
        private String topic;

        public AttendanceSessionBuilder teacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; return this; }
        public AttendanceSessionBuilder sessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; return this; }
        public AttendanceSessionBuilder lectureNo(Integer lectureNo) { this.lectureNo = lectureNo; return this; }
        public AttendanceSessionBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public AttendanceSessionBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public AttendanceSessionBuilder topic(String topic) { this.topic = topic; return this; }

        public AttendanceSession build() {
            AttendanceSession a = new AttendanceSession();
            a.setTeacherSubjectId(teacherSubjectId);
            a.setSessionDate(sessionDate);
            a.setLectureNo(lectureNo);
            a.setStartTime(startTime);
            a.setEndTime(endTime);
            a.setTopic(topic);
            return a;
        }
    }
}
