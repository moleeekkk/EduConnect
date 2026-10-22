package com.educonnect.backend.service;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Admin demoAdmin;
    private Teacher demoTeacher;
    private Student demoStudent;

    @BeforeEach
    void setUp() {
        demoAdmin = Admin.builder()
                .adminId(UUID.randomUUID())
                .firstName("Super")
                .lastName("Admin")
                .email("admin@educonnect.ac.in")
                .password("$2a$10$hashedAdminPassword")
                .isActive(true)
                .build();

        demoTeacher = Teacher.builder()
                .teacherId(UUID.randomUUID())
                .firstName("Sarah")
                .lastName("Jenkins")
                .email("teacher@educonnect.ac.in")
                .password("$2a$10$hashedTeacherPassword")
                .isActive(true)
                .build();

        demoStudent = Student.builder()
                .studentId(UUID.randomUUID())
                .enrollmentNo("2024MCA001")
                .firstName("Alex")
                .lastName("Johnson")
                .email("alex.johnson@educonnect.ac.in")
                .mobile("+91 9876543212")
                .isActive(true)
                .build();
    }

    // --- Admin Login Tests ---
    @Test
    void testAdminLogin_Success() {
        LoginRequest request = new LoginRequest("admin@educonnect.ac.in", "admin123");
        when(adminRepository.findByEmail("admin@educonnect.ac.in")).thenReturn(Optional.of(demoAdmin));
        when(passwordEncoder.matches("admin123", "$2a$10$hashedAdminPassword")).thenReturn(true);

        AuthResponse response = authService.adminLogin(request);

        assertTrue(response.isSuccess());
        assertEquals("Admin", response.getRole());
        assertEquals("Super Admin", response.getName());
    }

    @Test
    void testAdminLogin_InvalidPassword() {
        LoginRequest request = new LoginRequest("admin@educonnect.ac.in", "wrongpass");
        when(adminRepository.findByEmail("admin@educonnect.ac.in")).thenReturn(Optional.of(demoAdmin));
        when(passwordEncoder.matches("wrongpass", "$2a$10$hashedAdminPassword")).thenReturn(false);

        AuthResponse response = authService.adminLogin(request);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Invalid email address or password"));
    }

    @Test
    void testAdminLogin_NotFoundInDatabase_Fails() {
        LoginRequest request = new LoginRequest("admin@educonnect.ac.in", "admin123");
        when(adminRepository.findByEmail("admin@educonnect.ac.in")).thenReturn(Optional.empty());

        AuthResponse response = authService.adminLogin(request);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Invalid email address or password"));
    }

    // --- Teacher Login Tests ---
    @Test
    void testTeacherLogin_Success() {
        LoginRequest request = new LoginRequest("teacher@educonnect.ac.in", "teacher123");
        when(teacherRepository.findByEmail("teacher@educonnect.ac.in")).thenReturn(Optional.of(demoTeacher));
        when(passwordEncoder.matches("teacher123", "$2a$10$hashedTeacherPassword")).thenReturn(true);

        AuthResponse response = authService.teacherLogin(request);

        assertTrue(response.isSuccess());
        assertEquals("Teacher", response.getRole());
        assertEquals("Sarah Jenkins", response.getName());
    }

    @Test
    void testTeacherLogin_InvalidCredentials() {
        LoginRequest request = new LoginRequest("teacher@educonnect.ac.in", "wrongpass");
        when(teacherRepository.findByEmail("teacher@educonnect.ac.in")).thenReturn(Optional.of(demoTeacher));
        when(passwordEncoder.matches("wrongpass", "$2a$10$hashedTeacherPassword")).thenReturn(false);

        AuthResponse response = authService.teacherLogin(request);

        assertFalse(response.isSuccess());
    }

    // --- Student OTP Tests ---
    @Test
    void testStudentOtp_SendAndVerify() {
        StudentOtpRequest request = new StudentOtpRequest("2024MCA001");
        when(studentRepository.findByEnrollmentNo("2024MCA001")).thenReturn(Optional.of(demoStudent));

        AuthResponse sendResponse = authService.sendStudentOtp(request);

        assertTrue(sendResponse.isSuccess());
        assertEquals("2024MCA001", sendResponse.getIdentifier());
        verify(emailService, times(1)).sendOtpEmail(eq("alex.johnson@educonnect.ac.in"), eq("Alex Johnson"), anyString());

        // Verify invalid OTP failure first
        StudentOtpVerifyRequest invalidVerifyReq = new StudentOtpVerifyRequest("2024MCA001", "000000");
        AuthResponse invalidVerifyRes = authService.verifyStudentOtp(invalidVerifyReq);
        assertFalse(invalidVerifyRes.isSuccess());
    }

    @Test
    void testStudentOtp_NullRequest() {
        AuthResponse response = authService.sendStudentOtp(null);
        assertFalse(response.isSuccess());
        assertEquals("Enrollment Number is required.", response.getMessage());
    }

    // --- Password Reset Tests ---
    @Test
    void testSendPasswordResetCode_Success() {
        when(teacherRepository.findByEmail("teacher@educonnect.ac.in")).thenReturn(Optional.of(demoTeacher));

        AuthResponse response = authService.sendPasswordResetCode("teacher@educonnect.ac.in", "Teacher");

        assertTrue(response.isSuccess());
        verify(emailService, times(1)).sendResetEmail(eq("teacher@educonnect.ac.in"), eq("Sarah Jenkins"), anyString());
    }

    @Test
    void testSendPasswordResetCode_NotFound() {
        when(teacherRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        when(adminRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        when(studentRepository.findAll()).thenReturn(Collections.emptyList());

        AuthResponse response = authService.sendPasswordResetCode("unknown@test.com", "Teacher");

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("No account found"));
    }
}
