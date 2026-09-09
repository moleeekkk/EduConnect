package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Student;
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
    public ResponseEntity<Assignment> createAssignment(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(teacherService.createAssignment(data));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(teacherService.updateAssignment(id, data));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Map<String, String>> deleteAssignment(@PathVariable UUID id) {
        teacherService.deleteAssignment(id);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully from database"));
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

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getStudents() {
        return ResponseEntity.ok(teacherService.getAllStudents());
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

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
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

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        String emailOrId = getAuthenticatedIdentifier(authentication, body.get("teacher_id"), body.get("email"));
        String currentPassword = body.get("current_password");
        String newPassword = body.get("new_password");
        Map<String, Object> result = teacherService.changeTeacherPassword(emailOrId, currentPassword, newPassword);
        if (Boolean.FALSE.equals(result.get("success"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
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
    public ResponseEntity<List<Map<String, Object>>> getAssignmentSubmissions(@PathVariable UUID assignmentId) {
        return ResponseEntity.ok(teacherService.getAssignmentSubmissions(assignmentId));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<com.educonnect.backend.entity.AssignmentSubmission> gradeSubmission(
            @PathVariable UUID submissionId,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.gradeSubmission(submissionId, reqData));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        String identifier = getAuthenticatedIdentifier(authentication, null, null);
        if (identifier != null && !body.containsKey("email")) {
            body.put("email", identifier);
        }
        Map<String, Object> result = teacherService.updateTeacherProfile(body);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/weekly-tests")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTests() {
        return ResponseEntity.ok(teacherService.getAllWeeklyTests());
    }

    @PostMapping("/weekly-tests")
    public ResponseEntity<com.educonnect.backend.entity.WeeklyTest> createWeeklyTest(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(teacherService.createWeeklyTest(data));
    }

    @PutMapping("/weekly-tests/{id}")
    public ResponseEntity<com.educonnect.backend.entity.WeeklyTest> updateWeeklyTest(@PathVariable UUID id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(teacherService.updateWeeklyTest(id, data));
    }

    @DeleteMapping("/weekly-tests/{id}")
    public ResponseEntity<Map<String, String>> deleteWeeklyTest(@PathVariable UUID id) {
        teacherService.deleteWeeklyTest(id);
        return ResponseEntity.ok(Map.of("message", "Weekly test deleted successfully from database"));
    }

    @GetMapping("/weekly-tests/{testId}/results")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTestResults(@PathVariable UUID testId) {
        return ResponseEntity.ok(teacherService.getWeeklyTestResults(testId));
    }

    @PostMapping("/weekly-tests/{testId}/results")
    public ResponseEntity<List<com.educonnect.backend.entity.WeeklyTestResult>> saveWeeklyTestResults(
            @PathVariable UUID testId,
            @RequestBody List<Map<String, Object>> resultsList) {
        return ResponseEntity.ok(teacherService.saveWeeklyTestResults(testId, resultsList));
    }
}
