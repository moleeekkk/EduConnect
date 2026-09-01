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

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        Map<String, Object> result = teacherService.updateTeacherProfile(body);
        return ResponseEntity.ok(result);
    }
}
