package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "subject_id")
    private UUID subjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id_ref")
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id_ref")
    private Semester semester;

    @Column(name = "program_id")
    private UUID programId;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "subject_code", nullable = false, unique = true, length = 20)
    private String subjectCode;

    @Column(name = "credits", nullable = false)
    private Integer credits;

    @Column(name = "semester_no", nullable = false)
    private Integer semesterNo;

    @Column(name = "subject_type", nullable = false, length = 20)
    private String subjectType; // Theory, Practical

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
