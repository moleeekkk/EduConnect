package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "leave_request_id")
    @JsonProperty("leave_request_id")
    private UUID leaveRequestId;

    @Column(name = "student_id")
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "enrollment_no", length = 50)
    @JsonProperty("enrollment_no")
    private String enrollmentNo;

    @Column(name = "leave_type", nullable = false, length = 50)
    @JsonProperty("leave_type")
    private String leaveType; // "Sick", "Casual", "Emergency", "Academic"

    @Column(name = "from_date", nullable = false)
    @JsonProperty("from_date")
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    @JsonProperty("to_date")
    private LocalDate toDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    @JsonProperty("reason")
    private String reason;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    @JsonProperty("status")
    private String status = "Pending"; // "Pending", "Approved", "Rejected"

    @Column(name = "reviewed_by", length = 100)
    @JsonProperty("reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_date")
    @JsonProperty("reviewed_date")
    private LocalDate reviewedDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    @JsonProperty("remarks")
    private String remarks;

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
        if (status == null) status = "Pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
