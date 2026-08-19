package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "institutes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "institute_id")
    private UUID instituteId;

    @Column(name = "institute_code", nullable = false, unique = true, length = 20)
    private String instituteCode;

    @Column(name = "institute_name", nullable = false, length = 150)
    private String instituteName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_mobile", length = 20)
    private String contactMobile;

    @Column(name = "campus_location", length = 200)
    private String campusLocation;

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
