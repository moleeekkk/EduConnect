package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_test_results")
@Data
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

    public UUID getWeeklyTestResultId() { return weeklyTestResultId; }
    public void setWeeklyTestResultId(UUID weeklyTestResultId) { this.weeklyTestResultId = weeklyTestResultId; }

    public UUID getWeeklyTestId() { return weeklyTestId; }
    public void setWeeklyTestId(UUID weeklyTestId) { this.weeklyTestId = weeklyTestId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public Integer getObtainedMarks() { return obtainedMarks; }
    public void setObtainedMarks(Integer obtainedMarks) { this.obtainedMarks = obtainedMarks; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

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

    public static WeeklyTestResultBuilder builder() {
        return new WeeklyTestResultBuilder();
    }

    public static class WeeklyTestResultBuilder {
        private UUID weeklyTestId;
        private UUID studentId;
        private Integer obtainedMarks;
        private String grade;
        private String remarks;

        public WeeklyTestResultBuilder weeklyTestId(UUID weeklyTestId) { this.weeklyTestId = weeklyTestId; return this; }
        public WeeklyTestResultBuilder studentId(UUID studentId) { this.studentId = studentId; return this; }
        public WeeklyTestResultBuilder obtainedMarks(Integer obtainedMarks) { this.obtainedMarks = obtainedMarks; return this; }
        public WeeklyTestResultBuilder grade(String grade) { this.grade = grade; return this; }
        public WeeklyTestResultBuilder remarks(String remarks) { this.remarks = remarks; return this; }

        public WeeklyTestResult build() {
            WeeklyTestResult w = new WeeklyTestResult();
            w.setWeeklyTestId(weeklyTestId);
            w.setStudentId(studentId);
            w.setObtainedMarks(obtainedMarks);
            w.setGrade(grade);
            w.setRemarks(remarks);
            return w;
        }
    }
}
