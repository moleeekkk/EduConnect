package com.educonnect.backend.controller;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.service.DepartmentService;
import com.educonnect.backend.service.TeacherService;
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

@WebMvcTest(TeacherController.class)
@AutoConfigureMockMvc(addFilters = false)
class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TeacherService teacherService;

    @MockitoBean
    private DepartmentService departmentService;

    @Test
    void testGetTeacherDashboard() throws Exception {
        Map<String, Object> mockData = Map.of("totalClasses", 5, "totalStudents", 120);
        when(teacherService.getTeacherDashboard("teach-demo-id")).thenReturn(mockData);

        mockMvc.perform(get("/api/v1/teacher/dashboard").param("teacherId", "teach-demo-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClasses").value(5));
    }

    @Test
    void testGetAssignments() throws Exception {
        Map<String, Object> assignment = Map.of("title", "Java Assignment 1", "subject", "Java Programming");
        when(teacherService.getAllAssignmentsForTeacher("teacher@educonnect.ac.in")).thenReturn(List.of(assignment));

        mockMvc.perform(get("/api/v1/teacher/assignments").param("email", "teacher@educonnect.ac.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Assignment 1"));
    }

    @Test
    void testCreateAssignment() throws Exception {
        Map<String, Object> request = Map.of("title", "Spring Boot Project", "totalMarks", 100);
        Assignment assignment = Assignment.builder()
                .assignmentId(UUID.randomUUID())
                .title("Spring Boot Project")
                .totalMarks(100)
                .build();
        when(teacherService.createAssignment(any())).thenReturn(assignment);

        mockMvc.perform(post("/api/v1/teacher/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Boot Project"));
    }

    @Test
    void testMarkAttendance() throws Exception {
        AttendanceMarkRequest req = AttendanceMarkRequest.builder()
                .teacherSubjectId(UUID.randomUUID())
                .sessionDate("2026-09-11")
                .lectureNo(1)
                .topic("Spring Boot Testing")
                .build();
        Map<String, Object> res = Map.of("success", true, "message", "Attendance saved");
        when(teacherService.markAttendance(any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/teacher/attendance/mark")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetWeeklyTests() throws Exception {
        Map<String, Object> testMap = Map.of("testTitle", "Weekly Test 1", "maxMarks", 25);
        when(teacherService.getAllWeeklyTests()).thenReturn(List.of(testMap));

        mockMvc.perform(get("/api/v1/teacher/weekly-tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].testTitle").value("Weekly Test 1"));
    }

    @Test
    void testChangePassword() throws Exception {
        Map<String, String> body = Map.of(
                "email", "teacher@educonnect.ac.in",
                "current_password", "teacher123",
                "new_password", "newteacher123"
        );
        when(teacherService.changeTeacherPassword("teacher@educonnect.ac.in", "teacher123", "newteacher123"))
                .thenReturn(Map.of("success", true, "message", "Password changed successfully"));

        mockMvc.perform(post("/api/v1/teacher/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
