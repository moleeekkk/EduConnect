package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "leave_request_id", updatable = false, nullable = false)
    private UUID leaveRequestId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "batch_id")
    private UUID batchId;

    @Column(name = "leave_type", nullable = false, length = 50)
    @Builder.Default
    private String leaveType = "Sick";

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(name = "total_days", nullable = false)
    @Builder.Default
    private Integer totalDays = 1;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending"; // Pending, Approved, Rejected

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_date")
    private LocalDate reviewedDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
