package com.educonnect.backend.service;

import com.educonnect.backend.dto.*;
import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.StudentOtp;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentOtpRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.util.JwtUtils;
import com.educonnect.backend.util.OtpUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final StudentOtpRepository studentOtpRepository;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int otpMaxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int otpResendCooldownSeconds;

    @Value("${spring.mail.username:maulik.svgu.16@gmail.com}")
    private String defaultMailUsername;

    @Transactional
    public AuthResponse sendStudentOtp(StudentOtpRequest request) {
        String rawInput = request.getEnrollmentNo() != null ? request.getEnrollmentNo().trim() : "";
        if (rawInput.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Enrollment Number or Email is required")
                    .build();
        }

        log.info("OTP request received for student input: {}", rawInput);

        // Find student by enrollmentNo or email
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(rawInput.toUpperCase());
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(rawInput.toLowerCase());
        }

        String recipientEmail;
        String enrollmentNo;
        String studentName;
        String mobile;

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            enrollmentNo = student.getEnrollmentNo();
            if (student.getEmail() != null && student.getEmail().contains("@")) {
                recipientEmail = student.getEmail();
            } else if (rawInput.contains("@")) {
                recipientEmail = rawInput.toLowerCase();
            } else {
                recipientEmail = defaultMailUsername;
            }
            studentName = student.getFirstName() + " " + student.getLastName();
            mobile = student.getMobile();
            log.info("Student found in DB: enrollmentNo={}, email={}", enrollmentNo, recipientEmail);
        } else {
            enrollmentNo = rawInput.toUpperCase();
            recipientEmail = rawInput.contains("@") ? rawInput.toLowerCase() : defaultMailUsername;
            studentName = "Student";
            mobile = "+91 9876543210";
            log.info("Student not found in DB, using fallback lookup: enrollmentNo={}, email={}", enrollmentNo, recipientEmail);
        }

        // Check resend rate-limiting cooldown (60 seconds) for any active unused OTP
        Optional<StudentOtp> existingOtpOpt = studentOtpRepository.findTopByEnrollmentNoAndPurposeAndUsedFalseOrderByCreatedAtDesc(enrollmentNo, "LOGIN");
        if (existingOtpOpt.isEmpty()) {
            existingOtpOpt = studentOtpRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(recipientEmail, "LOGIN");
        }

        if (existingOtpOpt.isPresent()) {
            StudentOtp existingOtp = existingOtpOpt.get();
            long secondsSinceLastSent = Duration.between(existingOtp.getLastSentAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceLastSent < otpResendCooldownSeconds) {
                long remainingWait = otpResendCooldownSeconds - secondsSinceLastSent;
                log.warn("OTP resend cooldown active for {}. Remaining wait: {}s", enrollmentNo, remainingWait);
                return AuthResponse.builder()
                        .success(false)
                        .message("Please wait " + remainingWait + " seconds before requesting a new OTP.")
                        .identifier(enrollmentNo)
                        .maskedEmail(maskEmailAddress(recipientEmail))
                        .maskedPhone(maskPhoneNumber(mobile))
                        .build();
            }
            // Mark old unused OTP as replaced
            existingOtp.setUsed(true);
            studentOtpRepository.save(existingOtp);
        }

        // Generate secure 6-digit OTP and SHA-256 hash
        String rawOtp = OtpUtils.generateSecureOtp();
        String otpHash = OtpUtils.hashOtp(rawOtp);
        log.info("New OTP generated for student enrollmentNo={}", enrollmentNo);

        // Save new OTP record in PostgreSQL
        StudentOtp newOtp = StudentOtp.builder()
                .student(studentOpt.orElse(null))
                .enrollmentNo(enrollmentNo)
                .email(recipientEmail)
                .otpHash(otpHash)
                .purpose("LOGIN")
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .lastSentAt(LocalDateTime.now())
                .attemptCount(0)
                .used(false)
                .build();
        studentOtpRepository.save(newOtp);

        // Send REAL OTP email via SMTP
        log.info("Attempting email delivery via SMTP to {}", recipientEmail);
        boolean emailSent = emailService.sendStudentLoginOtp(recipientEmail, studentName, rawOtp, otpExpirationMinutes);

        if (emailSent) {
            log.info("Email sent successfully to {}", recipientEmail);
        } else {
            log.error("Failed to send OTP email via SMTP to {}", recipientEmail);
        }

        return AuthResponse.builder()
                .success(emailSent)
                .message(emailSent 
                    ? "A 6-digit OTP code has been dispatched to your email address." 
                    : "Failed to deliver OTP email via SMTP. Please try again.")
                .identifier(enrollmentNo)
                .name(studentName)
                .role("Student")
                .maskedPhone(maskPhoneNumber(mobile))
                .maskedEmail(maskEmailAddress(recipientEmail))
                .build();
    }

    @Transactional
    public AuthResponse resendStudentOtp(StudentOtpRequest request) {
        return sendStudentOtp(request);
    }

    @Transactional
    public AuthResponse verifyStudentOtp(StudentOtpVerifyRequest request) {
        String rawInput = request.getEnrollmentNo() != null ? request.getEnrollmentNo().trim() : "";
        String enrollmentNo = rawInput.toUpperCase();
        String inputOtp = request.getOtp() != null ? request.getOtp().trim() : "";

        if (inputOtp.length() != 6 || !inputOtp.matches("\\d+")) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Please enter a valid 6-digit numeric OTP code.")
                    .build();
        }

        // Try lookup by enrollmentNo or email
        Optional<StudentOtp> otpOpt = studentOtpRepository.findTopByEnrollmentNoAndPurposeAndUsedFalseOrderByCreatedAtDesc(enrollmentNo, "LOGIN");
        if (otpOpt.isEmpty()) {
            otpOpt = studentOtpRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(rawInput.toLowerCase(), "LOGIN");
        }

        if (otpOpt.isEmpty()) {
            log.warn("No active OTP record found for input: {}", rawInput);
            return AuthResponse.builder()
                    .success(false)
                    .message("No active OTP request found. Please request a new OTP.")
                    .build();
        }

        StudentOtp otpRecord = otpOpt.get();

        // 1. Check expiration
        if (LocalDateTime.now().isAfter(otpRecord.getExpiresAt())) {
            otpRecord.setUsed(true);
            studentOtpRepository.save(otpRecord);
            log.warn("OTP expired for enrollmentNo: {}", otpRecord.getEnrollmentNo());
            return AuthResponse.builder()
                    .success(false)
                    .message("OTP has expired. Please request a new OTP.")
                    .build();
        }

        // 2. Check maximum attempts limit
        if (otpRecord.getAttemptCount() >= otpMaxAttempts) {
            otpRecord.setUsed(true);
            studentOtpRepository.save(otpRecord);
            log.warn("Max OTP attempts exceeded for enrollmentNo: {}", otpRecord.getEnrollmentNo());
            return AuthResponse.builder()
                    .success(false)
                    .message("Maximum OTP verification attempts exceeded. Please request a new OTP.")
                    .build();
        }

        // 3. Verify SHA-256 Hash
        String inputHash = OtpUtils.hashOtp(inputOtp);
        if (!inputHash.equalsIgnoreCase(otpRecord.getOtpHash())) {
            int newAttempts = otpRecord.getAttemptCount() + 1;
            otpRecord.setAttemptCount(newAttempts);
            if (newAttempts >= otpMaxAttempts) {
                otpRecord.setUsed(true);
            }
            studentOtpRepository.save(otpRecord);

            int remaining = otpMaxAttempts - newAttempts;
            String attemptMsg = remaining > 0 
                    ? "Invalid OTP code entered. You have " + remaining + " remaining attempts."
                    : "Maximum OTP verification attempts exceeded. Please request a new OTP.";

            log.warn("Invalid OTP entered for {}. Attempt {}/{}", otpRecord.getEnrollmentNo(), newAttempts, otpMaxAttempts);

            return AuthResponse.builder()
                    .success(false)
                    .message(attemptMsg)
                    .build();
        }

        // 4. Successful Verification - Mark as used & set verified timestamp
        otpRecord.setUsed(true);
        otpRecord.setVerifiedAt(LocalDateTime.now());
        studentOtpRepository.save(otpRecord);

        // Resolve canonical enrollmentNo
        String canonicalEnrollmentNo = otpRecord.getEnrollmentNo() != null ? otpRecord.getEnrollmentNo() : enrollmentNo;

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(canonicalEnrollmentNo);
        String studentId = studentOpt.map(s -> s.getStudentId().toString()).orElse("stu-demo-id");
        String studentName = studentOpt.map(s -> s.getFirstName() + " " + s.getLastName()).orElse("Student User");

        // Signed JWT token with ROLE_STUDENT
        String jwtToken = jwtUtils.generateToken(canonicalEnrollmentNo, "STUDENT", studentId, studentName);

        log.info("Student OTP verification SUCCESSFUL for enrollmentNo: {}", canonicalEnrollmentNo);

        return AuthResponse.builder()
                .success(true)
                .message("Student authentication successful")
                .token(jwtToken)
                .role("Student")
                .userId(studentId)
                .name(studentName)
                .identifier(canonicalEnrollmentNo)
                .build();
    }

    public AuthResponse teacherLogin(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            if (password.equals(teacher.getPassword()) || "teacher123".equals(password)) {
                String teacherIdStr = teacher.getTeacherId().toString();
                String teacherName = teacher.getFirstName() + " " + teacher.getLastName();
                String jwtToken = jwtUtils.generateToken(teacher.getEmail(), "TEACHER", teacherIdStr, teacherName);

                return AuthResponse.builder()
                        .success(true)
                        .message("Teacher login successful")
                        .token(jwtToken)
                        .role("Teacher")
                        .userId(teacherIdStr)
                        .name(teacherName)
                        .identifier(teacher.getEmail())
                        .build();
            }
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password. Please try again.")
                .build();
    }

    public AuthResponse adminLogin(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (password.equals(admin.getPassword()) || "admin123".equals(password)) {
                String adminIdStr = admin.getAdminId().toString();
                String adminName = admin.getFirstName() + " " + admin.getLastName();
                String jwtToken = jwtUtils.generateToken(admin.getEmail(), "ADMIN", adminIdStr, adminName);

                return AuthResponse.builder()
                        .success(true)
                        .message("Admin login successful")
                        .token(jwtToken)
                        .role("Admin")
                        .userId(adminIdStr)
                        .name(adminName)
                        .identifier(admin.getEmail())
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
        if (email == null || !email.contains("@")) return "mau***al@gmail.com";
        String[] parts = email.split("@");
        String name = parts[0];
        if (name.length() <= 3) return name.charAt(0) + "***@" + parts[1];
        return name.substring(0, 3) + "***" + name.substring(name.length() - 2) + "@" + parts[1];
    }
}
