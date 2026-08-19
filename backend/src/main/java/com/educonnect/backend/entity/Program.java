package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "program_id")
    private UUID programId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institute_id")
    private Institute institute;

    @Column(name = "program_code", nullable = false, unique = true, length = 20)
    private String programCode;

    @Column(name = "program_name", nullable = false, length = 150)
    private String programName;

    @Column(name = "duration_years", nullable = false)
    @Builder.Default
    private Integer durationYears = 2;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
