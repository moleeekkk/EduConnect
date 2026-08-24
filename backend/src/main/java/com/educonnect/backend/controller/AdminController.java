package com.educonnect.backend.controller;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    // --- DASHBOARD & PROFILE ---
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> data = adminService.getAdminDashboard();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile(Principal principal) {
        String identifier = principal != null ? principal.getName() : "admin@educonnect.ac.in";
        Map<String, Object> profile = adminService.getAdminProfile(identifier);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(
            @RequestBody Map<String, Object> updateData,
            Principal principal) {
        String identifier = principal != null ? principal.getName() : "admin@educonnect.ac.in";
        Map<String, Object> result = adminService.updateAdminProfile(updateData, identifier);
        return ResponseEntity.ok(result);
    }

    // --- TEACHER MANAGEMENT CRUD ---
    @GetMapping("/teachers")
    public ResponseEntity<List<Map<String, Object>>> getAllTeachers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String instituteId,
            @RequestParam(required = false) Boolean activeOnly) {
        List<Map<String, Object>> list = adminService.getAllTeachers(search, designation, instituteId, activeOnly);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<Map<String, Object>> getTeacherById(@PathVariable String id) {
        Map<String, Object> teacher = adminService.getTeacherById(id);
        return ResponseEntity.ok(teacher);
    }

    @PostMapping("/teachers")
    public ResponseEntity<Map<String, Object>> createTeacher(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createTeacher(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<Map<String, Object>> updateTeacher(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.updateTeacher(id, body);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/teachers/{id}/status")
    public ResponseEntity<Map<String, Object>> patchTeacherStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.patchTeacherStatus(id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Map<String, Object>> deleteTeacher(@PathVariable String id) {
        adminService.deleteTeacher(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Teacher record deleted successfully"));
    }

    // --- STUDENTS MANAGEMENT CRUD ---
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String instituteId,
            @RequestParam(required = false) String programId,
            @RequestParam(required = false) String semesterId,
            @RequestParam(required = false) Boolean activeOnly) {
        List<Map<String, Object>> list = adminService.getAllStudents(search, instituteId, programId, semesterId, activeOnly);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> getStudentById(@PathVariable String id) {
        Map<String, Object> student = adminService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @PostMapping("/students")
    public ResponseEntity<Map<String, Object>> createStudent(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createStudent(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> updateStudent(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.updateStudent(id, body);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<Map<String, Object>> patchStudentStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.patchStudentStatus(id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> deleteStudent(@PathVariable String id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Student record deleted successfully"));
    }

    // --- INSTITUTES CRUD ---
    @GetMapping("/institutes")
    public ResponseEntity<List<Map<String, Object>>> getAllInstitutes() {
        List<Map<String, Object>> list = adminService.getAllInstitutes();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/institutes")
    public ResponseEntity<Map<String, Object>> createInstitute(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createInstitute(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/institutes/{id}")
    public ResponseEntity<Map<String, Object>> updateInstitute(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.updateInstitute(id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/institutes/{id}")
    public ResponseEntity<Map<String, Object>> deleteInstitute(@PathVariable String id) {
        adminService.deleteInstitute(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Institute deleted successfully"));
    }

    // --- PROGRAMS CRUD ---
    @GetMapping("/programs")
    public ResponseEntity<List<Map<String, Object>>> getAllPrograms() {
        List<Map<String, Object>> list = adminService.getAllPrograms();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/programs")
    public ResponseEntity<Map<String, Object>> createProgram(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createProgram(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<Map<String, Object>> updateProgram(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> updated = adminService.updateProgram(id, body);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Map<String, Object>> deleteProgram(@PathVariable String id) {
        adminService.deleteProgram(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Program deleted successfully"));
    }

    // --- SEMESTERS CRUD ---
    @GetMapping("/semesters")
    public ResponseEntity<List<Map<String, Object>>> getSemesters(@RequestParam String programId) {
        List<Map<String, Object>> list = adminService.getSemestersByProgram(programId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/semesters")
    public ResponseEntity<Map<String, Object>> createSemester(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createSemester(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/semesters/{id}")
    public ResponseEntity<Map<String, Object>> deleteSemester(@PathVariable String id) {
        adminService.deleteSemester(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Semester deleted successfully"));
    }

    // --- COURSES / SUBJECTS CRUD ---
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        List<Map<String, Object>> courses = adminService.getCourses();
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@RequestBody Map<String, Object> courseData) {
        Map<String, Object> created = adminService.createCourse(courseData);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> updateCourse(@PathVariable String id, @RequestBody Map<String, Object> courseData) {
        Map<String, Object> updated = adminService.updateCourse(id, courseData);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourse(@PathVariable String id) {
        adminService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Course deleted successfully"));
    }

    // --- USERS MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto created = adminService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // --- TEACHER SUBJECT ALLOCATIONS / ACADEMIC ASSIGNMENTS ---
    @GetMapping({"/teacher-allocations", "/teacher-assignments", "/assignments", "/teacher-subjects", "/faculty-assignments"})
    public ResponseEntity<List<Map<String, Object>>> getAllTeacherAllocations(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String programId,
            @RequestParam(required = false) String semesterId) {
        List<Map<String, Object>> list = adminService.getAllTeacherAllocations(teacherId, subjectId, programId, semesterId);
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/teacher-allocations", "/teacher-assignments", "/assignments", "/teacher-subjects", "/faculty-assignments"})
    public ResponseEntity<Map<String, Object>> createTeacherAllocation(@RequestBody Map<String, Object> body) {
        Map<String, Object> created = adminService.createTeacherAllocation(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping({"/teacher-allocations/{id}", "/teacher-assignments/{id}", "/assignments/{id}", "/teacher-subjects/{id}", "/faculty-assignments/{id}"})
    public ResponseEntity<Map<String, Object>> deleteTeacherAllocation(@PathVariable String id) {
        adminService.deleteTeacherAllocation(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Teacher allocation deleted successfully"));
    }
}


