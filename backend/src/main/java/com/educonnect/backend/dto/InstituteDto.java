package com.educonnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstituteDto {
    private UUID instituteId;

    @NotBlank(message = "Institute code is required")
    private String instituteCode;

    @NotBlank(message = "Institute name is required")
    private String instituteName;

    private String description;
    private String contactEmail;
    private String contactMobile;
    private String campusLocation;
    private Boolean isActive;
}
