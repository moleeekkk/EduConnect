package com.educonnect.backend.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResultDto {

    private UUID resultId;
    private String result_id;

    private UUID teacherSubjectId;
    private String allocationId;
    private String subjectId;

    private String examName;
    private String exam_name;
    private String exam;

    private String examDate;
    private String exam_date;

    private Double maximumMarks;
    private Double maximum_marks;
    private Double total_marks;

    private UUID studentId;
    private String student_id;
    private String studentIdStr;

    private Double obtainedMarks;
    private Double obtained_marks;
    private Double marks;

    private String grade;
    private String remarks;

    private List<StudentMarkItem> studentMarks;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentMarkItem {
        private UUID studentId;
        private String studentIdStr;
        private String student_id;
        private Double obtainedMarks;
        private Double obtained_marks;
        private Double marks;
        private String remarks;
    }
}
