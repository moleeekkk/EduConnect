package com.educonnect.backend.controller;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.entity.Batch;
import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Institute;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.service.AdminService;
import com.educonnect.backend.service.BatchService;
import com.educonnect.backend.service.DepartmentService;
import com.educonnect.backend.service.StudentService;
import com.educonnect.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final DepartmentService departmentService;
    private final BatchService batchService;
    private final TeacherService teacherService;
    private final StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> data = adminService.getAdminDashboard();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto created = adminService.createUser(userDto);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        List<Map<String, Object>> courses = adminService.getCourses();
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@RequestBody Map<String, Object> courseData) {
        Map<String, Object> created = adminService.createCourse(courseData);
        return ResponseEntity.ok(created);
    }

    // --- Department Endpoints ---
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.createDepartment(department));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable UUID id, @RequestBody Department department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Map<String, String>> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
    }

    // --- Institute Endpoints ---
    @GetMapping("/institutes")
    public ResponseEntity<List<Institute>> getInstitutes() {
        return ResponseEntity.ok(departmentService.getAllInstitutes());
    }

    @PostMapping("/institutes")
    public ResponseEntity<Institute> createInstitute(@RequestBody Institute institute) {
        return ResponseEntity.ok(departmentService.createInstitute(institute));
    }

    @PutMapping("/institutes/{id}")
    public ResponseEntity<Institute> updateInstitute(@PathVariable UUID id, @RequestBody Institute institute) {
        return ResponseEntity.ok(departmentService.updateInstitute(id, institute));
    }

    @DeleteMapping("/institutes/{id}")
    public ResponseEntity<Map<String, String>> deleteInstitute(@PathVariable UUID id) {
        departmentService.deleteInstitute(id);
        return ResponseEntity.ok(Map.of("message", "Institute deleted successfully"));
    }

    // --- Semester Endpoints ---
    @GetMapping("/semesters")
    public ResponseEntity<List<Semester>> getSemesters() {
        return ResponseEntity.ok(departmentService.getAllSemesters());
    }

    @PostMapping("/semesters")
    public ResponseEntity<Semester> createSemester(@RequestBody Semester semester) {
        return ResponseEntity.ok(departmentService.createSemester(semester));
    }

    @PutMapping("/semesters/{id}")
    public ResponseEntity<Semester> updateSemester(@PathVariable UUID id, @RequestBody Semester semester) {
        return ResponseEntity.ok(departmentService.updateSemester(id, semester));
    }

    @DeleteMapping("/semesters/{id}")
    public ResponseEntity<Map<String, String>> deleteSemester(@PathVariable UUID id) {
        departmentService.deleteSemester(id);
        return ResponseEntity.ok(Map.of("message", "Semester deleted successfully"));
    }

    // --- Batch Endpoints ---
    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @PostMapping("/batches")
    public ResponseEntity<Batch> createBatch(@RequestBody Batch batch) {
        return ResponseEntity.ok(batchService.createBatch(batch));
    }

    @PutMapping("/batches/{id}")
    public ResponseEntity<Batch> updateBatch(@PathVariable UUID id, @RequestBody Batch batch) {
        return ResponseEntity.ok(batchService.updateBatch(id, batch));
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<Map<String, String>> deleteBatch(@PathVariable UUID id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(Map.of("message", "Batch deleted successfully"));
    }

    @PatchMapping("/batches/{id}/toggle-status")
    public ResponseEntity<Batch> toggleBatchStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(batchService.toggleBatchStatus(id));
    }

    // --- Teacher Endpoints ---
    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/teachers")
    public ResponseEntity<Teacher> createTeacher(@RequestBody Teacher teacher) {
        return ResponseEntity.ok(teacherService.createTeacher(teacher));
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable UUID id, @RequestBody Teacher teacher) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, teacher));
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Map<String, String>> deleteTeacher(@PathVariable UUID id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
    }

    // --- Student Endpoints ---
    @GetMapping("/students")
    public ResponseEntity<List<Student>> getStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.createStudent(student));
        } catch (Exception e) {
            System.err.println("Create student failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable UUID id, @RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.updateStudent(id, student));
        } catch (Exception e) {
            System.err.println("Update student failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // --- Subject Endpoints ---
    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects() {
        return ResponseEntity.ok(departmentService.getAllSubjects());
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        try {
            return ResponseEntity.ok(departmentService.createSubject(subject));
        } catch (Exception e) {
            System.err.println("Create subject failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable UUID id, @RequestBody Subject subject) {
        try {
            return ResponseEntity.ok(departmentService.updateSubject(id, subject));
        } catch (Exception e) {
            System.err.println("Update subject failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Map<String, String>> deleteSubject(@PathVariable UUID id) {
        departmentService.deleteSubject(id);
        return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
    }

    // --- Teacher Subject Allocation Endpoints ---
    @GetMapping("/teacher-subjects")
    public ResponseEntity<List<TeacherSubject>> getTeacherSubjects() {
        return ResponseEntity.ok(teacherService.getAllTeacherSubjects());
    }

    @PostMapping("/teacher-subjects")
    public ResponseEntity<?> assignTeacherSubject(@RequestBody TeacherSubject allocation) {
        try {
            return ResponseEntity.ok(teacherService.assignTeacherSubject(allocation));
        } catch (Exception e) {
            System.err.println("Assign teacher subject error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/teacher-subjects/toggle")
    public ResponseEntity<?> toggleTeacherSubject(@RequestBody Map<String, String> body) {
        try {
            UUID teacherId = UUID.fromString(body.get("teacher_id"));
            UUID subjectId = UUID.fromString(body.get("subject_id"));
            return ResponseEntity.ok(teacherService.toggleTeacherSubject(teacherId, subjectId));
        } catch (Exception e) {
            System.err.println("Toggle teacher subject error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/teacher-subjects/{id}")
    public ResponseEntity<Map<String, String>> deleteTeacherSubject(@PathVariable UUID id) {
        teacherService.deleteTeacherSubject(id);
        return ResponseEntity.ok(Map.of("message", "Teacher subject allocation removed successfully"));
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(adminService.getAdminProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(@RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(adminService.updateAdminProfile(reqData));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changeAdminPassword(@RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(adminService.changeAdminPassword(reqData));
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSystemSettings() {
        return ResponseEntity.ok(adminService.getSystemSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSystemSettings(@RequestBody Map<String, Object> reqData) {
        return ResponseEntity.ok(adminService.updateSystemSettings(reqData));
    }
}
