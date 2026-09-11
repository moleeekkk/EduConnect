package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempt_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "answer_id", updatable = false, nullable = false)
    private UUID answerId;

    @Column(name = "attempt_id", nullable = false)
    private UUID attemptId;

    @Column(name = "mcq_id", nullable = false)
    private UUID mcqId;

    @Column(name = "selected_option", length = 5)
    private String selectedOption;

    @Column(name = "is_correct")
    @Builder.Default
    private Boolean isCorrect = false;

    @Column(name = "question_snapshot", columnDefinition = "TEXT")
    private String questionSnapshot;

    @Column(name = "correct_option_snapshot", length = 5)
    private String correctOptionSnapshot;

    @Column(name = "explanation_snapshot", columnDefinition = "TEXT")
    private String explanationSnapshot;

    @CreationTimestamp
    @Column(name = "answered_at", updatable = false)
    private LocalDateTime answeredAt;
}
