package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "department_code", nullable = false, length = 30)
    @JsonProperty("department_code")
    private String departmentCode;

    @Column(name = "department_name", nullable = false, length = 150)
    @JsonProperty("department_name")
    private String departmentName;

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "duration_years", nullable = false)
    @JsonProperty("duration_years")
    @Builder.Default
    private Integer durationYears = 2;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

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
        if (durationYears == null) {
            durationYears = 2;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
