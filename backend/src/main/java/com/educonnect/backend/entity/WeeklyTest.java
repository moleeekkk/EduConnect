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
@Data
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

    @Column(name = "is_published")
    @JsonProperty("is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public UUID getWeeklyTestId() { return weeklyTestId; }
    public void setWeeklyTestId(UUID weeklyTestId) { this.weeklyTestId = weeklyTestId; }

    public UUID getTeacherSubjectId() { return teacherSubjectId; }
    public void setTeacherSubjectId(UUID teacherSubjectId) { this.teacherSubjectId = teacherSubjectId; }

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getTestDate() { return testDate; }
    public void setTestDate(LocalDate testDate) { this.testDate = testDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Boolean getIsPublished() { return isPublished != null ? isPublished : false; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

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
}
