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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;
    private final DepartmentService departmentService;

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = email != null && !email.trim().isEmpty() ? email : teacherId;
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
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = email != null && !email.trim().isEmpty() ? email : teacherId;
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
            @RequestParam(required = false, defaultValue = "teach-demo-id") String teacherId) {
        Map<String, Object> data = teacherService.getTeacherDashboard(teacherId);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody AttendanceMarkRequest request) {
        Map<String, Object> response = teacherService.markAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance/sessions")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceSessions(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = email != null && !email.trim().isEmpty() ? email : teacherId;
        return ResponseEntity.ok(teacherService.getTeacherAttendanceSessions(identifier));
    }

    @GetMapping("/attendance/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getAttendanceSessionDetails(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(teacherService.getAttendanceSessionDetails(sessionId));
    }

    @GetMapping("/grades")
    public ResponseEntity<List<Map<String, Object>>> getPendingGrades(
            @RequestParam(required = false, defaultValue = "teach-demo-id") String teacherId) {
        List<Map<String, Object>> grades = teacherService.getPendingGrades(teacherId);
        return ResponseEntity.ok(grades);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> body) {
        String emailOrId = body.get("email") != null ? body.get("email") : body.get("teacher_id");
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
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String email) {
        String identifier = email != null && !email.trim().isEmpty() ? email : teacherId;
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
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
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

    @GetMapping("/leave-requests")
    public ResponseEntity<List<com.educonnect.backend.entity.LeaveRequest>> getLeaveRequests() {
        return ResponseEntity.ok(teacherService.getLeaveRequests());
    }

    @PutMapping("/leave-requests/{id}")
    public ResponseEntity<com.educonnect.backend.entity.LeaveRequest> updateLeaveStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.updateLeaveStatus(id, reqData));
    }

    @GetMapping("/doubts")
    public ResponseEntity<List<com.educonnect.backend.entity.StudentDoubt>> getDoubts() {
        return ResponseEntity.ok(teacherService.getDoubts());
    }

    @PostMapping("/doubts/{id}/reply")
    public ResponseEntity<com.educonnect.backend.entity.StudentDoubt> replyDoubt(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.replyDoubt(id, reqData));
    }

    @GetMapping("/study-materials")
    public ResponseEntity<List<Map<String, Object>>> getStudyMaterials() {
        return ResponseEntity.ok(teacherService.getStudyMaterials());
    }

    @PostMapping("/study-materials")
    public ResponseEntity<com.educonnect.backend.entity.StudyMaterial> uploadStudyMaterial(
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.uploadStudyMaterial(reqData));
    }

    @PutMapping("/study-materials/{id}")
    public ResponseEntity<com.educonnect.backend.entity.StudyMaterial> updateStudyMaterial(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.updateStudyMaterial(id, reqData));
    }

    @DeleteMapping("/study-materials/{id}")
    public ResponseEntity<Map<String, String>> deleteStudyMaterial(@PathVariable UUID id) {
        teacherService.deleteStudyMaterial(id);
        return ResponseEntity.ok(Map.of("message", "Study material deleted successfully"));
    }

    @GetMapping("/quizzes")
    public ResponseEntity<List<Map<String, Object>>> getQuizzes() {
        return ResponseEntity.ok(teacherService.getQuizzes());
    }

    @PostMapping("/quizzes")
    public ResponseEntity<Map<String, Object>> createQuiz(
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.createQuiz(reqData));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<Map<String, Object>> updateQuiz(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.updateQuiz(id, reqData));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Map<String, String>> deleteQuiz(@PathVariable UUID id) {
        teacherService.deleteQuiz(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
    }

    @GetMapping("/quizzes/{id}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuizQuestions(@PathVariable UUID id) {
        return ResponseEntity.ok(teacherService.getQuizQuestions(id));
    }

    @PostMapping("/quizzes/{id}/questions")
    public ResponseEntity<Map<String, Object>> addQuizQuestion(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.addQuizQuestion(id, reqData));
    }

    @DeleteMapping("/quizzes/{id}/questions/{mcqId}")
    public ResponseEntity<List<Map<String, Object>>> deleteQuizQuestion(
            @PathVariable UUID id,
            @PathVariable String mcqId) {
        return ResponseEntity.ok(teacherService.deleteQuizQuestion(id, mcqId));
    }

    @PostMapping("/parent-email")
    public ResponseEntity<Map<String, Object>> sendParentEmail(@RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.sendParentEmail(reqData));
    }

    @PostMapping("/grades")
    public ResponseEntity<Map<String, Object>> submitGrades(@RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(teacherService.submitGrades(reqData));
    }
}
