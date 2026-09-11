package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "subject_id")
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "semester_id")
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "subject_name", nullable = false, length = 100)
    @JsonProperty("subject_name")
    private String subjectName;

    @Column(name = "subject_code", nullable = false, unique = true, length = 20)
    @JsonProperty("subject_code")
    private String subjectCode;

    @Column(name = "credits", nullable = false)
    @JsonProperty("credits")
    private Integer credits;

    @Column(name = "semester_no")
    @JsonProperty("semester_no")
    private Integer semesterNo;

    @Column(name = "subject_type", nullable = false, length = 20)
    @JsonProperty("subject_type")
    private String subjectType; // Theory, Practical

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

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getSemesterId() { return semesterId; }
    public void setSemesterId(UUID semesterId) { this.semesterId = semesterId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Integer getSemesterNo() { return semesterNo; }
    public void setSemesterNo(Integer semesterNo) { this.semesterNo = semesterNo; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

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

    public static SubjectBuilder builder() {
        return new SubjectBuilder();
    }

    public static class SubjectBuilder {
        private UUID departmentId;
        private UUID semesterId;
        private String subjectName;
        private String subjectCode;
        private Integer credits;
        private Integer semesterNo;
        private String subjectType;
        private Boolean isActive = true;

        public SubjectBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public SubjectBuilder semesterId(UUID semesterId) { this.semesterId = semesterId; return this; }
        public SubjectBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public SubjectBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public SubjectBuilder credits(Integer credits) { this.credits = credits; return this; }
        public SubjectBuilder semesterNo(Integer semesterNo) { this.semesterNo = semesterNo; return this; }
        public SubjectBuilder subjectType(String subjectType) { this.subjectType = subjectType; return this; }
        public SubjectBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Subject build() {
            Subject s = new Subject();
            s.setDepartmentId(departmentId);
            s.setSemesterId(semesterId);
            s.setSubjectName(subjectName);
            s.setSubjectCode(subjectCode);
            s.setCredits(credits);
            s.setSemesterNo(semesterNo);
            s.setSubjectType(subjectType);
            s.setIsActive(isActive);
            return s;
        }
    }
}
