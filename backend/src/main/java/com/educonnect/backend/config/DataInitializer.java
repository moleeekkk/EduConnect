package com.educonnect.backend.config;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!seedEnabled) {
            log.info("Database seeding is disabled (app.seed.enabled=false). Skipping DataInitializer.");
            return;
        }

        log.info("Checking EduConnect Database Initial Master Data...");

        try {
            // 1. Seed Admin
            if (adminRepository.count() == 0) {
                Admin admin = Admin.builder()
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
                adminRepository.save(admin);
                log.info("Super Admin created in DB: admin@educonnect.ac.in");
            }

            // 2. Seed Teacher
            Teacher teacher = null;
            if (teacherRepository.count() == 0) {
                teacher = Teacher.builder()
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
                teacher = teacherRepository.save(teacher);
                log.info("Faculty Member created in DB: teacher@educonnect.ac.in");
            } else {
                teacher = teacherRepository.findAll().get(0);
            }

            // 3. Seed Institute
            Institute inst = null;
            if (instituteRepository.count() == 0) {
                inst = Institute.builder()
                        .instituteCode("CHARUSAT")
                        .instituteName("Charotar University of Science & Technology")
                        .campusLocation("Changa, Anand, Gujarat")
                        .contactEmail("info@charusat.ac.in")
                        .contactMobile("+91 2697265011")
                        .description("Premier academic university campus")
                        .isActive(true)
                        .build();
                inst = instituteRepository.save(inst);
                log.info("Institute created in DB: CHARUSAT");
            } else {
                inst = instituteRepository.findAll().get(0);
            }

            // 4. Seed Department
            Department dept = null;
            if (departmentRepository.count() == 0) {
                dept = Department.builder()
                        .departmentCode("CMPICA")
                        .departmentName("Department of Computer Applications")
                        .instituteId(inst.getInstituteId())
                        .durationYears(2)
                        .description("Smt. Chandaben Mohanbhai Patel Institute of Computer Applications")
                        .isActive(true)
                        .build();
                dept = departmentRepository.save(dept);
                log.info("Department created in DB: CMPICA");
            } else {
                dept = departmentRepository.findAll().get(0);
            }

            // 5. Seed Program
            if (programRepository.count() == 0) {
                programRepository.save(Program.builder()
                        .programCode("MCA")
                        .programName("Master of com app")
                        .departmentId(dept.getDepartmentId())
                        .instituteId(inst.getInstituteId())
                        .degreeType("Master")
                        .totalSemesters(4)
                        .durationYears(2)
                        .description("Postgraduate professional degree in computer applications.")
                        .isActive(true)
                        .build());
                log.info("Program created in DB: MCA");
            }

            // 6. Seed Semesters
            Semester sem1 = null;
            if (semesterRepository.count() < 4) {
                for (int i = 1; i <= 4; i++) {
                    final int semNum = i;
                    if (semesterRepository.findAll().stream().noneMatch(s -> s.getSemesterNumber() != null && s.getSemesterNumber() == semNum)) {
                        semesterRepository.save(Semester.builder().semesterNumber(semNum).semesterName("Semester " + semNum).departmentId(dept.getDepartmentId()).isActive(true).build());
                    }
                }
                log.info("Ensured Semesters 1 to 4 exist in DB");
            }
            sem1 = semesterRepository.findAllByOrderBySemesterNumberAsc().get(0);

            // 7. Seed Batches
            Batch batch = null;
            if (batchRepository.count() == 0) {
                batch = batchRepository.save(Batch.builder().batchName("2024-2026 Batch A").startYear(2024).endYear(2026).isActive(true).build());
                batchRepository.save(Batch.builder().batchName("2024-2026 Batch B").startYear(2024).endYear(2026).isActive(true).build());
                log.info("Batches created in DB");
            } else {
                batch = batchRepository.findAll().get(0);
            }

            // 8. Seed Students
            if (studentRepository.count() == 0) {
                Student s1 = Student.builder()
                        .enrollmentNo("25CI2110046")
                        .firstName("Manish")
                        .lastName("Pr")
                        .email("manishlakum4871@gmail.com")
                        .mobile("+91 9876543046")
                        .gender("Male")
                        .dateOfBirth(LocalDate.of(2002, 3, 10))
                        .instituteId(inst.getInstituteId())
                        .departmentId(dept.getDepartmentId())
                        .semesterId(sem1.getSemesterId())
                        .batchId(batch.getBatchId())
                        .address("CHARUSAT Campus Hostel Block A")
                        .isActive(true)
                        .build();
                studentRepository.save(s1);

                Student s2 = Student.builder()
                        .enrollmentNo("25CI2110047")
                        .firstName("Priya")
                        .lastName("Shah")
                        .email("student47@educonnect.ac.in")
                        .mobile("+91 9876543047")
                        .gender("Female")
                        .dateOfBirth(LocalDate.of(2002, 6, 25))
                        .instituteId(inst.getInstituteId())
                        .departmentId(dept.getDepartmentId())
                        .semesterId(sem1.getSemesterId())
                        .batchId(batch.getBatchId())
                        .address("Student Campus Girls Hostel")
                        .isActive(true)
                        .build();
                studentRepository.save(s2);

                log.info("Students created in DB: 25CI2110046 (Manish Pr) & 25CI2110047 (Priya Shah)");
            }

            // 9. Seed Subjects
            Subject subj1 = null;
            if (subjectRepository.count() == 0) {
                subj1 = subjectRepository.save(Subject.builder().subjectCode("MCA101").subjectName("Enterprise Java Architecture").departmentId(dept.getDepartmentId()).semesterId(sem1.getSemesterId()).credits(4).subjectType("Core Theory").isActive(true).build());
                subjectRepository.save(Subject.builder().subjectCode("MCA102").subjectName("Cloud Microservices & JWT Security").departmentId(dept.getDepartmentId()).semesterId(sem1.getSemesterId()).credits(4).subjectType("Core Theory").isActive(true).build());
                subjectRepository.save(Subject.builder().subjectCode("MCA103").subjectName("Relational Database Systems (PostgreSQL)").departmentId(dept.getDepartmentId()).semesterId(sem1.getSemesterId()).credits(4).subjectType("Core Theory").isActive(true).build());
                log.info("Subjects created in DB: MCA101, MCA102, MCA103");
            } else {
                subj1 = subjectRepository.findAll().get(0);
            }

            // 10. Seed Sample Assignment
            if (assignmentRepository.count() == 0 && subj1 != null) {
                Assignment asgn = Assignment.builder()
                        .title("Spring Boot & PostgreSQL Security Implementation")
                        .description("Implement JWT authentication and role-based endpoints in PostgreSQL.")
                        .dueDate(LocalDate.now().plusDays(7))
                        .totalMarks(50)
                        .subjectId(subj1.getSubjectId())
                        .fileName("SpringBoot_Security_Guide.pdf")
                        .attachment("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
                        .createdAt(LocalDateTime.now())
                        .build();
                assignmentRepository.save(asgn);
                log.info("Sample Assignment created in DB");
            }

        } catch (Exception e) {
            log.warn("Database initialization note: {}", e.getMessage(), e);
        }
    }
}
