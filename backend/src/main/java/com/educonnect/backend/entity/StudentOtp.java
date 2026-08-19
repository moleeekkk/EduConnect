package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_otps", indexes = {
    @Index(name = "idx_student_otp_enrollment", columnList = "enrollment_no"),
    @Index(name = "idx_student_otp_email", columnList = "email"),
    @Index(name = "idx_student_otp_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "otp_id")
    private UUID otpId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "enrollment_no", nullable = false, length = 50)
    private String enrollmentNo;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "otp_hash", nullable = false, length = 64)
    private String otpHash; // SHA-256 hash of 6-digit OTP

    @Column(name = "purpose", nullable = false, length = 30)
    @Builder.Default
    private String purpose = "LOGIN";

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private Boolean used = false;

    @Column(name = "last_sent_at", nullable = false)
    private LocalDateTime lastSentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lastSentAt == null) {
            lastSentAt = LocalDateTime.now();
        }
    }
}
