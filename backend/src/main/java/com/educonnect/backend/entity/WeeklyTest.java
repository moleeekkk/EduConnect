package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyTest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "weekly_test_id")
    @JsonProperty("weekly_test_id")
    private UUID weeklyTestId;

    @Column(name = "teacher_subject_id")
    @JsonProperty("teacher_subject_id")
    private UUID teacherSubjectId;

    @Column(name = "subject_id")
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "test_date", nullable = false)
    @JsonProperty("test_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate testDate;

    @Column(name = "start_time")
    @JsonProperty("start_time")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @Column(name = "end_time")
    @JsonProperty("end_time")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @Column(name = "total_marks", nullable = false)
    @JsonProperty("total_marks")
    private Integer totalMarks;

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
