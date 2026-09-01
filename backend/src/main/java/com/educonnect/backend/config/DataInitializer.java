package com.educonnect.backend.config;

import com.educonnect.backend.entity.Admin;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing EduConnect Seed Data...");

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

            // Seed Teacher if not exists
            if (teacherRepository.count() == 0) {
                Teacher teacher = Teacher.builder()
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
                teacherRepository.save(teacher);
                log.info("Demo Teacher Created with BCrypt Hashed Password: teacher@educonnect.ac.in");
            }

            // Seed Student if not exists
            if (studentRepository.count() == 0) {
                Student student = Student.builder()
                        .enrollmentNo("2024MCA001")
                        .firstName("Alex")
                        .lastName("Johnson")
                        .email("alex.johnson@educonnect.ac.in")
                        .mobile("+91 9876543212")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(2002, 8, 15))
                        .address("Student Hostel Block A")
                        .isActive(true)
                        .build();
                studentRepository.save(student);
                log.info("Demo Student Created: Enrollment 2024MCA001");
            }

        } catch (Exception e) {
            log.warn("Seed data initialization note: {}", e.getMessage());
        }
    }
}
