package com.educonnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private UUID studentId;

    @NotBlank(message = "Enrollment number is required")
    private String enrollmentNo;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email address is required")
    private String email;

    private String mobile;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String profilePhoto;

    private UUID instituteId;
    private String instituteName;

    private UUID programId;
    private String programName;

    private UUID semesterId;
    private String semesterName;

    private UUID divisionId;
    private String divisionName;

    private Boolean isActive;
}
