package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "result_id")
    private UUID resultId;

    @Column(name = "teacher_subject_id", nullable = false)
    private UUID teacherSubjectId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "exam_name", nullable = false, length = 100)
    private String examName;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "obtained_marks", nullable = false)
    private Double obtainedMarks;

    @Column(name = "maximum_marks", nullable = false)
    private Double maximumMarks;

    @Column(name = "grade", length = 10)
    private String grade;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (examDate == null) examDate = LocalDate.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
