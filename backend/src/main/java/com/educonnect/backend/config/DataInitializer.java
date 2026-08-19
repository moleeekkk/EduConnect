package com.educonnect.backend.config;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
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
    private final InstituteRepository instituteRepository;
    private final ProgramRepository programRepository;
    private final SemesterRepository semesterRepository;
    private final DivisionRepository divisionRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing EduConnect Common Database Foundation Seed Data...");

        try {
            // 1. Seed Institute
            Institute inst = instituteRepository.findByInstituteCode("CA").orElseGet(() -> {
                Institute i = Institute.builder()
                        .instituteCode("CA")
                        .instituteName("Computer Applications")
                        .description("Department of Computer Applications and Information Technology")
                        .contactEmail("dept.ca@educonnect.ac.in")
                        .contactMobile("+91 79 2630 1000")
                        .campusLocation("Academic Block A, Main Campus")
                        .isActive(true)
                        .build();
                return instituteRepository.save(i);
            });

            // 2. Seed Program
            Program prog = programRepository.findByProgramCode("MCA").orElseGet(() -> {
                Program p = Program.builder()
                        .institute(inst)
                        .programCode("MCA")
                        .programName("Master of Computer Applications")
                        .durationYears(2)
                        .isActive(true)
                        .build();
                return programRepository.save(p);
            });

            // 3. Seed Semester
            Semester sem3 = semesterRepository.findByProgram_ProgramId(prog.getProgramId()).stream()
                    .filter(s -> s.getSemesterNumber() == 3)
                    .findFirst()
                    .orElseGet(() -> {
                        Semester s = Semester.builder()
                                .program(prog)
                                .semesterNumber(3)
                                .semesterName("Semester 3")
                                .isActive(true)
                                .build();
                        return semesterRepository.save(s);
                    });

            // 4. Seed Division
            Division divA = divisionRepository.findByProgram_ProgramId(prog.getProgramId()).stream()
                    .filter(d -> "Div-A".equals(d.getDivisionName()))
                    .findFirst()
                    .orElseGet(() -> {
                        Division d = Division.builder()
                                .program(prog)
                                .semester(sem3)
                                .divisionName("Div-A")
                                .academicYear("2025-2026")
                                .isActive(true)
                                .build();
                        return divisionRepository.save(d);
                    });

            // 5. Seed Admin if not exists
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

            // 6. Seed Teacher if not exists
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
                        .institute(inst)
                        .isActive(true)
                        .build();
                teacherRepository.save(teacher);
                log.info("Demo Teacher Created: teacher@educonnect.ac.in / teacher123");
            }

            // 7. Seed Students & Link Foundation Entities
            Optional<Student> s2Opt = studentRepository.findByEnrollmentNo("25CI2110016");
            if (s2Opt.isPresent()) {
                Student s2 = s2Opt.get();
                s2.setInstitute(inst);
                s2.setProgram(prog);
                s2.setSemester(sem3);
                s2.setDivision(divA);
                if (s2.getEmail() == null || s2.getEmail().trim().isEmpty()) {
                    s2.setEmail("maulik.svgu.16@gmail.com");
                }
                studentRepository.save(s2);
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
                        .institute(inst)
                        .program(prog)
                        .semester(sem3)
                        .division(divA)
                        .isActive(true)
                        .build();
                studentRepository.save(student2);
            }

            Optional<Student> s1Opt = studentRepository.findByEnrollmentNo("2024MCA001");
            if (s1Opt.isPresent()) {
                Student s1 = s1Opt.get();
                s1.setInstitute(inst);
                s1.setProgram(prog);
                s1.setSemester(sem3);
                s1.setDivision(divA);
                if (s1.getEmail() == null || s1.getEmail().trim().isEmpty()) {
                    s1.setEmail("maulik.svgu.16@gmail.com");
                }
                studentRepository.save(s1);
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
                        .institute(inst)
                        .program(prog)
                        .semester(sem3)
                        .division(divA)
                        .isActive(true)
                        .build();
                studentRepository.save(student1);
            }

            // 8. Seed Default Subject if none exist
            if (subjectRepository.count() == 0) {
                Subject subj = Subject.builder()
                        .program(prog)
                        .semester(sem3)
                        .programId(prog.getProgramId())
                        .subjectCode("MCA301")
                        .subjectName("Advanced Web Technologies")
                        .credits(4)
                        .semesterNo(3)
                        .subjectType("Theory & Practical")
                        .isActive(true)
                        .build();
                subjectRepository.save(subj);
            }

            log.info("Common Database Foundation initialized successfully.");

        } catch (Exception e) {
            log.warn("Seed data initialization note: {}", e.getMessage());
        }
    }
}
