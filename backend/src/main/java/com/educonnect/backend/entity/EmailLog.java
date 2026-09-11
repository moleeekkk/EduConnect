package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "email_log_id", updatable = false, nullable = false)
    @JsonProperty("email_log_id")
    private UUID emailLogId;

    @Column(name = "sender_id", nullable = false)
    @JsonProperty("sender_id")
    private UUID senderId;

    @Column(name = "sender_role", nullable = false, length = 30)
    @JsonProperty("sender_role")
    private String senderRole;

    @Column(name = "recipient_email", nullable = false, length = 150)
    @JsonProperty("recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_name", length = 150)
    @JsonProperty("recipient_name")
    private String recipientName;

    @Column(name = "student_id")
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "assignment_id")
    @JsonProperty("assignment_id")
    private UUID assignmentId;

    @Column(name = "category", nullable = false, length = 50)
    @JsonProperty("category")
    private String category;

    @Column(name = "subject", nullable = false, length = 250)
    @JsonProperty("subject")
    private String subject;

    @Column(name = "body_snapshot", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("body_snapshot")
    private String bodySnapshot;

    @Column(name = "status", nullable = false, length = 30)
    @JsonProperty("status")
    private String status; // SENT, FAILED, ACCEPTED

    @Column(name = "error_detail", columnDefinition = "TEXT")
    @JsonProperty("error_detail")
    private String errorDetail;

    @Column(name = "idempotency_key", length = 100)
    @JsonProperty("idempotency_key")
    private String idempotencyKey;

    @Column(name = "sent_at", nullable = false)
    @JsonProperty("sent_at")
    private LocalDateTime sentAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
