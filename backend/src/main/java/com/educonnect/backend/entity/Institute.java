package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "institute_code", nullable = false, unique = true, length = 30)
    @JsonProperty("institute_code")
    private String instituteCode;

    @Column(name = "institute_name", nullable = false, length = 150)
    @JsonProperty("institute_name")
    private String instituteName;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "contact_email", length = 100)
    @JsonProperty("contact_email")
    private String contactEmail;

    @Column(name = "contact_mobile", length = 30)
    @JsonProperty("contact_mobile")
    private String contactMobile;

    @Column(name = "campus_location", length = 200)
    @JsonProperty("campus_location")
    private String campusLocation;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    @JsonProperty("is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
