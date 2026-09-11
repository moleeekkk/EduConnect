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
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static class OtpData {
        private String code;
        private long createdAt;
        private long lastSentAt;
        private int attempts;

        public OtpData() {}

        public OtpData(String code, long createdAt, long lastSentAt, int attempts) {
            this.code = code;
            this.createdAt = createdAt;
            this.lastSentAt = lastSentAt;
            this.attempts = attempts;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public long getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(long createdAt) {
            this.createdAt = createdAt;
        }

        public long getLastSentAt() {
            return lastSentAt;
        }

        public void setLastSentAt(long lastSentAt) {
            this.lastSentAt = lastSentAt;
        }

        public int getAttempts() {
            return attempts;
        }

        public void setAttempts(int attempts) {
            this.attempts = attempts;
        }
    }

    private static class ResetCodeData {
        private String code;
        private String role;
        private long createdAt;
        private int attempts;

        public ResetCodeData() {}

        public ResetCodeData(String code, String role, long createdAt, int attempts) {
            this.code = code;
            this.role = role;
            this.createdAt = createdAt;
            this.attempts = attempts;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public long getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(long createdAt) {
            this.createdAt = createdAt;
        }

        public int getAttempts() {
            return attempts;
        }

        public void setAttempts(int attempts) {
            this.attempts = attempts;
        }
    }

    // In-memory OTP storage: enrollmentNo -> OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    // In-memory Password Reset Code storage: roleKey:email -> ResetCodeData
    private final Map<String, ResetCodeData> resetCodeStore = new ConcurrentHashMap<>();

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
        if (Boolean.FALSE.equals(student.getIsActive())) {
            log.warn("OTP request rejected: Student account {} is disabled.", enrollmentNo);
            return AuthResponse.builder()
                    .success(false)
                    .message("Student account is disabled. Please contact administrator.")
                    .build();
        }

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

        String maskedPhone = maskPhoneNumber(student.getMobile());
        String maskedEmail = maskEmailAddress(email);
        String name = ((student.getFirstName() != null ? student.getFirstName().trim() : "") + " " +
                (student.getLastName() != null ? student.getLastName().trim() : "")).trim();
        if (name.isEmpty()) name = "Student";

        // Generate random 6-digit OTP
        String generatedOtp = String.format("%06d", random.nextInt(1000000));

        // Send email with OTP code via SMTP
        boolean emailSent = emailService.sendOtpEmail(email, name, generatedOtp);
        if (!emailSent) {
            log.error("SMTP Email delivery failed for student {}; OTP dispatch aborted.", enrollmentNo);
            return AuthResponse.builder()
                    .success(false)
                    .message("Failed to send OTP email via SMTP server. Please check email settings or try again.")
                    .build();
        }

        // Only store OTP if email delivery succeeded
        otpStore.put(enrollmentNo, new OtpData(generatedOtp, now, now, 0));
        log.info("Student OTP generated and delivered via email for enrollmentNo {}", enrollmentNo);

        return AuthResponse.builder()
                .success(true)
                .message("OTP sent successfully to registered email address (" + maskedEmail + ").")
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

        // Clear OTP after successful verification (single-use)
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
        if (Boolean.FALSE.equals(student.getIsActive())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Student account is disabled. Access denied.")
                    .build();
        }

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

        Teacher targetTeacher = teacherRepository.findByEmail(email).orElse(null);

        if (targetTeacher != null) {
            if (Boolean.FALSE.equals(targetTeacher.getIsActive())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Teacher account is disabled. Please contact administrator.")
                        .build();
            }

            String storedHash = targetTeacher.getPassword();

            boolean matches = isPasswordMatchingStrict(rawPassword, storedHash, () -> {
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

        Admin targetAdmin = adminRepository.findByEmail(email).orElse(null);

        if (targetAdmin != null) {
            if (Boolean.FALSE.equals(targetAdmin.getIsActive())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Admin account is disabled. Access denied.")
                        .build();
            }

            String storedHash = targetAdmin.getPassword();

            boolean matches = isPasswordMatchingStrict(rawPassword, storedHash, () -> {
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

    public AuthResponse sendPasswordResetCode(String email, String role) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please enter a valid registered email address.")
                    .build();
        }

        String cleanEmail = email.trim().toLowerCase();
        String normalizedRole = normalizeRole(role);

        String recipientName = "EduConnect User";
        boolean userFound = false;

        if ("ROLE_TEACHER".equals(normalizedRole)) {
            Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
            if (teacherOpt.isPresent()) {
                userFound = true;
                Teacher t = teacherOpt.get();
                recipientName = (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
            }
        } else if ("ROLE_ADMIN".equals(normalizedRole)) {
            Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
            if (adminOpt.isPresent()) {
                userFound = true;
                Admin a = adminOpt.get();
                recipientName = (a.getFirstName() + " " + (a.getLastName() != null ? a.getLastName() : "")).trim();
            }
        } else {
            // Unspecified role: search in order Teacher, Admin
            Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
            if (teacherOpt.isPresent()) {
                userFound = true;
                normalizedRole = "ROLE_TEACHER";
                Teacher t = teacherOpt.get();
                recipientName = (t.getFirstName() + " " + (t.getLastName() != null ? t.getLastName() : "")).trim();
            } else {
                Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
                if (adminOpt.isPresent()) {
                    userFound = true;
                    normalizedRole = "ROLE_ADMIN";
                    Admin a = adminOpt.get();
                    recipientName = (a.getFirstName() + " " + (a.getLastName() != null ? a.getLastName() : "")).trim();
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
        String storeKey = normalizedRole + ":" + cleanEmail;
        long now = System.currentTimeMillis();

        // Send email with reset code via SMTP
        boolean sent = emailService.sendResetEmail(cleanEmail, recipientName, resetCode);
        if (!sent) {
            resetCodeStore.remove(storeKey);
            return AuthResponse.builder()
                    .success(false)
                    .message("Failed to dispatch password reset email via SMTP server.")
                    .build();
        }

        // Store reset code with role key, creation timestamp, and attempt counter
        resetCodeStore.put(storeKey, new ResetCodeData(resetCode, normalizedRole, now, 0));
        log.info("Password Reset Code generated for {}", storeKey);

        return AuthResponse.builder()
                .success(true)
                .message("Password reset code sent to your registered email address!")
                .identifier(cleanEmail)
                .role(normalizedRole)
                .name(recipientName)
                .build();
    }

    public AuthResponse resetPasswordWithCode(String email, String code, String newPassword, String role) {
        if (email == null || code == null || newPassword == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email, verification code, and new password are required.")
                    .build();
        }

        String cleanEmail = email.trim().toLowerCase();
        String inputCode = code.trim();
        String targetRole = normalizeRole(role);

        String storeKey = targetRole + ":" + cleanEmail;
        ResetCodeData resetData = resetCodeStore.get(storeKey);

        // Fallback check if storeKey without role exists
        if (resetData == null) {
            storeKey = "ROLE_TEACHER:" + cleanEmail;
            resetData = resetCodeStore.get(storeKey);
            if (resetData == null) {
                storeKey = "ROLE_ADMIN:" + cleanEmail;
                resetData = resetCodeStore.get(storeKey);
            }
        }

        if (resetData == null) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No active password reset request found. Please request a new code.")
                    .build();
        }

        long now = System.currentTimeMillis();

        // Expiry check (10 minutes = 600,000 ms)
        if ((now - resetData.getCreatedAt()) > 600000) {
            resetCodeStore.remove(storeKey);
            return AuthResponse.builder()
                    .success(false)
                    .message("Password reset code has expired. Please request a new code.")
                    .build();
        }

        // Attempt limit check (5 attempts)
        if (resetData.getAttempts() >= 5) {
            resetCodeStore.remove(storeKey);
            return AuthResponse.builder()
                    .success(false)
                    .message("Maximum reset verification attempts exceeded. Please request a new code.")
                    .build();
        }

        if (!resetData.getCode().equals(inputCode)) {
            resetData.setAttempts(resetData.getAttempts() + 1);
            int remaining = 5 - resetData.getAttempts();
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid verification code. Remaining attempts: " + remaining)
                    .build();
        }

        // Single-use: clean up reset code immediately after verification
        resetCodeStore.remove(storeKey);

        // Update password in DB for ONLY the matching role
        String encodedPassword = passwordEncoder.encode(newPassword.trim());
        String effectiveRole = resetData.getRole();

        if ("ROLE_TEACHER".equals(effectiveRole)) {
            Optional<Teacher> teacherOpt = teacherRepository.findByEmail(cleanEmail);
            if (teacherOpt.isPresent()) {
                Teacher t = teacherOpt.get();
                t.setPassword(encodedPassword);
                teacherRepository.save(t);
            }
        } else if ("ROLE_ADMIN".equals(effectiveRole)) {
            Optional<Admin> adminOpt = adminRepository.findByEmail(cleanEmail);
            if (adminOpt.isPresent()) {
                Admin a = adminOpt.get();
                a.setPassword(encodedPassword);
                adminRepository.save(a);
            }
        }

        return AuthResponse.builder()
                .success(true)
                .message("Password reset successfully! You can now log in with your new password.")
                .identifier(cleanEmail)
                .role(effectiveRole)
                .build();
    }

    private String normalizeRole(String role) {
        if (role == null || role.trim().isEmpty()) return "ROLE_TEACHER";
        String r = role.trim().toUpperCase();
        if (!r.startsWith("ROLE_")) {
            return "ROLE_" + r;
        }
        return r;
    }

    private boolean isPasswordMatchingStrict(String rawPassword, String storedHash, Runnable autoUpgradeCallback) {
        if (storedHash == null || storedHash.trim().isEmpty()) {
            return false;
        }

        // Check if stored string is BCrypt hash (starts with $2a$, $2b$, $2y$)
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }

        // Legacy plain text matching (for existing unhashed legacy records in DB)
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
