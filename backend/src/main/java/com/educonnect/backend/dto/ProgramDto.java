package com.educonnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramDto {
    private UUID programId;
    private UUID instituteId;

    @NotBlank(message = "Program code is required")
    private String programCode;

    @NotBlank(message = "Program name is required")
    private String programName;

    private Integer durationYears;
    private Boolean isActive;
    private Integer totalSemesters;
}
