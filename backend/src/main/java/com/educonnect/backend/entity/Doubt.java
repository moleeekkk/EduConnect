package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doubts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "doubt_id", updatable = false, nullable = false)
    private UUID doubtId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "subject_id")
    private UUID subjectId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "semester_id")
    private UUID semesterId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "Pending"; // Pending, Answered

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
