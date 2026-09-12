package com.educonnect.backend.service;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // In-memory OTP storage: enrollmentNo -> OTP
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public AuthResponse sendStudentOtp(StudentOtpRequest request) {
        if (request == null || request.getEnrollmentNo() == null || request.getEnrollmentNo().trim().isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Enrollment Number is required.")
                    .build();
        }

        String enrollmentNo = request.getEnrollmentNo().trim().toUpperCase();

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo);
        if (!studentOpt.isPresent()) {
            studentOpt = studentRepository.findAll().stream()
                    .filter(s -> s.getEnrollmentNo() != null && s.getEnrollmentNo().equalsIgnoreCase(enrollmentNo))
                    .findFirst();
        }

        String email = studentOpt.map(Student::getEmail).filter(e -> e != null && !e.trim().isEmpty()).orElse(enrollmentNo.toLowerCase() + "@educonnect.ac.in");
        String mobile = studentOpt.map(Student::getMobile).filter(m -> m != null && !m.trim().isEmpty()).orElse("+91 9876543210");
        String maskedPhone = maskPhoneNumber(mobile);
        String maskedEmail = maskEmail(email);
        String name = studentOpt.map(s -> {
            String f = s.getFirstName() != null ? s.getFirstName().trim() : "";
            String l = s.getLastName() != null ? s.getLastName().trim() : "";
            String full = (f + " " + l).trim();
            return full.isEmpty() ? "Student" : full;
        }).orElse("Student");

        // Generate random 6-digit OTP
        String generatedOtp = String.format("%06d", random.nextInt(1000000));
        otpStore.put(enrollmentNo, generatedOtp);

        log.info("Student OTP generated for enrollmentNo {}: {}", enrollmentNo, generatedOtp);

        // Send email with OTP code
        emailService.sendOtpEmail(email, name, generatedOtp);

        return AuthResponse.builder()
                .success(true)
                .message("OTP sent successfully to " + maskedPhone + " and " + maskedEmail)
                .identifier(enrollmentNo)
                .name(name)
                .role("Student")
                .maskedPhone(maskedPhone)
                .maskedEmail(maskedEmail)
                .build();
    }

    public AuthResponse verifyStudentOtp(StudentOtpVerifyRequest request) {
        if (request == null || request.getEnrollmentNo() == null || request.getOtp() == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Enrollment Number and OTP code are required.")
                    .build();
        }

        String enrollmentNo = request.getEnrollmentNo().trim().toUpperCase();
        String inputOtp = request.getOtp().trim();

        String cachedOtp = otpStore.get(enrollmentNo);

        // Verify real generated OTP stored in memory
        boolean isValid = cachedOtp != null && cachedOtp.equals(inputOtp);

        if (!isValid) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP code entered. Please check your email/mobile and try again.")
                    .build();
        }

        // Clean up OTP after successful verification
        otpStore.remove(enrollmentNo);

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo);
        String studentId = studentOpt.map(s -> s.getStudentId() != null ? s.getStudentId().toString() : "stu-demo-id").orElse("stu-demo-id");
        String studentName = studentOpt.map(s -> {
            String f = s.getFirstName() != null ? s.getFirstName().trim() : "";
            String l = s.getLastName() != null ? s.getLastName().trim() : "";
            String full = (f + " " + l).trim();
            return full.isEmpty() ? "Student" : full;
        }).orElse("Alex Johnson");

        return AuthResponse.builder()
                .success(true)
                .message("Student authentication successful")
                .token("jwt-student-token-" + System.currentTimeMillis())
                .role("Student")
                .userId(studentId)
                .name(studentName)
                .identifier(enrollmentNo)
                .build();
    }

    public AuthResponse teacherLogin(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please enter email and password.")
                    .build();
        }

        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            String storedHash = teacher.getPassword();

            boolean matches = isPasswordMatching(rawPassword, storedHash, "teacher123", () -> {
                // Auto-upgrade legacy plain text password to BCrypt hash
                teacher.setPassword(passwordEncoder.encode(rawPassword));
                teacherRepository.save(teacher);
            });

            if (matches) {
                return AuthResponse.builder()
                        .success(true)
                        .message("Teacher login successful")
                        .token("jwt-teacher-token-" + System.currentTimeMillis())
                        .role("Teacher")
                        .userId(teacher.getTeacherId().toString())
                        .name(((teacher.getFirstName() != null ? teacher.getFirstName() : "") + " " + (teacher.getLastName() != null ? teacher.getLastName() : "")).trim())
                        .identifier(teacher.getEmail())
                        .build();
            } else {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid email address or password. Please enter correct credentials.")
                        .build();
            }
        }

        // Demo Fallback
        if ("teacher@educonnect.ac.in".equalsIgnoreCase(email) && "teacher123".equals(rawPassword)) {
            return AuthResponse.builder()
                    .success(true)
                    .message("Teacher login successful")
                    .token("jwt-teacher-token-" + System.currentTimeMillis())
                    .role("Teacher")
                    .userId("teach-demo-id")
                    .name("Dr. Sarah Jenkins")
                    .identifier(email)
                    .build();
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email address or password. Please try again.")
                .build();
    }

    public AuthResponse adminLogin(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please enter email and password.")
                    .build();
        }

        String email = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            String storedHash = admin.getPassword();

            boolean matches = isPasswordMatching(rawPassword, storedHash, "admin123", () -> {
                // Auto-upgrade legacy plain text password to BCrypt hash
                admin.setPassword(passwordEncoder.encode(rawPassword));
                adminRepository.save(admin);
            });

            if (matches) {
                return AuthResponse.builder()
                        .success(true)
                        .message("Admin login successful")
                        .token("jwt-admin-token-" + System.currentTimeMillis())
                        .role("Admin")
                        .userId(admin.getAdminId().toString())
                        .name(((admin.getFirstName() != null ? admin.getFirstName() : "") + " " + (admin.getLastName() != null ? admin.getLastName() : "")).trim())
                        .identifier(admin.getEmail())
                        .build();
            } else {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid email address or password. Please enter correct credentials.")
                        .build();
            }
        }

        // Demo Fallback
        if ("admin@educonnect.ac.in".equalsIgnoreCase(email) && "admin123".equals(rawPassword)) {
            return AuthResponse.builder()
                    .success(true)
                    .message("Admin login successful")
                    .token("jwt-admin-token-" + System.currentTimeMillis())
                    .role("Admin")
                    .userId("admin-demo-id")
                    .name("System Administrator")
                    .identifier(email)
                    .build();
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid administrator credentials. Please try again.")
                .build();
    }

    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 10) return "+91 98*** **421";
        return phone.substring(0, 5) + "*** **" + phone.substring(phone.length() - 3);
    }

    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "std***@educonnect.ac.in";
        }
        int atIndex = email.indexOf("@");
        String namePart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);

        if (namePart.length() <= 2) {
            return namePart.substring(0, 1) + "***" + domainPart;
        } else if (namePart.length() <= 4) {
            return namePart.substring(0, 2) + "***" + domainPart;
        } else {
            return namePart.substring(0, 3) + "***" + namePart.substring(namePart.length() - 2) + domainPart;
        }
    }

    // In-memory Password Reset Code storage: email -> code
    private final Map<String, String> resetCodeStore = new ConcurrentHashMap<>();

    public AuthResponse sendPasswordResetCode(String email, String role) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please enter a valid registered email address.")
                    .build();
        }

        String cleanEmail = email.trim().toLowerCase();

        String recipientName = "EduConnect User";
        boolean userFound = false;

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
        if (teacherOpt.isPresent()) {
            userFound = true;
            Teacher t = teacherOpt.get();
            recipientName = (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
        } else {
            Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
            if (adminOpt.isPresent()) {
                userFound = true;
                Admin a = adminOpt.get();
                recipientName = (a.getFirstName() + " " + (a.getLastName() != null ? a.getLastName() : "")).trim();
            } else {
                Optional<Student> studentOpt = studentRepository.findAll().stream()
                        .filter(s -> s.getEmail() != null && s.getEmail().equalsIgnoreCase(cleanEmail))
                        .findFirst();
                if (studentOpt.isPresent()) {
                    userFound = true;
                    Student s = studentOpt.get();
                    recipientName = (s.getFirstName() + " " + (s.getLastName() != null ? s.getLastName() : "")).trim();
                }
            }
        }

        if (!userFound && !"teacher@educonnect.ac.in".equalsIgnoreCase(cleanEmail) && !"admin@educonnect.ac.in".equalsIgnoreCase(cleanEmail)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No account found matching email address: " + cleanEmail)
                    .build();
        }

        // Generate 6-digit reset code
        String resetCode = String.format("%06d", random.nextInt(1000000));
        resetCodeStore.put(cleanEmail, resetCode);

        log.info("Password Reset Code generated for {}: {}", cleanEmail, resetCode);

        // Send email with reset code
        emailService.sendResetEmail(cleanEmail, recipientName, resetCode);

        return AuthResponse.builder()
                .success(true)
                .message("Password reset code sent to your registered email address!")
                .identifier(cleanEmail)
                .name(recipientName)
                .build();
    }

    public AuthResponse resetPasswordWithCode(String email, String code, String newPassword) {
        if (email == null || code == null || newPassword == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email, verification code, and new password are required.")
                    .build();
        }

        String cleanEmail = email.trim().toLowerCase();
        String inputCode = code.trim();

        String cachedCode = resetCodeStore.get(cleanEmail);
        boolean isValid = cachedCode != null && cachedCode.equals(inputCode);

        if (!isValid) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid verification code. Please check your email and try again.")
                    .build();
        }

        // Clean up reset code
        resetCodeStore.remove(cleanEmail);

        // Update password in DB
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
        if (teacherOpt.isPresent()) {
            Teacher t = teacherOpt.get();
            t.setPassword(newPassword.trim());
            teacherRepository.save(t);
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
        if (adminOpt.isPresent()) {
            Admin a = adminOpt.get();
            a.setPassword(newPassword.trim());
            adminRepository.save(a);
        }

        return AuthResponse.builder()
                .success(true)
                .message("Password reset successfully! You can now log in with your new password.")
                .identifier(cleanEmail)
                .build();
    }

    private boolean isPasswordMatching(String rawPassword, String storedHash, String defaultFallback, Runnable autoUpgradeCallback) {
        if (storedHash == null || storedHash.trim().isEmpty()) {
            storedHash = defaultFallback;
        }

        // Check if stored string is BCrypt hash (starts with $2a$, $2b$, $2y$)
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }

        // Legacy plain text matching
        if (rawPassword.equals(storedHash)) {
            if (autoUpgradeCallback != null) {
                try {
                    autoUpgradeCallback.run();
                } catch (Exception e) {
                    log.warn("Failed auto-upgrading password to BCrypt hash: {}", e.getMessage());
                }
            }
            return true;
        }

        return false;
    }
}
