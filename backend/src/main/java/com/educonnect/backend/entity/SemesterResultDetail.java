package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "semester_result_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterResultDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "detail_id")
    @JsonProperty("detail_id")
    private UUID detailId;

    @Column(name = "result_id", nullable = false)
    @JsonProperty("result_id")
    private UUID resultId;

    @Column(name = "student_id", nullable = false)
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "subject_id", nullable = false)
    @JsonProperty("subject_id")
    private UUID subjectId;

    @Column(name = "semester_id", nullable = false)
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "credits", nullable = false)
    @JsonProperty("credits")
    private Integer credits;

    @Column(name = "internal_marks", nullable = false, precision = 5, scale = 2)
    @JsonProperty("internal_marks")
    private BigDecimal internalMarks;

    @Column(name = "external_marks", nullable = false, precision = 5, scale = 2)
    @JsonProperty("external_marks")
    private BigDecimal externalMarks;

    @Column(name = "obtained_marks", nullable = false, precision = 5, scale = 2)
    @JsonProperty("obtained_marks")
    private BigDecimal obtainedMarks;

    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    @JsonProperty("total_marks")
    private BigDecimal totalMarks;

    @Column(name = "percentage", nullable = false, precision = 5, scale = 2)
    @JsonProperty("percentage")
    private BigDecimal percentage;

    @Column(name = "grade", nullable = false, length = 10)
    @JsonProperty("grade")
    private String grade;

    @Column(name = "grade_point", nullable = false, precision = 4, scale = 2)
    @JsonProperty("grade_point")
    private BigDecimal gradePoint;

    @Column(name = "result_status", nullable = false, length = 20)
    @JsonProperty("result_status")
    private String resultStatus; // PASS, FAIL

    @Column(name = "remarks")
    @JsonProperty("remarks")
    private String remarks;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    @JsonProperty("is_published")
    private Boolean isPublished = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonProperty("semester_result_detail_id")
    public UUID getSemesterResultDetailId() {
        return detailId;
    }

    @JsonProperty("id")
    public UUID getId() {
        return detailId;
    }

    @PrePersist
    protected void onCreate() {
        if (credits == null) credits = 4;
        if (internalMarks == null) internalMarks = BigDecimal.ZERO;
        if (externalMarks == null) externalMarks = BigDecimal.ZERO;
        if (obtainedMarks == null) obtainedMarks = BigDecimal.ZERO;
        if (totalMarks == null) totalMarks = new BigDecimal("100.00");
        if (percentage == null) percentage = BigDecimal.ZERO;
        if (grade == null) grade = "F";
        if (gradePoint == null) gradePoint = BigDecimal.ZERO;
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
