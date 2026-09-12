package com.educonnect.backend.controller;

import com.educonnect.backend.service.AssignmentFileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AssignmentFileController.class)
@AutoConfigureMockMvc(addFilters = false)
class AssignmentFileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AssignmentFileService fileService;

    @Test
    void testViewAssignmentFile() throws Exception {
        UUID assignmentId = UUID.randomUUID();
        Resource resource = new ByteArrayResource("test file content".getBytes());
        ResponseEntity<Resource> response = ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"assignment.pdf\"")
                .body(resource);

        when(fileService.getAssignmentFileResource(assignmentId, false)).thenReturn(response);

        mockMvc.perform(get("/api/v1/assignments/" + assignmentId + "/file"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"assignment.pdf\""));
    }

    @Test
    void testDownloadAssignmentFile() throws Exception {
        UUID assignmentId = UUID.randomUUID();
        Resource resource = new ByteArrayResource("test file content".getBytes());
        ResponseEntity<Resource> response = ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignment.pdf\"")
                .body(resource);

        when(fileService.getAssignmentFileResource(assignmentId, true)).thenReturn(response);

        mockMvc.perform(get("/api/v1/assignments/" + assignmentId + "/file/download"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignment.pdf\""));
    }
}
