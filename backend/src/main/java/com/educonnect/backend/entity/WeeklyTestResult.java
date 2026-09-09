package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_test_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "weekly_test_result_id")
    @JsonProperty("weekly_test_result_id")
    private UUID weeklyTestResultId;

    @Column(name = "weekly_test_id", nullable = false)
    @JsonProperty("weekly_test_id")
    private UUID weeklyTestId;

    @Column(name = "student_id", nullable = false)
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "obtained_marks")
    @JsonProperty("obtained_marks")
    private Integer obtainedMarks;

    @Column(name = "grade", length = 10)
    @JsonProperty("grade")
    private String grade;

    @Column(name = "remarks", columnDefinition = "TEXT")
    @JsonProperty("remarks")
    private String remarks;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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
