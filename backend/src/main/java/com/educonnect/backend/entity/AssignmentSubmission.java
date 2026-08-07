package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignment_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "submission_id")
    private UUID submissionId;

    @Column(name = "assignment_id", nullable = false)
    private UUID assignmentId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;

    @Column(name = "attachment", nullable = false, length = 255)
    private String attachment;

    @Column(name = "obtained_marks")
    private Integer obtainedMarks;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "submission_status", length = 15)
    private String submissionStatus; // "Submitted", "Late", "Graded"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (submissionDate == null) submissionDate = LocalDateTime.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
