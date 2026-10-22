package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "study_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "resource_id")
    @JsonProperty("resource_id")
    private UUID resourceId;

    @Column(name = "title", nullable = false, length = 200)
    @JsonProperty("title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "resource_type", length = 50)
    @JsonProperty("resource_type")
    private String resourceType; // "Study Material", "Syllabus", "Question Bank", "Lab Manual"

    @Column(name = "subject_id")
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "file_name", columnDefinition = "TEXT")
    @JsonProperty("file_name")
    private String fileName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    @JsonProperty("file_path")
    private String filePath;

    @Column(name = "file_type", length = 50)
    @JsonProperty("file_type")
    private String fileType;

    @Column(name = "file_size")
    @JsonProperty("file_size")
    private Long fileSize;

    @Column(name = "uploaded_by", length = 100)
    @JsonProperty("uploaded_by")
    private String uploadedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (resourceType == null) resourceType = "Study Material";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
