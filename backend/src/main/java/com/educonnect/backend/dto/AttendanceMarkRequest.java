package com.educonnect.backend.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceMarkRequest {

    private UUID teacherSubjectId;
    private String sessionDate;
    private Integer lectureNo;
    private String topic;
    private List<StudentStatus> studentStatuses;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentStatus {
        private UUID studentId;
        private String status; // "Present", "Absent", "Late"
        private String remarks;
    }
}
