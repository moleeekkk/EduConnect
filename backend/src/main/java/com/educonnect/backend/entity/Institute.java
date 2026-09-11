package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "institutes")
@Data
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

    public UUID getInstituteId() { return instituteId; }
    public void setInstituteId(UUID instituteId) { this.instituteId = instituteId; }

    public String getInstituteCode() { return instituteCode; }
    public void setInstituteCode(String instituteCode) { this.instituteCode = instituteCode; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactMobile() { return contactMobile; }
    public void setContactMobile(String contactMobile) { this.contactMobile = contactMobile; }

    public String getCampusLocation() { return campusLocation; }
    public void setCampusLocation(String campusLocation) { this.campusLocation = campusLocation; }

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

    public static InstituteBuilder builder() {
        return new InstituteBuilder();
    }

    public static class InstituteBuilder {
        private String instituteCode;
        private String instituteName;
        private String description;
        private String contactEmail;
        private String contactMobile;
        private String campusLocation;
        private Boolean isActive = true;

        public InstituteBuilder instituteCode(String instituteCode) { this.instituteCode = instituteCode; return this; }
        public InstituteBuilder instituteName(String instituteName) { this.instituteName = instituteName; return this; }
        public InstituteBuilder description(String description) { this.description = description; return this; }
        public InstituteBuilder contactEmail(String contactEmail) { this.contactEmail = contactEmail; return this; }
        public InstituteBuilder contactMobile(String contactMobile) { this.contactMobile = contactMobile; return this; }
        public InstituteBuilder campusLocation(String campusLocation) { this.campusLocation = campusLocation; return this; }
        public InstituteBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Institute build() {
            Institute i = new Institute();
            i.setInstituteCode(instituteCode);
            i.setInstituteName(instituteName);
            i.setDescription(description);
            i.setContactEmail(contactEmail);
            i.setContactMobile(contactMobile);
            i.setCampusLocation(campusLocation);
            i.setIsActive(isActive);
            return i;
        }
    }
}
