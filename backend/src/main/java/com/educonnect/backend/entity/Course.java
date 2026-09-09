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
}
