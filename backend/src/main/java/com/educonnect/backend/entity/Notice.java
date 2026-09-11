package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "notice_id", updatable = false, nullable = false)
    @JsonProperty("notice_id")
    private UUID noticeId;

    @Column(name = "title", nullable = false, length = 200)
    @JsonProperty("title")
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "author_id", nullable = false)
    @JsonProperty("author_id")
    private UUID authorId;

    @Column(name = "author_role", nullable = false, length = 30)
    @JsonProperty("author_role")
    private String authorRole; // ADMIN, TEACHER

    @Column(name = "author_name", length = 150)
    @JsonProperty("author_name")
    private String authorName;

    @Column(name = "target_role", nullable = false, length = 30)
    @JsonProperty("target_role")
    @Builder.Default
    private String targetRole = "ALL"; // ALL, STUDENT, TEACHER, COHORT

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "batch_id")
    @JsonProperty("batch_id")
    private UUID batchId;

    @Column(name = "teacher_subject_id")
    @JsonProperty("teacher_subject_id")
    private UUID teacherSubjectId;

    @Column(name = "publish_date", nullable = false)
    @JsonProperty("publish_date")
    private LocalDateTime publishDate;

    @Column(name = "expiry_date")
    @JsonProperty("expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "is_active", nullable = false)
    @JsonProperty("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_archived", nullable = false)
    @JsonProperty("is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (publishDate == null) {
            publishDate = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (isArchived == null) {
            isArchived = false;
        }
        if (targetRole == null || targetRole.trim().isEmpty()) {
            targetRole = "ALL";
        }
    }
}
