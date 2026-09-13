package com.educonnect.backend.config;

import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing EduConnect Seed Data & Schema Adjustments...");

        // Ensure profile_photo and address columns are TEXT type in database
        try {
            jdbcTemplate.execute("ALTER TABLE admins ALTER COLUMN profile_photo TYPE TEXT");
        } catch (Exception e) {
            log.info("Note on admins.profile_photo column alter: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE teachers ALTER COLUMN profile_photo TYPE TEXT");
        } catch (Exception e) {
            log.info("Note on teachers.profile_photo column alter: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE students ALTER COLUMN profile_photo TYPE TEXT");
        } catch (Exception e) {
            log.info("Note on students.profile_photo column alter: {}", e.getMessage());
        }

        try {
            // Seed Admin if not exists
            if (adminRepository.count() == 0) {
                Admin admin = Admin.builder()
                        .firstName("Super")
                        .lastName("Administrator")
                        .email("admin@educonnect.ac.in")
                        .password(passwordEncoder.encode("admin123"))
                        .mobile("+91 9876543210")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(1985, 1, 1))
                        .address("EduConnect Headquarters")
                        .isActive(true)
                        .build();
                adminRepository.save(admin);
                log.info("Demo Admin Created with BCrypt Hashed Password: admin@educonnect.ac.in");
            }

        } catch (Exception e) {
            log.warn("Seed data initialization note: {}", e.getMessage());
        }
    }
}

