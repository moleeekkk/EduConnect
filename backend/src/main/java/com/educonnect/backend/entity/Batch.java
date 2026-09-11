package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "batch_id")
    @JsonProperty("batch_id")
    private UUID batchId;

    @Column(name = "batch_name", nullable = false, length = 100)
    @JsonProperty("batch_name")
    private String batchName;

    @Column(name = "start_year", nullable = false)
    @JsonProperty("start_year")
    private Integer startYear;

    @Column(name = "end_year", nullable = false)
    @JsonProperty("end_year")
    private Integer endYear;

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

    public UUID getBatchId() { return batchId; }
    public void setBatchId(UUID batchId) { this.batchId = batchId; }

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public Integer getStartYear() { return startYear; }
    public void setStartYear(Integer startYear) { this.startYear = startYear; }

    public Integer getEndYear() { return endYear; }
    public void setEndYear(Integer endYear) { this.endYear = endYear; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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

    public static BatchBuilder builder() {
        return new BatchBuilder();
    }

    public static class BatchBuilder {
        private String batchName;
        private Integer startYear;
        private Integer endYear;
        private Boolean isActive = true;

        public BatchBuilder batchName(String batchName) { this.batchName = batchName; return this; }
        public BatchBuilder startYear(Integer startYear) { this.startYear = startYear; return this; }
        public BatchBuilder endYear(Integer endYear) { this.endYear = endYear; return this; }
        public BatchBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Batch build() {
            Batch b = new Batch();
            b.setBatchName(batchName);
            b.setStartYear(startYear);
            b.setEndYear(endYear);
            b.setIsActive(isActive);
            return b;
        }
    }
}
