package com.educonnect.backend.service;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.repository.AdminRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.SubjectRepository;
import com.educonnect.backend.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final SubjectRepository subjectRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", studentRepository.count());
        data.put("totalFaculty", teacherRepository.count());
        data.put("activeCourses", subjectRepository.count());
        data.put("systemUptime", "100%");
        data.put("recentLogs", Collections.emptyList());

        return data;
    }

    public List<UserDto> getAllUsers() {
        List<UserDto> users = new ArrayList<>();

        studentRepository.findAll().forEach(s -> users.add(UserDto.builder()
                .id(s.getEnrollmentNo())
                .name(s.getFirstName() + " " + s.getLastName())
                .email(s.getEmail())
                .role("Student")
                .department("Computer Applications")
                .status(s.getIsActive() ? "Active" : "Inactive")
                .identifier(s.getEnrollmentNo())
                .build()));

        teacherRepository.findAll().forEach(t -> users.add(UserDto.builder()
                .id(t.getTeacherId().toString().length() >= 8 ? t.getTeacherId().toString().substring(0, 8) : t.getTeacherId().toString())
                .name(t.getFirstName() + " " + t.getLastName())
                .email(t.getEmail())
                .role("Teacher")
                .department(t.getDesignation() != null ? t.getDesignation() : "Computer Science")
                .status(t.getIsActive() ? "Active" : "Inactive")
                .identifier(t.getEmail())
                .build()));

        return users;
    }

    public UserDto createUser(UserDto dto) {
        if ("Student".equalsIgnoreCase(dto.getRole())) {
            String enrollmentNo = dto.getIdentifier() != null ? dto.getIdentifier() : "STU" + System.currentTimeMillis() % 10000;
            String[] nameParts = dto.getName() != null ? dto.getName().split(" ") : new String[]{"Student"};
            Student s = Student.builder()
                    .enrollmentNo(enrollmentNo)
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "Student")
                    .email(dto.getEmail() != null ? dto.getEmail() : enrollmentNo.toLowerCase() + "@educonnect.ac.in")
                    .mobile("+91 9876543210")
                    .gender("Male")
                    .dateOfBirth(LocalDate.of(2002, 1, 1))
                    .address("Institutional Campus")
                    .isActive(true)
                    .build();
            studentRepository.save(s);
            dto.setId(enrollmentNo);
        } else {
            String[] nameParts = dto.getName() != null ? dto.getName().split(" ") : new String[]{"Faculty"};
            Teacher t = Teacher.builder()
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "Faculty")
                    .email(dto.getEmail() != null ? dto.getEmail() : "faculty" + System.currentTimeMillis() % 1000 + "@educonnect.ac.in")
                    .password("teacher123")
                    .mobile("+91 9876543210")
                    .gender("Female")
                    .designation("Assistant Professor")
                    .dateOfBirth(LocalDate.of(1988, 5, 15))
                    .address("Faculty Quarters")
                    .isActive(true)
                    .build();
            Teacher saved = teacherRepository.save(t);
            dto.setId(saved.getTeacherId().toString());
        }
        dto.setStatus("Active");
        return dto;
    }

    public List<Map<String, Object>> getCourses() {
        List<Map<String, Object>> courses = new ArrayList<>();
        subjectRepository.findAll().forEach(s -> courses.add(Map.of(
                "code", s.getSubjectCode() != null ? s.getSubjectCode() : "",
                "name", s.getSubjectName() != null ? s.getSubjectName() : "",
                "credits", s.getCredits() != null ? s.getCredits() : 4,
                "type", s.getSubjectType() != null ? s.getSubjectType() : "Theory",
                "semester", s.getSemesterNo() != null ? s.getSemesterNo() : 1
        )));
        return courses;
    }

    public Map<String, Object> createCourse(Map<String, Object> courseData) {
        String code = (String) courseData.getOrDefault("code", "MCA" + (System.currentTimeMillis() % 1000));
        String name = (String) courseData.getOrDefault("name", "New Computer Science Course");

        Subject subject = Subject.builder()
                .programId(UUID.randomUUID())
                .subjectCode(code)
                .subjectName(name)
                .credits(4)
                .semesterNo(3)
                .subjectType("Theory")
                .isActive(true)
                .build();

        subjectRepository.save(subject);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Course module created and persisted to database");
        res.put("code", code);
        res.put("name", name);
        return res;
    }
}
