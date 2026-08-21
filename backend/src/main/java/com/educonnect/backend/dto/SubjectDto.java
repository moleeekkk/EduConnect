package com.educonnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private UUID subjectId;
    private UUID programId;
    private UUID semesterId;

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    private Integer credits;
    private Integer semesterNo;
    private String subjectType;
    private Boolean isActive;
}
