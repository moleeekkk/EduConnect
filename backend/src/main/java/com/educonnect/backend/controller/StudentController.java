package com.educonnect.backend.controller;

import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> data = studentService.getStudentDashboard(enrollmentNo);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(
            @RequestParam(required = false) String enrollmentNo,
            @RequestParam(required = false) String studentId) {
        String identifier = (studentId != null && !studentId.trim().isEmpty()) ? studentId : enrollmentNo;
        List<Map<String, Object>> attendance = studentService.getStudentAttendance(identifier);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        List<Map<String, Object>> assignments = studentService.getStudentAssignments(enrollmentNo);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<AssignmentSubmission> submitAssignment(
            @PathVariable UUID assignmentId,
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo,
            @RequestBody Map<String, Object> reqData) {
        AssignmentSubmission submission = studentService.submitAssignment(assignmentId, enrollmentNo, reqData);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getStudentResults(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> results = studentService.getStudentResults(enrollmentNo);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getStudentProfile(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        Map<String, Object> profile = studentService.getStudentProfile(enrollmentNo);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateStudentProfile(
            @RequestBody Map<String, Object> reqData) {
        Map<String, Object> updated = studentService.updateStudentProfile(reqData);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/weekly-tests")
    public ResponseEntity<Map<String, Object>> getWeeklyTests(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getWeeklyTestsForStudent(enrollmentNo));
    }

    @GetMapping("/leave-requests")
    public ResponseEntity<List<com.educonnect.backend.entity.LeaveRequest>> getLeaveRequests(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getLeaveRequests(enrollmentNo));
    }

    @PostMapping("/leave-requests")
    public ResponseEntity<com.educonnect.backend.entity.LeaveRequest> submitLeaveRequest(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(studentService.submitLeaveRequest(enrollmentNo, reqData));
    }

    @GetMapping("/doubts")
    public ResponseEntity<List<com.educonnect.backend.entity.StudentDoubt>> getStudentDoubts(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getStudentDoubts(enrollmentNo));
    }

    @PostMapping("/doubts")
    public ResponseEntity<com.educonnect.backend.entity.StudentDoubt> askDoubt(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(studentService.askDoubt(enrollmentNo, reqData));
    }

    @PutMapping("/doubts/{id}")
    public ResponseEntity<com.educonnect.backend.entity.StudentDoubt> updateDoubt(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(studentService.updateDoubt(id, reqData));
    }

    @GetMapping("/study-materials")
    public ResponseEntity<List<Map<String, Object>>> getStudyMaterials(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getStudyMaterials(enrollmentNo));
    }

    @GetMapping("/quizzes")
    public ResponseEntity<List<Map<String, Object>>> getQuizzes(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getQuizzesForStudent(enrollmentNo));
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getTimetable(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getTimetable(enrollmentNo));
    }

    @GetMapping("/marksheet")
    public ResponseEntity<Map<String, Object>> getMarksheet(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getMarksheet(enrollmentNo));
    }

    @GetMapping("/syllabus")
    public ResponseEntity<List<Map<String, Object>>> getSyllabus() {
        return ResponseEntity.ok(studentService.getSyllabus());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Map<String, Object>>> getStudentSubjects(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getSubjectsForStudent(enrollmentNo));
    }

    @GetMapping("/digital-id")
    public ResponseEntity<Map<String, Object>> getDigitalID(
            @RequestParam(required = false, defaultValue = "2024MCA001") String enrollmentNo) {
        return ResponseEntity.ok(studentService.getDigitalID(enrollmentNo));
    }
}
