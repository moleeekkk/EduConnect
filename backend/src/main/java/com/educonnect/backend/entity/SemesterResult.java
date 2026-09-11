package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "semester_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "result_id")
    @JsonProperty("result_id")
    private UUID resultId;

    @Column(name = "student_id", nullable = false)
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "semester_id", nullable = false)
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "department_id", nullable = false)
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "sgpa", nullable = false, precision = 5, scale = 2)
    @JsonProperty("sgpa")
    private BigDecimal sgpa;

    @Column(name = "cgpa", nullable = false, precision = 5, scale = 2)
    @JsonProperty("cgpa")
    private BigDecimal cgpa;

    @Column(name = "total_credits", nullable = false)
    @JsonProperty("total_credits")
    private Integer totalCredits;

    @Column(name = "earned_credits", nullable = false)
    @JsonProperty("earned_credits")
    private Integer earnedCredits;

    @Column(name = "total_marks", nullable = false, precision = 7, scale = 2)
    @JsonProperty("total_marks")
    private BigDecimal totalMarks;

    @Column(name = "obtained_marks", nullable = false, precision = 7, scale = 2)
    @JsonProperty("obtained_marks")
    private BigDecimal obtainedMarks;

    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    @JsonProperty("percentage")
    private BigDecimal percentage;

    @Column(name = "result_status", nullable = false, length = 20)
    @JsonProperty("result_status")
    private String resultStatus; // PASS, FAIL, DRAFT, PUBLISHED

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    @JsonProperty("is_published")
    private Boolean isPublished = false;

    @Column(name = "published_at")
    @JsonProperty("published_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    @JsonProperty("published_by")
    private UUID publishedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonProperty("id")
    public UUID getId() {
        return resultId;
    }

    @PrePersist
    protected void onCreate() {
        if (sgpa == null) sgpa = BigDecimal.ZERO;
        if (cgpa == null) cgpa = BigDecimal.ZERO;
        if (totalCredits == null) totalCredits = 0;
        if (earnedCredits == null) earnedCredits = 0;
        if (totalMarks == null) totalMarks = BigDecimal.ZERO;
        if (obtainedMarks == null) obtainedMarks = BigDecimal.ZERO;
        if (percentage == null) percentage = BigDecimal.ZERO;
        if (resultStatus == null) resultStatus = "PASS";
        if (isPublished == null) isPublished = false;
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
