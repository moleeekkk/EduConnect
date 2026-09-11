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
@Data
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

    // Explicit getters & setters for compiler compatibility
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getEnrollmentNo() { return enrollmentNo; }
    public void setEnrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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

    public UUID getInstituteId() { return instituteId; }
    public void setInstituteId(UUID instituteId) { this.instituteId = instituteId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getSemesterId() { return semesterId; }
    public void setSemesterId(UUID semesterId) { this.semesterId = semesterId; }

    public UUID getBatchId() { return batchId; }
    public void setBatchId(UUID batchId) { this.batchId = batchId; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentMobile() { return parentMobile; }
    public void setParentMobile(String parentMobile) { this.parentMobile = parentMobile; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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

    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private String enrollmentNo;
        private String firstName;
        private String lastName;
        private String surname;
        private String email;
        private String mobile;
        private String gender;
        private LocalDate dateOfBirth;
        private String address;
        private String profilePhoto;
        private UUID instituteId;
        private UUID departmentId;
        private UUID semesterId;
        private UUID batchId;
        private String parentName;
        private String parentMobile;
        private String parentEmail;
        private String bloodGroup;
        private LocalDate admissionDate;
        private Boolean isActive = true;

        public StudentBuilder enrollmentNo(String enrollmentNo) { this.enrollmentNo = enrollmentNo; return this; }
        public StudentBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public StudentBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public StudentBuilder surname(String surname) { this.surname = surname; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public StudentBuilder gender(String gender) { this.gender = gender; return this; }
        public StudentBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public StudentBuilder address(String address) { this.address = address; return this; }
        public StudentBuilder profilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; return this; }
        public StudentBuilder instituteId(UUID instituteId) { this.instituteId = instituteId; return this; }
        public StudentBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public StudentBuilder semesterId(UUID semesterId) { this.semesterId = semesterId; return this; }
        public StudentBuilder batchId(UUID batchId) { this.batchId = batchId; return this; }
        public StudentBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public StudentBuilder parentMobile(String parentMobile) { this.parentMobile = parentMobile; return this; }
        public StudentBuilder parentEmail(String parentEmail) { this.parentEmail = parentEmail; return this; }
        public StudentBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public StudentBuilder admissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; return this; }
        public StudentBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Student build() {
            Student s = new Student();
            s.setEnrollmentNo(enrollmentNo);
            s.setFirstName(firstName);
            s.setLastName(lastName);
            s.setSurname(surname);
            s.setEmail(email);
            s.setMobile(mobile);
            s.setGender(gender);
            s.setDateOfBirth(dateOfBirth);
            s.setAddress(address);
            s.setProfilePhoto(profilePhoto);
            s.setInstituteId(instituteId);
            s.setDepartmentId(departmentId);
            s.setSemesterId(semesterId);
            s.setBatchId(batchId);
            s.setParentName(parentName);
            s.setParentMobile(parentMobile);
            s.setParentEmail(parentEmail);
            s.setBloodGroup(bloodGroup);
            s.setAdmissionDate(admissionDate);
            s.setIsActive(isActive);
            return s;
        }
    }
}
