package com.educonnect.backend.controller;

import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.service.StudentService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private StudentService studentService;

    @Test
    void testGetStudentDashboard() throws Exception {
        Map<String, Object> mockData = Map.of("enrollmentNo", "2024MCA001", "name", "Alex Johnson");
        when(studentService.getStudentDashboard("2024MCA001")).thenReturn(mockData);

        mockMvc.perform(get("/api/v1/student/dashboard").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrollmentNo").value("2024MCA001"));
    }

    @Test
    void testGetStudentAttendance() throws Exception {
        List<Map<String, Object>> attendanceList = List.of(
                Map.of("subjectName", "Java", "percentage", "85%")
        );
        when(studentService.getStudentAttendance("2024MCA001")).thenReturn(attendanceList);

        mockMvc.perform(get("/api/v1/student/attendance").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subjectName").value("Java"));
    }

    @Test
    void testSubmitAssignment() throws Exception {
        UUID assignmentId = UUID.randomUUID();
        Map<String, Object> reqData = Map.of("feedback", "Done");
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .submissionId(UUID.randomUUID())
                .feedback("Done")
                .submissionStatus("Submitted")
                .build();

        when(studentService.submitAssignment(eq(assignmentId), eq("2024MCA001"), any())).thenReturn(submission);

        mockMvc.perform(post("/api/v1/student/assignments/" + assignmentId + "/submit")
                        .param("enrollmentNo", "2024MCA001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feedback").value("Done"));
    }

    @Test
    void testGetStudentResults() throws Exception {
        Map<String, Object> results = Map.of("gpa", 3.8, "status", "PASSED");
        when(studentService.getStudentResults("2024MCA001")).thenReturn(results);

        mockMvc.perform(get("/api/v1/student/results").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PASSED"));
    }

    @Test
    void testGetStudentProfile() throws Exception {
        Map<String, Object> profile = Map.of("firstName", "Alex", "lastName", "Johnson");
        when(studentService.getStudentProfile("2024MCA001")).thenReturn(profile);

        mockMvc.perform(get("/api/v1/student/profile").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alex"));
    }

    @Test
    void testUpdateStudentProfile() throws Exception {
        Map<String, Object> reqData = Map.of("enrollmentNo", "2024MCA001", "mobile", "+91 9999988888");
        Map<String, Object> updated = Map.of("success", true, "mobile", "+91 9999988888");
        when(studentService.updateStudentProfile(any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/student/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetLeaveRequests() throws Exception {
        when(studentService.getLeaveRequests("2024MCA001")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/student/leave-requests").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetTimetable() throws Exception {
        when(studentService.getTimetable("2024MCA001")).thenReturn(List.of(Map.of("day", "Monday", "subject", "Java")));

        mockMvc.perform(get("/api/v1/student/timetable").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].day").value("Monday"));
    }

    @Test
    void testGetDigitalID() throws Exception {
        when(studentService.getDigitalID("2024MCA001")).thenReturn(Map.of("name", "Alex Johnson", "enrollment_no", "2024MCA001"));

        mockMvc.perform(get("/api/v1/student/digital-id").param("enrollmentNo", "2024MCA001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alex Johnson"));
    }
}
