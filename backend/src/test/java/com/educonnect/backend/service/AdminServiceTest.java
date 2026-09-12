package com.educonnect.backend.service;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.SubjectRepository;
import com.educonnect.backend.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @Test
    void testGetAdminDashboard() {
        when(studentRepository.count()).thenReturn(150L);
        when(teacherRepository.count()).thenReturn(25L);
        when(subjectRepository.count()).thenReturn(10L);

        Map<String, Object> stats = adminService.getAdminDashboard();

        assertEquals(150L, stats.get("totalStudents"));
        assertEquals(25L, stats.get("totalFaculty"));
        assertEquals(10L, stats.get("activeCourses"));
        assertEquals("99.98%", stats.get("systemUptime"));
    }

    @Test
    void testGetAllUsers() {
        Student s = Student.builder()
                .enrollmentNo("2024MCA001")
                .firstName("Alex")
                .lastName("Johnson")
                .email("alex@educonnect.ac.in")
                .isActive(true)
                .build();

        Teacher t = Teacher.builder()
                .teacherId(UUID.randomUUID())
                .firstName("Sarah")
                .lastName("Jenkins")
                .email("sarah@educonnect.ac.in")
                .designation("Professor")
                .isActive(true)
                .build();

        when(studentRepository.findAll()).thenReturn(List.of(s));
        when(teacherRepository.findAll()).thenReturn(List.of(t));

        List<UserDto> users = adminService.getAllUsers();

        assertEquals(2, users.size());
        assertEquals("Student", users.get(0).getRole());
        assertEquals("Teacher", users.get(1).getRole());
    }

    @Test
    void testCreateUser_Student() {
        UserDto dto = UserDto.builder()
                .name("Jane Student")
                .email("jane@educonnect.ac.in")
                .role("Student")
                .identifier("2024MCA002")
                .build();

        UserDto created = adminService.createUser(dto);

        assertNotNull(created);
        assertEquals("2024MCA002", created.getId());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void testCreateUser_Teacher() {
        UserDto dto = UserDto.builder()
                .name("Robert Professor")
                .email("robert@educonnect.ac.in")
                .role("Teacher")
                .build();

        Teacher saved = Teacher.builder()
                .teacherId(UUID.randomUUID())
                .firstName("Robert")
                .lastName("Professor")
                .email("robert@educonnect.ac.in")
                .build();

        when(passwordEncoder.encode(any())).thenReturn("hashedPass");
        when(teacherRepository.save(any(Teacher.class))).thenReturn(saved);

        UserDto created = adminService.createUser(dto);

        assertNotNull(created);
        assertEquals(saved.getTeacherId().toString(), created.getId());
    }

    @Test
    void testGetCourses() {
        Subject sub = Subject.builder()
                .subjectCode("MCA301")
                .subjectName("Advanced Web Technologies")
                .credits(4)
                .subjectType("Theory")
                .build();

        when(subjectRepository.findAll()).thenReturn(List.of(sub));

        List<Map<String, Object>> courses = adminService.getCourses();

        assertEquals(1, courses.size());
        assertEquals("MCA301", courses.get(0).get("code"));
        assertEquals("Advanced Web Technologies", courses.get(0).get("name"));
    }

    @Test
    void testCreateCourse() {
        Map<String, Object> req = Map.of("code", "MCA302", "name", "Cloud Computing");

        Map<String, Object> res = adminService.createCourse(req);

        assertTrue((Boolean) res.get("success"));
        assertEquals("MCA302", res.get("code"));
        verify(subjectRepository, times(1)).save(any(Subject.class));
    }
}
