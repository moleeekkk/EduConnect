package com.educonnect.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterDto {
    private UUID semesterId;
    private UUID programId;
    private Integer semesterNumber;
    private String semesterName;
    private Boolean isActive;
}
