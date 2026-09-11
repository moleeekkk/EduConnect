package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.Batch;
import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.service.DepartmentService;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final DepartmentService departmentService;

    private String getAuthenticatedIdentifier(Authentication authentication, String paramId, String paramEmail) {
        if (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty()) {
            return authentication.getName();
        }
        return paramEmail != null && !paramEmail.trim().isEmpty() ? paramEmail : paramId;
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        return ResponseEntity.ok(teacherService.getAllAssignmentsForTeacher(identifier));
    }

    @PostMapping("/assignments")
    public ResponseEntity<Assignment> createAssignment(
            Authentication authentication,
            @RequestBody Map<String, Object> data) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.createAssignment(data, identifier));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<Assignment> updateAssignment(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> data) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.updateAssignment(id, data, identifier));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<?> deleteAssignment(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        try {
            teacherService.deleteAssignment(id, identifier);
            return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully from database"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/assigned-subjects")
    public ResponseEntity<List<Subject>> getAssignedSubjects(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        List<Subject> subjects = teacherService.getAssignedSubjectsForTeacher(identifier);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        List<Subject> subjects = teacherService.getAssignedSubjectsForTeacher(identifier);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        return ResponseEntity.ok(teacherService.getStudentsForTeacher(identifier));
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getBatches(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        return ResponseEntity.ok(teacherService.getAssignedBatchesForTeacher(identifier));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/semesters")
    public ResponseEntity<List<Semester>> getSemesters() {
        return ResponseEntity.ok(departmentService.getAllSemesters());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(
            Authentication authentication,
            @RequestParam(required = false) String teacherId) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, null);
        Map<String, Object> data = teacherService.getTeacherDashboard(identifier);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/attendance")
    public ResponseEntity<Map<String, Object>> postAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance/sessions")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceSessions(
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String date) {
        List<Map<String, Object>> sessions = teacherService.getTeacherAttendanceSessions(subjectId, date);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/attendance/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getAttendanceSessionDetail(@PathVariable UUID sessionId) {
        Map<String, Object> detail = teacherService.getAttendanceSessionDetail(sessionId);
        return ResponseEntity.ok(detail);
    }

    @PutMapping("/attendance/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> updateAttendanceSession(
            @PathVariable UUID sessionId,
            @RequestBody AttendanceMarkRequest request) {
        if (request.getTeacherSubjectId() == null) {
            // Ensure session detail's teacherSubjectId is populated
            Map<String, Object> detail = teacherService.getAttendanceSessionDetail(sessionId);
            if (detail.get("teacher_subject_id") != null) {
                request.setTeacherSubjectId(UUID.fromString((String) detail.get("teacher_subject_id")));
            }
        }
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            Authentication authentication,
            @RequestParam(required = false) String teacherId) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, null);
        List<Map<String, Object>> grades = teacherService.getPendingGrades(identifier);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        Map<String, Object> profile = teacherService.getTeacherProfile(identifier);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<Map<String, Object>>> getAssignmentSubmissions(
            Authentication authentication,
            @PathVariable UUID assignmentId) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.getAssignmentSubmissions(assignmentId, identifier));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<com.educonnect.backend.entity.AssignmentSubmission> gradeSubmission(
            Authentication authentication,
            @PathVariable UUID submissionId,
            @RequestBody Map<String, Object> reqData) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.gradeSubmission(submissionId, reqData, identifier));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        String bodyEmail = body.get("email") != null ? String.valueOf(body.get("email")).trim() : null;
        if (bodyEmail != null && !bodyEmail.equalsIgnoreCase("null") && !bodyEmail.isEmpty()) {
            if (identifier != null && !identifier.equalsIgnoreCase(bodyEmail)) {
                throw new IllegalArgumentException("Updating profile for another teacher identity is forbidden.");
            }
        }
        if (identifier != null && !body.containsKey("email")) {
            body.put("email", identifier);
        }
        Map<String, Object> result = teacherService.updateTeacherProfile(body);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.changeTeacherPassword(reqData));
    }

    @GetMapping("/weekly-tests")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTests(
            Authentication authentication,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = getAuthenticatedIdentifier(authentication, teacherId, email);
        return ResponseEntity.ok(teacherService.getAllWeeklyTests(identifier));
    }

    @PostMapping("/weekly-tests")
    public ResponseEntity<com.educonnect.backend.entity.WeeklyTest> createWeeklyTest(
            Authentication authentication,
            @RequestBody Map<String, Object> data) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.createWeeklyTest(data, identifier));
    }

    @PutMapping("/weekly-tests/{id}")
    public ResponseEntity<com.educonnect.backend.entity.WeeklyTest> updateWeeklyTest(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> data) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.updateWeeklyTest(id, data, identifier));
    }

    @DeleteMapping("/weekly-tests/{id}")
    public ResponseEntity<Map<String, String>> deleteWeeklyTest(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        teacherService.deleteWeeklyTest(id, identifier);
        return ResponseEntity.ok(Map.of("message", "Weekly test deleted successfully from database"));
    }

    @PostMapping("/weekly-tests/{id}/publish")
    public ResponseEntity<com.educonnect.backend.entity.WeeklyTest> publishWeeklyTest(
            Authentication authentication,
            @PathVariable UUID id) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.publishWeeklyTest(id, identifier));
    }

    @GetMapping("/weekly-tests/{testId}/results")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTestResults(
            Authentication authentication,
            @PathVariable UUID testId) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.getWeeklyTestResults(testId, identifier));
    }

    @PostMapping("/weekly-tests/{testId}/results")
    public ResponseEntity<List<com.educonnect.backend.entity.WeeklyTestResult>> saveWeeklyTestResults(
            Authentication authentication,
            @PathVariable UUID testId,
            @RequestBody List<Map<String, Object>> resultsList) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        return ResponseEntity.ok(teacherService.saveWeeklyTestResults(testId, resultsList, identifier));
    }
}
