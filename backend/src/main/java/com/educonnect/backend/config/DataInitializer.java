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
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

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
                        .password("admin123")
                        .mobile("+91 9876543210")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(1985, 1, 1))
                        .address("EduConnect Headquarters")
                        .isActive(true)
                        .build();
                adminRepository.save(admin);
                log.info("Demo Admin Created: admin@educonnect.ac.in / admin123");
            }

            // Seed Teacher if not exists
            if (teacherRepository.count() == 0) {
                Teacher teacher = Teacher.builder()
                        .firstName("Sarah")
                        .lastName("Jenkins")
                        .email("teacher@educonnect.ac.in")
                        .password("teacher123")
                        .mobile("+91 9876543211")
                        .gender("Female")
                        .designation("Associate Professor")
                        .dateOfBirth(LocalDate.of(1990, 5, 20))
                        .address("Faculty Campus Residence")
                        .isActive(true)
                        .build();
                teacherRepository.save(teacher);
                log.info("Demo Teacher Created: teacher@educonnect.ac.in / teacher123");
            }

            // Seed or Update Student email in database only if missing
            Optional<Student> s2Opt = studentRepository.findByEnrollmentNo("25CI2110016");
            if (s2Opt.isPresent()) {
                Student s2 = s2Opt.get();
                if (s2.getEmail() == null || s2.getEmail().trim().isEmpty()) {
                    s2.setEmail("maulik.svgu.16@gmail.com");
                    studentRepository.save(s2);
                }
            } else {
                Student student2 = Student.builder()
                        .enrollmentNo("25CI2110016")
                        .firstName("Maulik")
                        .lastName("Student")
                        .email("maulik.svgu.16@gmail.com")
                        .mobile("+91 9876543216")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(2003, 1, 1))
                        .address("EduConnect Campus")
                        .isActive(true)
                        .build();
                studentRepository.save(student2);
            }

            Optional<Student> s1Opt = studentRepository.findByEnrollmentNo("2024MCA001");
            if (s1Opt.isPresent()) {
                Student s1 = s1Opt.get();
                if (s1.getEmail() == null || s1.getEmail().trim().isEmpty()) {
                    s1.setEmail("maulik.svgu.16@gmail.com");
                    studentRepository.save(s1);
                }
            } else {
                Student student1 = Student.builder()
                        .enrollmentNo("2024MCA001")
                        .firstName("Alex")
                        .lastName("Johnson")
                        .email("maulik.svgu.16@gmail.com")
                        .mobile("+91 9876543212")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(2002, 8, 15))
                        .address("Student Hostel Block A")
                        .isActive(true)
                        .build();
                studentRepository.save(student1);
            }
            log.info("Student records initialized/verified in database.");

        } catch (Exception e) {
            log.warn("Seed data initialization note: {}", e.getMessage());
        }
    }
}
