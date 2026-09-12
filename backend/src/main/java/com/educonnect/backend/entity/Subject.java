package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subjects")
@Getter
@Setter
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
