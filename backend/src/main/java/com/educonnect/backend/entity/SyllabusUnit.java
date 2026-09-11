package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "syllabus_units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "unit_id")
    @JsonProperty("unit_id")
    private UUID unitId;

    @Column(name = "syllabus_id", nullable = false)
    @JsonProperty("syllabus_id")
    private UUID syllabusId;

    @Column(name = "unit_number", nullable = false)
    @JsonProperty("unit_number")
    private Integer unitNumber;

    @Column(name = "unit_title", nullable = false, length = 250)
    @JsonProperty("unit_title")
    private String unitTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

    @Column(name = "topics", columnDefinition = "TEXT")
    @JsonProperty("topics")
    private String topics;

    @Column(name = "created_at")
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public UUID getUnitId() { return unitId; }
    public void setUnitId(UUID unitId) { this.unitId = unitId; }

    public UUID getSyllabusId() { return syllabusId; }
    public void setSyllabusId(UUID syllabusId) { this.syllabusId = syllabusId; }

    public Integer getUnitNumber() { return unitNumber; }
    public void setUnitNumber(Integer unitNumber) { this.unitNumber = unitNumber; }

    public String getUnitTitle() { return unitTitle; }
    public void setUnitTitle(String unitTitle) { this.unitTitle = unitTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTopics() { return topics; }
    public void setTopics(String topics) { this.topics = topics; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
