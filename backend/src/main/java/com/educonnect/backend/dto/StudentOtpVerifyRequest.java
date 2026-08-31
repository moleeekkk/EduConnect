package com.educonnect.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentOtpVerifyRequest {
    @NotBlank(message = "Enrollment Number is required")
    @JsonProperty("enrollment_no")
    @JsonAlias({"enrollmentNo", "enrollment_no"})
    private String enrollmentNo;

    @NotBlank(message = "OTP code is required")
    @JsonProperty("otp")
    private String otp;
}
