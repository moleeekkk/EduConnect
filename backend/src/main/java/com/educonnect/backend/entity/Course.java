package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "course_id")
    @JsonProperty("course_id")
    private UUID courseId;

    @Column(name = "code", nullable = false, length = 30)
    @JsonProperty("code")
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    @JsonProperty("name")
    private String name;

    @Column(name = "credits", nullable = false)
    @JsonProperty("credits")
    @Builder.Default
    private Integer credits = 4;

    @Column(name = "type", length = 50)
    @JsonProperty("type")
    @Builder.Default
    private String type = "Theory";

    @Column(name = "semester")
    @JsonProperty("semester")
    @Builder.Default
    private Integer semester = 1;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

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

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

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
        if (credits == null) {
            credits = 4;
        }
        if (semester == null) {
            semester = 1;
        }
        if (type == null) {
            type = "Theory";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private String code;
        private String name;
        private Integer credits = 4;
        private String type = "Theory";
        private Integer semester = 1;
        private UUID departmentId;
        private Boolean isActive = true;

        public CourseBuilder code(String code) { this.code = code; return this; }
        public CourseBuilder name(String name) { this.name = name; return this; }
        public CourseBuilder credits(Integer credits) { this.credits = credits; return this; }
        public CourseBuilder type(String type) { this.type = type; return this; }
        public CourseBuilder semester(Integer semester) { this.semester = semester; return this; }
        public CourseBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public CourseBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Course build() {
            Course c = new Course();
            c.setCode(code);
            c.setName(name);
            c.setCredits(credits);
            c.setType(type);
            c.setSemester(semester);
            c.setDepartmentId(departmentId);
            c.setIsActive(isActive);
            return c;
        }
    }
}
