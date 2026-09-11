package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentEmailService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SemesterResultRepository semesterResultRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final EmailLogRepository emailLogRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public Map<String, Object> generatePreview(UUID studentId, String category, String teacherIdentifier) {
        String cleanIdentifier = (teacherIdentifier != null && !teacherIdentifier.trim().isEmpty())
                ? teacherIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> studentOpt = Optional.empty();
        if (studentId != null) {
            studentOpt = studentRepository.findById(studentId);
        }
        if (studentOpt.isEmpty() && cleanIdentifier != null && !cleanIdentifier.isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(cleanIdentifier);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(cleanIdentifier);
            }
        }

        if (studentOpt.isEmpty()) {
            Map<String, Object> errMap = new HashMap<>();
            errMap.put("is_valid", false);
            errMap.put("error", "Student record not found.");
            return errMap;
        }

        Student student = studentOpt.get();
        String studentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
        String enroll = student.getEnrollmentNo() != null ? student.getEnrollmentNo() : "";
        String parentName = student.getParentName() != null && !student.getParentName().trim().isEmpty() ? student.getParentName() : "Parent/Guardian";
        String parentEmail = student.getParentEmail() != null && !student.getParentEmail().trim().isEmpty() ? student.getParentEmail().trim() : null;

        boolean isParentEmailValid = parentEmail != null && parentEmail.contains("@");

        String cat = category != null ? category.trim() : "Attendance Report";
        String subject = "";
        String body = "";

        if (cat.contains("Attendance")) {
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(student.getStudentId());
            int total = records.size();
            long presentCount = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            long absentCount = total - presentCount;
            double pct = total > 0 ? (presentCount * 100.0 / total) : 0.0;
            String attStatus = pct >= 75.0 ? "Satisfactory" : "Low Attendance Warning (< 75%)";

            subject = "[EduConnect] Official Attendance Report - " + studentName + " (" + enroll + ")";
            body = "Dear " + parentName + ",\n\n"
                    + "This is an official Attendance Report fetched from the EduConnect Database for your ward " + studentName + " (Enrollment No: " + enroll + ").\n\n"
                    + "--- DATABASE ATTENDANCE REPORT ---\n"
                    + "Total Conducted Sessions: " + total + "\n"
                    + "Sessions Present: " + presentCount + "\n"
                    + "Sessions Absent: " + absentCount + "\n"
                    + "Attendance Percentage: " + String.format("%.2f", pct) + "%\n"
                    + "Status: " + attStatus + "\n\n"
                    + "Please contact the department faculty if you have any questions.\n\n"
                    + "Warm regards,\nEduConnect Academic Coordinator";
        } else if (cat.contains("Marksheet")) {
            List<SemesterResult> results = semesterResultRepository.findByStudentId(student.getStudentId());
            Optional<SemesterResult> pubResultOpt = results.stream().filter(r -> Boolean.TRUE.equals(r.getIsPublished())).findFirst();

            subject = "[EduConnect] Semester Marksheet & Performance - " + studentName + " (" + enroll + ")";
            if (pubResultOpt.isPresent()) {
                SemesterResult r = pubResultOpt.get();
                body = "Dear " + parentName + ",\n\n"
                        + "This is the official Semester Academic Marksheet Report fetched from the EduConnect Database for your ward " + studentName + " (Enrollment No: " + enroll + ").\n\n"
                        + "--- DATABASE MARKSHEET REPORT ---\n"
                        + "Semester SGPA: " + (r.getSgpa() != null ? r.getSgpa() : "N/A") + " / 10.0\n"
                        + "Cumulative CGPA: " + (r.getCgpa() != null ? r.getCgpa() : "N/A") + " / 10.0\n"
                        + "Result Status: " + (r.getResultStatus() != null ? r.getResultStatus() : "PASS") + "\n"
                        + "Published Date: " + (r.getPublishedAt() != null ? r.getPublishedAt().toLocalDate() : LocalDate.now()) + "\n\n"
                        + "Warm regards,\nDepartment Examination Committee";
            } else {
                body = "Dear " + parentName + ",\n\n"
                        + "Academic Record Notice for " + studentName + " (Enrollment No: " + enroll + "):\n\n"
                        + "No published semester result is currently available in the database for the active term.\n\n"
                        + "Warm regards,\nDepartment Examination Committee";
            }
        } else if (cat.contains("Weekly")) {
            List<WeeklyTestResult> testResults = weeklyTestResultRepository.findByStudentId(student.getStudentId());
            subject = "[EduConnect] Weekly Exam Evaluation Notice - " + studentName + " (" + enroll + ")";
            body = "Dear " + parentName + ",\n\n"
                    + "Your ward " + studentName + " (Enrollment No: " + enroll + ") has completed recent weekly technical test evaluations.\n\n"
                    + "Total Completed Tests: " + testResults.size() + "\n"
                    + "Evaluated test scores and faculty feedback have been recorded on the EduConnect Portal.\n\n"
                    + "Warm regards,\nDepartment Faculty Coordinator";
        } else {
            subject = "[EduConnect] Department Notice - " + studentName + " (" + enroll + ")";
            body = "Dear " + parentName + ",\n\n"
                    + "This is a general academic notification regarding department schedules, laboratory submissions, and upcoming examinations for " + studentName + " (Enrollment No: " + enroll + ").\n\n"
                    + "Warm regards,\nDepartment Faculty Coordinator";
        }

        Map<String, Object> preview = new HashMap<>();
        preview.put("student_id", student.getStudentId().toString());
        preview.put("student_name", studentName);
        preview.put("enrollment_no", enroll);
        preview.put("parent_name", parentName);
        preview.put("parent_email", parentEmail != null ? parentEmail : "Not Registered");
        preview.put("is_parent_email_valid", isParentEmailValid);
        preview.put("is_valid", isParentEmailValid);
        preview.put("subject", subject);
        preview.put("body", body);
        if (!isParentEmailValid) {
            preview.put("error", "Parent email address not registered in student database record.");
        }

        return preview;
    }

    @Transactional
    public Map<String, Object> sendParentEmails(Map<String, Object> reqData, String teacherIdentifier) {
        String cleanIdentifier = (teacherIdentifier != null && !teacherIdentifier.trim().isEmpty())
                ? teacherIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        UUID teacherId = UUID.nameUUIDFromBytes(cleanIdentifier.getBytes());
        Optional<Teacher> teacherOpt = teacherRepository.findByEmployeeId(cleanIdentifier);
        if (teacherOpt.isEmpty()) {
            teacherOpt = teacherRepository.findByEmail(cleanIdentifier);
        }
        if (teacherOpt.isPresent()) {
            teacherId = teacherOpt.get().getTeacherId();
        }

        String sendMode = reqData.get("send_mode") != null ? reqData.get("send_mode").toString() : "single";
        String category = reqData.get("category") != null ? reqData.get("category").toString() : "Attendance Report";
        String idempotencyKey = reqData.get("idempotency_key") != null ? reqData.get("idempotency_key").toString() : null;

        // Deduplication Check
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<EmailLog> existingLog = emailLogRepository.findByIdempotencyKey(idempotencyKey.trim());
            if (existingLog.isPresent()) {
                Map<String, Object> dupResponse = new HashMap<>();
                dupResponse.put("status", "DEDUPLICATED");
                dupResponse.put("message", "Request already processed with idempotency key: " + idempotencyKey);
                dupResponse.put("log", existingLog.get());
                return dupResponse;
            }
        }

        List<Student> targetStudents = new ArrayList<>();
        if ("single".equalsIgnoreCase(sendMode)) {
            String studentIdStr = reqData.get("student_id") != null ? reqData.get("student_id").toString() : null;
            if (studentIdStr != null && !studentIdStr.trim().isEmpty()) {
                studentRepository.findById(UUID.fromString(studentIdStr.trim())).ifPresent(targetStudents::add);
            }
        } else {
            targetStudents = studentRepository.findAll();
        }

        List<Map<String, Object>> results = new ArrayList<>();
        int sentCount = 0;
        int failedCount = 0;

        for (Student student : targetStudents) {
            String studentName = ((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : "")).trim();
            String parentEmail = student.getParentEmail() != null && !student.getParentEmail().trim().isEmpty() ? student.getParentEmail().trim() : null;

            Map<String, Object> preview = generatePreview(student.getStudentId(), category, cleanIdentifier);
            String subject = reqData.get("custom_subject") != null && !reqData.get("custom_subject").toString().trim().isEmpty()
                    ? reqData.get("custom_subject").toString().trim()
                    : (String) preview.get("subject");
            String body = reqData.get("custom_body") != null && !reqData.get("custom_body").toString().trim().isEmpty()
                    ? reqData.get("custom_body").toString().trim()
                    : (String) preview.get("body");

            Map<String, Object> rMap = new HashMap<>();
            rMap.put("student_id", student.getStudentId().toString());
            rMap.put("student_name", studentName);
            rMap.put("parent_email", parentEmail != null ? parentEmail : "Not Registered");

            // Prompt Rule: Validate missing parent_email. Do not silently substitute student address!
            if (parentEmail == null || !parentEmail.contains("@")) {
                failedCount++;
                rMap.put("status", "FAILED");
                rMap.put("error_detail", "Missing or invalid parent email address in database record.");

                // Persist EmailLog record for failed audit
                EmailLog logEntry = EmailLog.builder()
                        .senderId(teacherId)
                        .senderRole("TEACHER")
                        .recipientEmail(parentEmail != null ? parentEmail : "unregistered@educonnect.ac.in")
                        .recipientName(student.getParentName() != null ? student.getParentName() : "Parent")
                        .studentId(student.getStudentId())
                        .category(category)
                        .subject(subject != null ? subject : "Department Notice")
                        .bodySnapshot(body != null ? body : "")
                        .status("FAILED")
                        .errorDetail("Missing or invalid parent email address in database record.")
                        .idempotencyKey(idempotencyKey)
                        .build();
                emailLogRepository.save(logEntry);
                results.add(rMap);
                continue;
            }

            // Attempt SMTP dispatch
            String smtpError = emailService.sendGenericEmail(parentEmail, subject, body);
            boolean success = (smtpError == null);

            EmailLog logEntry = EmailLog.builder()
                    .senderId(teacherId)
                    .senderRole("TEACHER")
                    .recipientEmail(parentEmail)
                    .recipientName(student.getParentName() != null ? student.getParentName() : "Parent")
                    .studentId(student.getStudentId())
                    .category(category)
                    .subject(subject)
                    .bodySnapshot(body)
                    .status(success ? "SENT" : "FAILED")
                    .errorDetail(smtpError)
                    .idempotencyKey(idempotencyKey)
                    .build();
            emailLogRepository.save(logEntry);

            if (success) {
                sentCount++;
                rMap.put("status", "SENT");
                rMap.put("error_detail", null);
            } else {
                failedCount++;
                rMap.put("status", "FAILED");
                rMap.put("error_detail", smtpError);
            }
            results.add(rMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", targetStudents.size());
        response.put("sent_count", sentCount);
        response.put("failed_count", failedCount);
        response.put("results", results);
        response.put("success", failedCount == 0 && sentCount > 0);

        return response;
    }

    @Transactional
    public Map<String, Object> sendAssignmentReminders(UUID assignmentId, String teacherIdentifier) {
        String cleanIdentifier = (teacherIdentifier != null && !teacherIdentifier.trim().isEmpty())
                ? teacherIdentifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with ID: " + assignmentId));

        UUID teacherId = UUID.nameUUIDFromBytes(cleanIdentifier.getBytes());
        Optional<Teacher> teacherOpt = teacherRepository.findByEmployeeId(cleanIdentifier);
        if (teacherOpt.isEmpty()) {
            teacherOpt = teacherRepository.findByEmail(cleanIdentifier);
        }
        if (teacherOpt.isPresent()) {
            teacherId = teacherOpt.get().getTeacherId();
        }

        List<AssignmentSubmission> existingSubmissions = submissionRepository.findByAssignmentId(assignmentId);
        Set<UUID> submittedStudentIds = existingSubmissions.stream()
                .map(AssignmentSubmission::getStudentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Student> nonSubmitters = studentRepository.findAll().stream()
                .filter(s -> !submittedStudentIds.contains(s.getStudentId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> results = new ArrayList<>();
        int sentCount = 0;
        int failedCount = 0;

        for (Student s : nonSubmitters) {
            String recipientEmail = s.getParentEmail() != null && s.getParentEmail().contains("@")
                    ? s.getParentEmail()
                    : s.getEmail();
            String recipientName = s.getFirstName() + " " + s.getLastName();

            Map<String, Object> rMap = new HashMap<>();
            rMap.put("student_id", s.getStudentId().toString());
            rMap.put("student_name", recipientName);
            rMap.put("recipient_email", recipientEmail);

            if (recipientEmail == null || !recipientEmail.contains("@")) {
                failedCount++;
                rMap.put("status", "FAILED");
                rMap.put("error_detail", "No valid contact email found.");
                results.add(rMap);
                continue;
            }

            String subject = "[EduConnect Assignment Reminder] Due Date Approaching: " + assignment.getTitle();
            String body = "Dear Student / Parent,\n\n"
                    + "This is an official assignment submission reminder for " + recipientName + " (Enrollment: " + s.getEnrollmentNo() + ").\n\n"
                    + "Assignment Title: " + assignment.getTitle() + "\n"
                    + "Total Marks: " + assignment.getTotalMarks() + "\n"
                    + "Due Date: " + (assignment.getDueDate() != null ? assignment.getDueDate() : "Soon") + "\n\n"
                    + "Description:\n" + assignment.getDescription() + "\n\n"
                    + "Please ensure your work is submitted via the EduConnect Student Portal before the deadline.\n\n"
                    + "Warm regards,\nCourse Instructor";

            String smtpError = emailService.sendGenericEmail(recipientEmail, subject, body);
            boolean success = (smtpError == null);

            EmailLog logEntry = EmailLog.builder()
                    .senderId(teacherId)
                    .senderRole("TEACHER")
                    .recipientEmail(recipientEmail)
                    .recipientName(recipientName)
                    .studentId(s.getStudentId())
                    .assignmentId(assignmentId)
                    .category("Assignment Reminder")
                    .subject(subject)
                    .bodySnapshot(body)
                    .status(success ? "SENT" : "FAILED")
                    .errorDetail(smtpError)
                    .build();
            emailLogRepository.save(logEntry);

            if (success) {
                sentCount++;
                rMap.put("status", "SENT");
            } else {
                failedCount++;
                rMap.put("status", "FAILED");
                rMap.put("error_detail", smtpError);
            }
            results.add(rMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("assignment_id", assignmentId.toString());
        response.put("assignment_title", assignment.getTitle());
        response.put("non_submitters_count", nonSubmitters.size());
        response.put("sent_count", sentCount);
        response.put("failed_count", failedCount);
        response.put("results", results);

        return response;
    }
}
