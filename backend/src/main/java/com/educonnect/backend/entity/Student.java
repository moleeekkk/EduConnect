package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "student_id")
    @JsonProperty("student_id")
    private UUID studentId;

    @Column(name = "enrollment_no", nullable = false, length = 30)
    @JsonProperty("enrollment_no")
    private String enrollmentNo;

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

    @Column(name = "mobile", length = 15)
    @JsonProperty("mobile")
    private String mobile;

    @Column(name = "gender", length = 10)
    @JsonProperty("gender")
    private String gender;

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

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

    @Column(name = "semester_id")
    @JsonProperty("semester_id")
    private UUID semesterId;

    @Column(name = "batch_id")
    @JsonProperty("batch_id")
    private UUID batchId;

    @Column(name = "parent_name", length = 100)
    @JsonProperty("parent_name")
    private String parentName;

    @Column(name = "parent_mobile", length = 15)
    @JsonProperty("parent_mobile")
    private String parentMobile;

    @Column(name = "parent_email", length = 100)
    @JsonProperty("parent_email")
    private String parentEmail;

    @Column(name = "blood_group", length = 10)
    @JsonProperty("blood_group")
    private String bloodGroup;

    @Column(name = "admission_date")
    @JsonProperty("admission_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate admissionDate;

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
        if (enrollmentNo == null || enrollmentNo.trim().isEmpty()) {
            enrollmentNo = "25CI" + (System.currentTimeMillis() % 100000);
        }
        if (firstName == null || firstName.trim().isEmpty()) {
            firstName = "Student";
        }
        if (lastName == null) {
            lastName = "";
        }
        if (email == null || email.trim().isEmpty()) {
            email = "student" + (System.currentTimeMillis() % 10000) + "@educonnect.ac.in";
        }
        if (mobile == null || mobile.trim().isEmpty()) {
            mobile = "N/A";
        }
        if (gender == null || gender.trim().isEmpty()) {
            gender = "Male";
        }
        if (isActive == null) {
            isActive = true;
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
