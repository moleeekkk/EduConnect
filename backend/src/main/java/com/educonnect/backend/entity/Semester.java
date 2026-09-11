package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "semesters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "semester_id")
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "department_id", nullable = false)
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "semester_name", nullable = false, length = 100)
    @JsonProperty("semester_name")
    private String semesterName;

    @Column(name = "semester_number", nullable = false)
    @JsonProperty("semester_number")
    private Integer semesterNumber;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    @JsonProperty("is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public UUID getSemesterId() { return semesterId; }
    public void setSemesterId(UUID semesterId) { this.semesterId = semesterId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }

    public Integer getSemesterNumber() { return semesterNumber; }
    public void setSemesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static SemesterBuilder builder() {
        return new SemesterBuilder();
    }

    public static class SemesterBuilder {
        private UUID departmentId;
        private String semesterName;
        private Integer semesterNumber;
        private Boolean isActive = true;

        public SemesterBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public SemesterBuilder semesterName(String semesterName) { this.semesterName = semesterName; return this; }
        public SemesterBuilder semesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; return this; }
        public SemesterBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Semester build() {
            Semester s = new Semester();
            s.setDepartmentId(departmentId);
            s.setSemesterName(semesterName);
            s.setSemesterNumber(semesterNumber);
            s.setIsActive(isActive);
            return s;
        }
    }
}
