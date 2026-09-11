package com.educonnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "mobile", nullable = false, length = 15)
    private String mobile;

    @Column(name = "gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Explicit getters and setters
    public UUID getAdminId() { return adminId; }
    public void setAdminId(UUID adminId) { this.adminId = adminId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static AdminBuilder builder() {
        return new AdminBuilder();
    }

    public static class AdminBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String mobile;
        private String gender;
        private LocalDate dateOfBirth;
        private String address;
        private String profilePhoto;
        private Boolean isActive = true;

        public AdminBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AdminBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AdminBuilder email(String email) { this.email = email; return this; }
        public AdminBuilder password(String password) { this.password = password; return this; }
        public AdminBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public AdminBuilder gender(String gender) { this.gender = gender; return this; }
        public AdminBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public AdminBuilder address(String address) { this.address = address; return this; }
        public AdminBuilder profilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; return this; }
        public AdminBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Admin build() {
            Admin a = new Admin();
            a.setFirstName(firstName);
            a.setLastName(lastName);
            a.setEmail(email);
            a.setPassword(password);
            a.setMobile(mobile);
            a.setGender(gender);
            a.setDateOfBirth(dateOfBirth);
            a.setAddress(address);
            a.setProfilePhoto(profilePhoto);
            a.setIsActive(isActive);
            return a;
        }
    }
}
