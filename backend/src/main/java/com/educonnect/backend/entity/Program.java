package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("program_id")
    private UUID programId;

    @Column(name = "program_code", nullable = false, length = 30)
    @JsonProperty("program_code")
    private String programCode;

    @Column(name = "program_name", nullable = false, length = 150)
    @JsonProperty("program_name")
    private String programName;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "degree_type", length = 50)
    @JsonProperty("degree_type")
    @Builder.Default
    private String degreeType = "Master";

    @Column(name = "total_semesters")
    @JsonProperty("total_semesters")
    @Builder.Default
    private Integer totalSemesters = 4;

    @Column(name = "duration_years")
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

    public UUID getProgramId() { return programId; }
    public void setProgramId(UUID programId) { this.programId = programId; }

    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getInstituteId() { return instituteId; }
    public void setInstituteId(UUID instituteId) { this.instituteId = instituteId; }

    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }

    public Integer getTotalSemesters() { return totalSemesters; }
    public void setTotalSemesters(Integer totalSemesters) { this.totalSemesters = totalSemesters; }

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
        if (totalSemesters == null) {
            totalSemesters = 4;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static ProgramBuilder builder() {
        return new ProgramBuilder();
    }

    public static class ProgramBuilder {
        private String programCode;
        private String programName;
        private UUID departmentId;
        private UUID instituteId;
        private String degreeType = "Master";
        private Integer totalSemesters = 4;
        private Integer durationYears = 2;
        private String description;
        private Boolean isActive = true;

        public ProgramBuilder programCode(String programCode) { this.programCode = programCode; return this; }
        public ProgramBuilder programName(String programName) { this.programName = programName; return this; }
        public ProgramBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public ProgramBuilder instituteId(UUID instituteId) { this.instituteId = instituteId; return this; }
        public ProgramBuilder degreeType(String degreeType) { this.degreeType = degreeType; return this; }
        public ProgramBuilder totalSemesters(Integer totalSemesters) { this.totalSemesters = totalSemesters; return this; }
        public ProgramBuilder durationYears(Integer durationYears) { this.durationYears = durationYears; return this; }
        public ProgramBuilder description(String description) { this.description = description; return this; }
        public ProgramBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Program build() {
            Program p = new Program();
            p.setProgramCode(programCode);
            p.setProgramName(programName);
            p.setDepartmentId(departmentId);
            p.setInstituteId(instituteId);
            p.setDegreeType(degreeType);
            p.setTotalSemesters(totalSemesters);
            p.setDurationYears(durationYears);
            p.setDescription(description);
            p.setIsActive(isActive);
            return p;
        }
    }
}
