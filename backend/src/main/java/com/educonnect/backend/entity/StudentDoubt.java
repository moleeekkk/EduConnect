package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_doubts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDoubt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "doubt_id")
    @JsonProperty("doubt_id")
    private UUID doubtId;

    @Column(name = "student_id")
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "subject_name", nullable = false, length = 150)
    @JsonProperty("subject_name")
    private String subjectName;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("question")
    private String question;

    @Column(name = "answer", columnDefinition = "TEXT")
    @JsonProperty("answer")
    private String answer;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    @JsonProperty("status")
    private String status = "Pending"; // "Pending", "Answered"

    @Column(name = "replied_by", length = 100)
    @JsonProperty("replied_by")
    private String repliedBy;

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
        if (status == null) status = "Pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonProperty("reply")
    public String getReply() {
        return answer;
    }

    @JsonProperty("replied_at")
    public String getRepliedAt() {
        return updatedAt != null ? updatedAt.toString() : null;
    }

    @JsonProperty("title")
    public String getTitle() {
        if (question != null && question.contains(": ")) {
            return question.split(": ", 2)[0];
        }
        return question != null ? question : "Academic Doubt";
    }

    @JsonProperty("description")
    public String getDescription() {
        if (question != null && question.contains(": ")) {
            return question.split(": ", 2)[1];
        }
        return question != null ? question : "";
    }
}
