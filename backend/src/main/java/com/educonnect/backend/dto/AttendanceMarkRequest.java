package com.educonnect.backend.dto;

import lombok.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceMarkRequest {

    private UUID teacherSubjectId;
    private String allocationId;
    private String subjectId;
    private String selectedSubject;
    private String sessionDate;
    private Integer lectureNo;
    private String startTime;
    private String endTime;
    private String topic;
    
    private List<StudentStatus> studentStatuses;
    private Map<String, String> studentStatusMap;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentStatus {
        private UUID studentId;
        private String studentIdStr;
        private String status; // "Present", "Absent", "Late"
        private String remarks;
    }
}
