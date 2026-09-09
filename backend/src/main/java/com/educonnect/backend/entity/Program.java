package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "program_id")
    @JsonProperty("program_id")
    private UUID programId;

    @Column(name = "program_code", nullable = false, length = 30)
    @JsonProperty("program_code")
    private String programCode;

    @Column(name = "program_name", nullable = false, length = 150)
    @JsonProperty("program_name")
    private String programName;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "degree_type", length = 50)
    @JsonProperty("degree_type")
    @Builder.Default
    private String degreeType = "Master";

    @Column(name = "total_semesters")
    @JsonProperty("total_semesters")
    @Builder.Default
    private Integer totalSemesters = 4;

    @Column(name = "duration_years")
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
        if (totalSemesters == null) {
            totalSemesters = 4;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
