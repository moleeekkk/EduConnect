package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "teacher_id")
    @JsonProperty("teacher_id")
    private UUID teacherId;

    @Column(name = "employee_id", length = 30)
    @JsonProperty("employee_id")
    private String employeeId;

    @Column(name = "first_name", nullable = false, length = 50)
    @JsonProperty("first_name")
    private String firstName;

    @Column(name = "last_name", length = 50)
    @JsonProperty("last_name")
    private String lastName;

    @Column(name = "surname", length = 50)
    @JsonProperty("surname")
    private String surname;

    @Column(name = "email", nullable = false, length = 100)
    @JsonProperty("email")
    private String email;

    @Column(name = "password")
    @JsonProperty("password")
    private String password;

    @Column(name = "mobile", length = 15)
    @JsonProperty("mobile")
    private String mobile;

    @Column(name = "gender", length = 10)
    @JsonProperty("gender")
    private String gender;

    @Column(name = "designation", length = 50)
    @JsonProperty("designation")
    private String designation;

    @Column(name = "qualification", length = 100)
    @JsonProperty("qualification")
    private String qualification;

    @Column(name = "experience")
    @JsonProperty("experience")
    private Integer experience;

    @Column(name = "joining_date")
    @JsonProperty("joining_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

    @Column(name = "date_of_birth")
    @JsonProperty("date_of_birth")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Column(name = "address", columnDefinition = "TEXT")
    @JsonProperty("address")
    private String address;

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    @JsonProperty("profile_photo")
    private String profilePhoto;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    @JsonProperty("is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (password == null || password.trim().isEmpty()) {
            password = "teacher123";
        }
        if (employeeId == null) {
            employeeId = "";
        }
        if (lastName == null) {
            lastName = "";
        }
        if (mobile == null || mobile.trim().isEmpty()) {
            mobile = "N/A";
        }
        if (gender == null || gender.trim().isEmpty()) {
            gender = "Male";
        }
        if (designation == null || designation.trim().isEmpty()) {
            designation = "Faculty Member";
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
