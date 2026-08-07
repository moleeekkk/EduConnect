package com.educonnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentOtpVerifyRequest {
    @NotBlank(message = "Enrollment Number is required")
    private String enrollmentNo;

    @NotBlank(message = "OTP code is required")
    private String otp;
}
