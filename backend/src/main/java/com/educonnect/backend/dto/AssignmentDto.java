package com.educonnect.backend.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDto {

    private UUID assignmentId;
    private String assignment_id;

    private UUID teacherSubjectId;
    private String allocationId;
    private String subjectId;

    private String title;
    private String description;
    private String dueDate;
    private String due_date;

    private Integer totalMarks;
    private Integer total_marks;

    private String attachment;
    private String refFileName;

    // For Grading Submissions
    private UUID submissionId;
    private String submission_id;
    private Integer obtainedMarks;
    private Integer obtained_marks;
    private String feedback;
}
