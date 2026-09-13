package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quiz_id")
    @JsonProperty("quiz_id")
    private UUID quizId;

    @Column(name = "title", nullable = false, length = 200)
    @JsonProperty("title")
    private String title;

    @Column(name = "subject_id")
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "category", length = 50)
    @JsonProperty("category")
    private String category; // "Conceptual", "Coding", "General Knowledge"

    @Column(name = "total_questions")
    @JsonProperty("total_questions")
    private Integer totalQuestions;

    @Column(name = "time_limit_minutes")
    @JsonProperty("time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "difficulty", length = 30)
    @JsonProperty("difficulty")
    private String difficulty; // "Easy", "Medium", "Hard"

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "questions_json", columnDefinition = "TEXT")
    @JsonProperty("questions_json")
    private String questionsJson;

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
        if (totalQuestions == null) totalQuestions = 10;
        if (timeLimitMinutes == null) timeLimitMinutes = 15;
        if (difficulty == null) difficulty = "Medium";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonProperty("learner_type")
    public String getLearnerType() {
        return category != null ? category : "Fast";
    }
}
