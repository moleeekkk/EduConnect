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
    @Column(name = "attendance_session_id")
    private UUID sessionId;

    public UUID getAttendanceSessionId() {
        return sessionId;
    }

    public void setAttendanceSessionId(UUID attendanceSessionId) {
        this.sessionId = attendanceSessionId;
    }

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    public UUID getTeacherSubjectId() {
        return subjectId;
    }

    public void setTeacherSubjectId(UUID teacherSubjectId) {
        this.subjectId = teacherSubjectId;
    }

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
