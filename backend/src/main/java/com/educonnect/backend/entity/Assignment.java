package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id")
    @JsonProperty("assignment_id")
    private UUID assignmentId;

    @Column(name = "teacher_subject_id")
    @JsonProperty("teacher_subject_id")
    private UUID teacherSubjectId;

    @Column(name = "subject_id")
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "title", nullable = false, length = 150)
    @JsonProperty("title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "due_date", nullable = false)
    @JsonProperty("due_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @Column(name = "total_marks", nullable = false)
    @JsonProperty("total_marks")
    private Integer totalMarks;

    @Column(name = "attachment", columnDefinition = "TEXT")
    @JsonProperty("attachment")
    private String attachment;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }

    public UUID getTeacherSubjectId() { return teacherSubjectId; }
    public void setTeacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public String getAttachment() { return attachment; }
    public void setAttachment(String attachment) { this.attachment = attachment; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

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

    public static AssignmentBuilder builder() {
        return new AssignmentBuilder();
    }

    public static class AssignmentBuilder {
        private UUID teacherSubjectId;
        private UUID subjectId;
        private String title;
        private String description;
        private LocalDate dueDate;
        private Integer totalMarks;
        private String attachment;
        private String fileName;
        private String filePath;
        private String fileType;
        private Long fileSize;

        public AssignmentBuilder teacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; return this; }
        public AssignmentBuilder subjectId(UUID subjectId) { this.subjectId = subjectId; return this; }
        public AssignmentBuilder title(String title) { this.title = title; return this; }
        public AssignmentBuilder description(String description) { this.description = description; return this; }
        public AssignmentBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public AssignmentBuilder totalMarks(Integer totalMarks) { this.totalMarks = totalMarks; return this; }
        public AssignmentBuilder attachment(String attachment) { this.attachment = attachment; return this; }
        public AssignmentBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public AssignmentBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public AssignmentBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public AssignmentBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }

        public Assignment build() {
            Assignment a = new Assignment();
            a.setTeacherSubjectId(teacherSubjectId);
            a.setSubjectId(subjectId);
            a.setTitle(title);
            a.setDescription(description);
            a.setDueDate(dueDate);
            a.setTotalMarks(totalMarks);
            a.setAttachment(attachment);
            a.setFileName(fileName);
            a.setFilePath(filePath);
            a.setFileType(fileType);
            a.setFileSize(fileSize);
            return a;
        }
    }
}
