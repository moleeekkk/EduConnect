package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "teacher_subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "allocation_id")
    @JsonProperty("allocation_id")
    private UUID allocationId;

    @Column(name = "teacher_id", nullable = false)
    @JsonProperty("teacher_id")
    private UUID teacherId;

    @Column(name = "subject_id", nullable = false)
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "batch_id")
    @JsonProperty("batch_id")
    private UUID batchId;

    @Column(name = "semester_id")
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    @JsonProperty("is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public UUID getAllocationId() { return allocationId; }
    public void setAllocationId(UUID allocationId) { this.allocationId = allocationId; }

    public UUID getTeacherId() { return teacherId; }
    public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public UUID getBatchId() { return batchId; }
    public void setBatchId(UUID batchId) { this.batchId = batchId; }

    public UUID getSemesterId() { return semesterId; }
    public void setSemesterId(UUID semesterId) { this.semesterId = semesterId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @JsonProperty("teacher_subject_id")
    public UUID getTeacherSubjectId() {
        return allocationId;
    }

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static TeacherSubjectBuilder builder() {
        return new TeacherSubjectBuilder();
    }

    public static class TeacherSubjectBuilder {
        private UUID teacherId;
        private UUID subjectId;
        private UUID batchId;
        private UUID semesterId;
        private Boolean isActive = true;

        public TeacherSubjectBuilder teacherId(UUID teacherId) { this.teacherId = teacherId; return this; }
        public TeacherSubjectBuilder subjectId(UUID subjectId) { this.subjectId = subjectId; return this; }
        public TeacherSubjectBuilder batchId(UUID batchId) { this.batchId = batchId; return this; }
        public TeacherSubjectBuilder semesterId(UUID semesterId) { this.semesterId = semesterId; return this; }
        public TeacherSubjectBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public TeacherSubject build() {
            TeacherSubject ts = new TeacherSubject();
            ts.setTeacherId(teacherId);
            ts.setSubjectId(subjectId);
            ts.setBatchId(batchId);
            ts.setSemesterId(semesterId);
            ts.setIsActive(isActive);
            return ts;
        }
    }
}
