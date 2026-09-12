package com.educonnect.backend.controller;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private DepartmentService departmentService;

    @MockitoBean
    private BatchService batchService;

    @MockitoBean
    private TeacherService teacherService;

    @MockitoBean
    private StudentService studentService;

    @Test
    void testGetAdminDashboard() throws Exception {
        Map<String, Object> mockData = Map.of("totalStudents", 100, "totalTeachers", 20);
        when(adminService.getAdminDashboard()).thenReturn(mockData);

        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents").value(100));
    }

    @Test
    void testGetDepartments() throws Exception {
        Department dept = Department.builder()
                .departmentId(UUID.randomUUID())
                .departmentName("Computer Science")
                .departmentCode("CS")
                .build();
        when(departmentService.getAllDepartments()).thenReturn(List.of(dept));

        mockMvc.perform(get("/api/v1/admin/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].department_name").value("Computer Science"));
    }

    @Test
    void testCreateDepartment() throws Exception {
        Department dept = Department.builder()
                .departmentName("Information Technology")
                .departmentCode("IT")
                .build();
        when(departmentService.createDepartment(any(Department.class))).thenReturn(dept);

        mockMvc.perform(post("/api/v1/admin/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dept)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.department_code").value("IT"));
    }

    @Test
    void testGetBatches() throws Exception {
        Batch batch = Batch.builder()
                .batchId(UUID.randomUUID())
                .batchName("MCA 2024-2026")
                .isActive(true)
                .build();
        when(batchService.getAllBatches()).thenReturn(List.of(batch));

        mockMvc.perform(get("/api/v1/admin/batches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].batch_name").value("MCA 2024-2026"));
    }

    @Test
    void testGetTeachers() throws Exception {
        Teacher teacher = Teacher.builder()
                .teacherId(UUID.randomUUID())
                .firstName("Sarah")
                .email("teacher@educonnect.ac.in")
                .build();
        when(teacherService.getAllTeachers()).thenReturn(List.of(teacher));

        mockMvc.perform(get("/api/v1/admin/teachers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].first_name").value("Sarah"));
    }

    @Test
    void testGetStudents() throws Exception {
        Student student = Student.builder()
                .studentId(UUID.randomUUID())
                .enrollmentNo("2024MCA001")
                .firstName("Alex")
                .build();
        when(studentService.getAllStudents()).thenReturn(List.of(student));

        mockMvc.perform(get("/api/v1/admin/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enrollment_no").value("2024MCA001"));
    }

    @Test
    void testCreateStudent() throws Exception {
        Student student = Student.builder()
                .enrollmentNo("2024MCA002")
                .firstName("John")
                .build();
        when(studentService.createStudent(any(Student.class))).thenReturn(student);

        mockMvc.perform(post("/api/v1/admin/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrollment_no").value("2024MCA002"));
    }

    @Test
    void testDeleteDepartment() throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(delete("/api/v1/admin/departments/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Department deleted successfully"));
    }
}
