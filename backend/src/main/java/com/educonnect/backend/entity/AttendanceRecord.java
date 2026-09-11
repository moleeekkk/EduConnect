package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attendance_id")
    private UUID attendanceId;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "attendance_status", nullable = false, length = 10)
    private String attendanceStatus; // 'Present', 'Absent', 'Late'

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UUID getAttendanceId() { return attendanceId; }
    public void setAttendanceId(UUID attendanceId) { this.attendanceId = attendanceId; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

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

    public static AttendanceRecordBuilder builder() {
        return new AttendanceRecordBuilder();
    }

    public static class AttendanceRecordBuilder {
        private UUID sessionId;
        private UUID studentId;
        private String attendanceStatus;
        private String remarks;

        public AttendanceRecordBuilder sessionId(UUID sessionId) { this.sessionId = sessionId; return this; }
        public AttendanceRecordBuilder studentId(UUID studentId) { this.studentId = studentId; return this; }
        public AttendanceRecordBuilder attendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; return this; }
        public AttendanceRecordBuilder remarks(String remarks) { this.remarks = remarks; return this; }

        public AttendanceRecord build() {
            AttendanceRecord a = new AttendanceRecord();
            a.setSessionId(sessionId);
            a.setStudentId(studentId);
            a.setAttendanceStatus(attendanceStatus);
            a.setRemarks(remarks);
            return a;
        }
    }
}
