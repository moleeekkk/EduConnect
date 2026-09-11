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
@Data
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

    @Column(name = "institute_id")
    @JsonProperty("institute_id")
    private UUID instituteId;

    @Column(name = "department_id")
    @JsonProperty("department_id")
    private UUID departmentId;

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

    // Explicit getters & setters for compiler safety
    public UUID getTeacherId() { return teacherId; }
    public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public UUID getInstituteId() { return instituteId; }
    public void setInstituteId(UUID instituteId) { this.instituteId = instituteId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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

    public static TeacherBuilder builder() {
        return new TeacherBuilder();
    }

    public static class TeacherBuilder {
        private String employeeId;
        private String firstName;
        private String lastName;
        private String surname;
        private String email;
        private String password;
        private String mobile;
        private String gender;
        private LocalDate dateOfBirth;
        private String designation;
        private String qualification;
        private Integer experience = 0;
        private LocalDate joiningDate;
        private String address;
        private String profilePhoto;
        private UUID instituteId;
        private UUID departmentId;
        private Boolean isActive = true;

        public TeacherBuilder employeeId(String employeeId) { this.employeeId = employeeId; return this; }
        public TeacherBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public TeacherBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public TeacherBuilder surname(String surname) { this.surname = surname; return this; }
        public TeacherBuilder email(String email) { this.email = email; return this; }
        public TeacherBuilder password(String password) { this.password = password; return this; }
        public TeacherBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public TeacherBuilder gender(String gender) { this.gender = gender; return this; }
        public TeacherBuilder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public TeacherBuilder designation(String designation) { this.designation = designation; return this; }
        public TeacherBuilder qualification(String qualification) { this.qualification = qualification; return this; }
        public TeacherBuilder experience(Integer experience) { this.experience = experience; return this; }
        public TeacherBuilder joiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; return this; }
        public TeacherBuilder address(String address) { this.address = address; return this; }
        public TeacherBuilder profilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; return this; }
        public TeacherBuilder instituteId(UUID instituteId) { this.instituteId = instituteId; return this; }
        public TeacherBuilder departmentId(UUID departmentId) { this.departmentId = departmentId; return this; }
        public TeacherBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Teacher build() {
            Teacher t = new Teacher();
            t.setEmployeeId(employeeId);
            t.setFirstName(firstName);
            t.setLastName(lastName);
            t.setSurname(surname);
            t.setEmail(email);
            t.setPassword(password);
            t.setMobile(mobile);
            t.setGender(gender);
            t.setDateOfBirth(dateOfBirth);
            t.setDesignation(designation);
            t.setQualification(qualification);
            t.setExperience(experience);
            t.setJoiningDate(joiningDate);
            t.setAddress(address);
            t.setProfilePhoto(profilePhoto);
            t.setInstituteId(instituteId);
            t.setDepartmentId(departmentId);
            t.setIsActive(isActive);
            return t;
        }
    }
}
