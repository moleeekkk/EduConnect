package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "syllabi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "syllabus_id")
    @JsonProperty("syllabus_id")
    private UUID syllabusId;

    @Column(name = "subject_id", nullable = false)
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "teacher_id")
    @JsonProperty("teacher_id")
    private UUID teacherId;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "semester_id")
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "title", length = 200)
    @JsonProperty("title")
    private String title;

    @Column(name = "file_name", columnDefinition = "TEXT")
    @JsonProperty("file_name")
    private String fileName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    @JsonProperty("file_path")
    private String filePath;

    @Column(name = "file_type", columnDefinition = "TEXT")
    @JsonProperty("file_type")
    private String fileType;

    @Column(name = "file_size")
    @JsonProperty("file_size")
    private Long fileSize;

    @Column(name = "storage_key", length = 255)
    @JsonProperty("storage_key")
    private String storageKey;

    @Column(name = "is_published")
    @JsonProperty("is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public UUID getSyllabusId() { return syllabusId; }
    public void setSyllabusId(UUID syllabusId) { this.syllabusId = syllabusId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public UUID getTeacherId() { return teacherId; }
    public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getSemesterId() { return semesterId; }
    public void setSemesterId(UUID semesterId) { this.semesterId = semesterId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public Boolean getIsPublished() { return isPublished != null ? isPublished : true; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        if (isPublished == null) isPublished = true;
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
