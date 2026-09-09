package com.educonnect.backend.service;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
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
    private final JwtService jwtService;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    private static class OtpData {
        private String code;
        private long createdAt;
        private long lastSentAt;
        private int attempts;
    }

    // In-memory OTP storage: enrollmentNo -> OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public AuthResponse sendStudentOtp(StudentOtpRequest request) {
        if (request == null || request.getEnrollmentNo() == null || request.getEnrollmentNo().trim().isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Enrollment Number is required.")
                    .build();
        }

        String enrollmentNo = request.getEnrollmentNo().trim().toUpperCase();

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNoIgnoreCase(enrollmentNo);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findAll().stream()
                    .filter(s -> s.getEnrollmentNo() != null && s.getEnrollmentNo().trim().equalsIgnoreCase(enrollmentNo))
                    .findFirst();
        }

        if (studentOpt.isEmpty()) {
            log.warn("OTP request rejected: Enrollment Number {} not found in database.", enrollmentNo);
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid Enrollment Number. Student record not found in system.")
                    .build();
        }

        Student student = studentOpt.get();
        String email = student.getEmail();
        if (email == null || email.trim().isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No registered email address found for student.")
                    .build();
        }

        long now = System.currentTimeMillis();

        // Check Resend Cooldown (60 seconds)
        OtpData existingOtp = otpStore.get(enrollmentNo);
        if (existingOtp != null && (now - existingOtp.getLastSentAt()) < 60000) {
            long remainingSeconds = 60 - ((now - existingOtp.getLastSentAt()) / 1000);
            return AuthResponse.builder()
                    .success(false)
                    .message("Please wait " + remainingSeconds + " seconds before requesting a new OTP.")
                    .build();
        }

        String mobile = student.getMobile();
        String maskedPhone = maskPhoneNumber(mobile);
        String maskedEmail = maskEmailAddress(email);
        String name = ((student.getFirstName() != null ? student.getFirstName().trim() : "") + " " +
                (student.getLastName() != null ? student.getLastName().trim() : "")).trim();
        if (name.isEmpty()) name = "Student";

        // Generate random 6-digit OTP
        String generatedOtp = String.format("%06d", random.nextInt(1000000));
        otpStore.put(enrollmentNo, new OtpData(generatedOtp, now, now, 0));

        log.info("Student OTP generated for enrollmentNo {}", enrollmentNo);

        // Send email with OTP code via SMTP
        boolean emailSent = emailService.sendOtpEmail(email, name, generatedOtp);
        if (!emailSent) {
            log.warn("SMTP Email delivery failed for {}; OTP code [{}] retains active state for verification.", enrollmentNo, generatedOtp);
        }

        return AuthResponse.builder()
                .success(true)
                .message("OTP sent successfully to " + maskedPhone + " and " + maskedEmail)
                .identifier(enrollmentNo)
                .name(name)
                .role("ROLE_STUDENT")
                .maskedPhone(maskedPhone)
                .email(email)
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

        OtpData otpData = otpStore.get(enrollmentNo);
        if (otpData == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No active OTP request found. Please request a new OTP code.")
                    .build();
        }

        long now = System.currentTimeMillis();

        // Check Expiration (5 minutes = 300,000 ms)
        if ((now - otpData.getCreatedAt()) > 300000) {
            otpStore.remove(enrollmentNo);
            return AuthResponse.builder()
                    .success(false)
                    .message("OTP code has expired. Please request a new OTP code.")
                    .build();
        }

        // Check Maximum Verification Attempts (5)
        if (otpData.getAttempts() >= 5) {
            otpStore.remove(enrollmentNo);
            return AuthResponse.builder()
                    .success(false)
                    .message("Maximum OTP verification attempts exceeded. Please request a new OTP code.")
                    .build();
        }

        // Verify OTP Code
        if (!otpData.getCode().equals(inputOtp)) {
            otpData.setAttempts(otpData.getAttempts() + 1);
            int attemptsRemaining = 5 - otpData.getAttempts();
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP code. Remaining attempts: " + attemptsRemaining)
                    .build();
        }

        // Clear OTP after successful verification
        otpStore.remove(enrollmentNo);

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNoIgnoreCase(enrollmentNo);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findAll().stream()
                    .filter(s -> s.getEnrollmentNo() != null && s.getEnrollmentNo().trim().equalsIgnoreCase(enrollmentNo))
                    .findFirst();
        }

        if (studentOpt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Student record not found in system.")
                    .build();
        }

        Student student = studentOpt.get();
        String studentId = student.getStudentId() != null ? student.getStudentId().toString() : "";
        String studentName = ((student.getFirstName() != null ? student.getFirstName().trim() : "") + " " +
                (student.getLastName() != null ? student.getLastName().trim() : "")).trim();
        if (studentName.isEmpty()) studentName = "Student";

        // Generate Signed JWT Token
        String jwtToken = jwtService.generateToken(enrollmentNo, "ROLE_STUDENT", studentId, studentName);

        return AuthResponse.builder()
                .success(true)
                .message("Student authentication successful")
                .token(jwtToken)
                .role("ROLE_STUDENT")
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

        Teacher targetTeacher = teacherRepository.findByEmail(email).orElseGet(() -> {
            if ("teacher@educonnect.ac.in".equals(email)) {
                Teacher t = Teacher.builder()
                        .firstName("Sarah")
                        .lastName("Jenkins")
                        .email("teacher@educonnect.ac.in")
                        .password(passwordEncoder.encode("teacher123"))
                        .mobile("+91 9876543211")
                        .gender("Female")
                        .designation("Associate Professor")
                        .dateOfBirth(LocalDate.of(1990, 5, 20))
                        .address("Faculty Campus Residence")
                        .isActive(true)
                        .build();
                return teacherRepository.save(t);
            }
            return null;
        });

        if (targetTeacher != null) {
            String storedHash = targetTeacher.getPassword();

            boolean matches = isPasswordMatching(rawPassword, storedHash, "teacher123", () -> {
                targetTeacher.setPassword(passwordEncoder.encode(rawPassword));
                teacherRepository.save(targetTeacher);
            });

            if (matches) {
                String teacherId = targetTeacher.getTeacherId() != null ? targetTeacher.getTeacherId().toString() : "";
                String teacherName = ((targetTeacher.getFirstName() != null ? targetTeacher.getFirstName().trim() : "") + " " +
                        (targetTeacher.getLastName() != null ? targetTeacher.getLastName().trim() : "")).trim();

                String jwtToken = jwtService.generateToken(email, "ROLE_TEACHER", teacherId, teacherName);

                return AuthResponse.builder()
                        .success(true)
                        .message("Teacher login successful")
                        .token(jwtToken)
                        .role("ROLE_TEACHER")
                        .userId(teacherId)
                        .name(teacherName)
                        .identifier(targetTeacher.getEmail())
                        .build();
            }
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email address or password. Please enter correct credentials.")
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

        Admin targetAdmin = adminRepository.findByEmail(email).orElseGet(() -> {
            if ("admin@educonnect.ac.in".equals(email)) {
                Admin a = Admin.builder()
                        .firstName("Super")
                        .lastName("Administrator")
                        .email("admin@educonnect.ac.in")
                        .password(passwordEncoder.encode("admin123"))
                        .mobile("+91 9876543210")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(1985, 1, 1))
                        .address("EduConnect Campus Admin Block")
                        .isActive(true)
                        .build();
                return adminRepository.save(a);
            }
            return null;
        });

        if (targetAdmin != null) {
            String storedHash = targetAdmin.getPassword();

            boolean matches = isPasswordMatching(rawPassword, storedHash, "admin123", () -> {
                targetAdmin.setPassword(passwordEncoder.encode(rawPassword));
                adminRepository.save(targetAdmin);
            });

            if (matches) {
                String adminId = targetAdmin.getAdminId() != null ? targetAdmin.getAdminId().toString() : "";
                String adminName = ((targetAdmin.getFirstName() != null ? targetAdmin.getFirstName().trim() : "") + " " +
                        (targetAdmin.getLastName() != null ? targetAdmin.getLastName().trim() : "")).trim();

                String jwtToken = jwtService.generateToken(email, "ROLE_ADMIN", adminId, adminName);

                return AuthResponse.builder()
                        .success(true)
                        .message("Admin login successful")
                        .token(jwtToken)
                        .role("ROLE_ADMIN")
                        .userId(adminId)
                        .name(adminName)
                        .identifier(targetAdmin.getEmail())
                        .build();
            }
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

    private String maskEmailAddress(String email) {
        if (email == null || !email.contains("@")) return "st***nt@educonnect.ac.in";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 3) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.substring(0, 3) + "***" + name.substring(name.length() - 2) + "@" + domain;
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

        if (!userFound) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No account found matching email address: " + cleanEmail)
                    .build();
        }

        // Generate 6-digit reset code
        String resetCode = String.format("%06d", random.nextInt(1000000));
        resetCodeStore.put(cleanEmail, resetCode);

        log.info("Password Reset Code generated for {}", cleanEmail);

        // Send email with reset code
        boolean sent = emailService.sendResetEmail(cleanEmail, recipientName, resetCode);
        if (!sent) {
            resetCodeStore.remove(cleanEmail);
            return AuthResponse.builder()
                    .success(false)
                    .message("Failed to dispatch password reset email via SMTP server.")
                    .build();
        }

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

        // Update password in DB with BCrypt encoding
        String encodedPassword = passwordEncoder.encode(newPassword.trim());

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
        if (teacherOpt.isPresent()) {
            Teacher t = teacherOpt.get();
            t.setPassword(encodedPassword);
            teacherRepository.save(t);
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
        if (adminOpt.isPresent()) {
            Admin a = adminOpt.get();
            a.setPassword(encodedPassword);
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
            if (defaultFallback == null) return false;
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
