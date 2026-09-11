package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "department_code", nullable = false, length = 30)
    @JsonProperty("department_code")
    private String departmentCode;

    @Column(name = "department_name", nullable = false, length = 150)
    @JsonProperty("department_name")
    private String departmentName;

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "duration_years", nullable = false)
    @JsonProperty("duration_years")
    @Builder.Default
    private Integer durationYears = 2;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;

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

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public UUID getInstituteId() { return instituteId; }
    public void setInstituteId(UUID instituteId) { this.instituteId = instituteId; }

    public Integer getDurationYears() { return durationYears; }
    public void setDurationYears(Integer durationYears) { this.durationYears = durationYears; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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
        if (durationYears == null) {
            durationYears = 2;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static DepartmentBuilder builder() {
        return new DepartmentBuilder();
    }

    public static class DepartmentBuilder {
        private String departmentCode;
        private String departmentName;
        private UUID instituteId;
        private Integer durationYears = 2;
        private String description;
        private Boolean isActive = true;

        public DepartmentBuilder departmentCode(String departmentCode) { this.departmentCode = departmentCode; return this; }
        public DepartmentBuilder departmentName(String departmentName) { this.departmentName = departmentName; return this; }
        public DepartmentBuilder instituteId(UUID instituteId) { this.instituteId = instituteId; return this; }
        public DepartmentBuilder durationYears(Integer durationYears) { this.durationYears = durationYears; return this; }
        public DepartmentBuilder description(String description) { this.description = description; return this; }
        public DepartmentBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Department build() {
            Department d = new Department();
            d.setDepartmentCode(departmentCode);
            d.setDepartmentName(departmentName);
            d.setInstituteId(instituteId);
            d.setDurationYears(durationYears);
            d.setDescription(description);
            d.setIsActive(isActive);
            return d;
        }
    }
}
