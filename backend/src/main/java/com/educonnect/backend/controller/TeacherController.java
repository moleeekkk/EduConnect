package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AssignmentDto;
import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.dto.ExamResultDto;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/teacher", "/api/teacher"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    // --- TEACHER PROFILE ---
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(Principal principal) {
        Map<String, Object> profile = teacherService.getTeacherProfile(principal);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateTeacherProfile(
            @RequestBody Map<String, Object> body,
            Principal principal) {
        Map<String, Object> updated = teacherService.updateTeacherProfile(body, principal);
        return ResponseEntity.ok(updated);
    }

    // --- TEACHER DASHBOARD ---
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        Map<String, Object> data = teacherService.getTeacherDashboard(teacherId, principal);
        return ResponseEntity.ok(data);
    }

    // --- ASSIGNED SUBJECTS ---
    @GetMapping({"/subjects", "/my-subjects"})
    public ResponseEntity<List<Map<String, Object>>> getMyAssignedSubjects(
            @RequestParam(required = false) String teacherId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getMyAssignedSubjects(teacherId, principal);
        return ResponseEntity.ok(list);
    }

    // --- ASSIGNED STUDENTS FOR ATTENDANCE & MARKS ---
    @GetMapping({"/students", "/attendance/students"})
    public ResponseEntity<List<Map<String, Object>>> getAssignedStudents(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) UUID allocationId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getAssignedStudents(teacherId, allocationId, principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping({"/allocations/{allocationId}/students", "/subjects/{allocationId}/students"})
    public ResponseEntity<List<Map<String, Object>>> getApplicableStudentsForAllocation(
            @PathVariable UUID allocationId,
            Principal principal) {
        List<Map<String, Object>> list = teacherService.getAssignedStudents(null, allocationId, principal);
        return ResponseEntity.ok(list);
    }

    // --- ATTENDANCE ---
    @PostMapping({"/attendance", "/attendances", "/attendance/mark", "/attendance/save", "/attendance/record", "/attendance/records"})
    public ResponseEntity<Map<String, Object>> saveAttendance(
            @RequestBody AttendanceMarkRequest request,
            Principal principal) {
        Map<String, Object> response = teacherService.markAttendance(request, principal);
        return ResponseEntity.ok(response);
    }

    @PutMapping({"/attendance", "/attendances", "/attendance/mark", "/attendance/update", "/attendance/{sessionId}"})
    public ResponseEntity<Map<String, Object>> updateAttendance(
            @RequestBody AttendanceMarkRequest request,
            Principal principal) {
        Map<String, Object> response = teacherService.markAttendance(request, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/attendance", "/attendances", "/attendance/history", "/attendance/records"})
    public ResponseEntity<List<Map<String, Object>>> getAttendanceHistory(
            @RequestParam(required = false) String allocationId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String date,
            Principal principal) {
        String targetAllocation = allocationId != null ? allocationId : subjectId;
        List<Map<String, Object>> history = teacherService.getAttendanceHistory(targetAllocation, date, principal);
        return ResponseEntity.ok(history);
    }

    // --- ASSIGNMENT MANAGEMENT ---
    @GetMapping({"/assignments", "/upload-assignment"})
    public ResponseEntity<List<Map<String, Object>>> getTeacherAssignments(Principal principal) {
        List<Map<String, Object>> list = teacherService.getTeacherAssignments(principal);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<Map<String, Object>> getAssignmentById(
            @PathVariable UUID assignmentId,
            Principal principal) {
        Map<String, Object> detail = teacherService.getAssignmentById(assignmentId, principal);
        return ResponseEntity.ok(detail);
    }

    @PostMapping({"/assignments", "/upload-assignment"})
    public ResponseEntity<Map<String, Object>> createAssignment(
            @RequestBody AssignmentDto dto,
            Principal principal) {
        Map<String, Object> result = teacherService.createAssignment(dto, principal);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<Map<String, Object>> updateAssignment(
            @PathVariable UUID assignmentId,
            @RequestBody AssignmentDto dto,
            Principal principal) {
        Map<String, Object> result = teacherService.updateAssignment(assignmentId, dto, principal);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Map<String, Object>> deleteAssignment(
            @PathVariable UUID assignmentId,
            Principal principal) {
        Map<String, Object> result = teacherService.deleteAssignment(assignmentId, principal);
        return ResponseEntity.ok(result);
    }

    // --- SUBMISSIONS & GRADING ---
    @GetMapping({"/assignments/{assignmentId}/submissions", "/submissions"})
    public ResponseEntity<List<Map<String, Object>>> getAssignmentSubmissions(
            @PathVariable(required = false) UUID assignmentId,
            @RequestParam(required = false) UUID asgnId,
            Principal principal) {
        UUID targetId = assignmentId != null ? assignmentId : asgnId;
        if (targetId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Map<String, Object>> submissions = teacherService.getAssignmentSubmissions(targetId, principal);
        return ResponseEntity.ok(submissions);
    }

    @PostMapping({"/submissions/{submissionId}/grade", "/grade-submission"})
    public ResponseEntity<Map<String, Object>> gradeSubmission(
            @PathVariable(required = false) UUID submissionId,
            @RequestBody AssignmentDto dto,
            Principal principal) {
        UUID targetSubId = submissionId != null ? submissionId : (dto.getSubmissionId() != null ? dto.getSubmissionId() : UUID.nameUUIDFromBytes((dto.getSubmission_id() != null ? dto.getSubmission_id() : "").getBytes()));
        Map<String, Object> result = teacherService.gradeSubmission(targetSubId, dto, principal);
        return ResponseEntity.ok(result);
    }

    // --- EXAM MARKS / RESULT ENTRY ---
    @PostMapping({"/exam-marks", "/marks", "/results"})
    public ResponseEntity<Map<String, Object>> saveExamMarks(
            @RequestBody ExamResultDto dto,
            Principal principal) {
        Map<String, Object> result = teacherService.saveExamMarks(dto, principal);
        return ResponseEntity.ok(result);
    }

    @GetMapping({"/exam-marks", "/marks", "/results"})
    public ResponseEntity<List<Map<String, Object>>> getTeacherExamResults(
            @RequestParam(required = false) String allocationId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String examName,
            Principal principal) {
        String targetAllocation = allocationId != null ? allocationId : subjectId;
        List<Map<String, Object>> results = teacherService.getTeacherExamResults(targetAllocation, examName, principal);
        return ResponseEntity.ok(results);
    }

    // --- GRADES ---
    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            @RequestParam(required = false) String teacherId) {
        List<Map<String, Object>> grades = teacherService.getPendingGrades(teacherId);
        return ResponseEntity.ok(grades);
    }
}
