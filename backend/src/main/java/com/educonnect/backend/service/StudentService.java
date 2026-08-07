package com.educonnect.backend.service;

import com.educonnect.backend.entity.Student;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public Map<String, Object> getStudentDashboard(String studentIdOrEnrollment) {
        Map<String, Object> data = new HashMap<>();
        data.put("studentName", "Alex Johnson");
        data.put("enrollmentNo", studentIdOrEnrollment != null ? studentIdOrEnrollment : "2024MCA001");
        data.put("program", "Master of Computer Applications");
        data.put("semester", "Semester 3");
        data.put("overallAttendance", "88.5%");
        data.put("cgpa", "8.75 / 10");

        List<Map<String, String>> todayClasses = Arrays.asList(
                Map.of("subject", "Advanced Web Technologies", "time", "09:30 AM - 11:00 AM", "room", "Lab 302", "teacher", "Dr. Sarah Jenkins"),
                Map.of("subject", "Cloud Infrastructure & DevOps", "time", "11:30 AM - 01:00 PM", "room", "Hall B", "teacher", "Prof. Michael Vance"),
                Map.of("subject", "Database Architecture Practical", "time", "02:00 PM - 04:00 PM", "room", "Lab 105", "teacher", "Er. Rahul Mehta")
        );
        data.put("todayClasses", todayClasses);

        return data;
    }

    public List<Map<String, Object>> getStudentAttendance(String studentIdOrEnrollment) {
        List<Map<String, Object>> courses = new ArrayList<>();
        courses.add(Map.of("code", "MCA301", "title", "Advanced Web Technologies", "total", 40, "attended", 36, "percentage", 90.0, "teacher", "Dr. Sarah Jenkins"));
        courses.add(Map.of("code", "MCA302", "title", "Cloud Infrastructure & DevOps", "total", 38, "attended", 34, "percentage", 89.4, "teacher", "Prof. Michael Vance"));
        courses.add(Map.of("code", "MCA303", "title", "Database Architecture Practical", "total", 30, "attended", 27, "percentage", 90.0, "teacher", "Er. Rahul Mehta"));
        courses.add(Map.of("code", "MCA304", "title", "Software Engineering & Testing", "total", 36, "attended", 29, "percentage", 80.5, "teacher", "Dr. Ananya Sharma"));
        courses.add(Map.of("code", "MCA305", "title", "Cyber Security Fundamentals", "total", 32, "attended", 23, "percentage", 71.8, "teacher", "Prof. David Miller"));
        return courses;
    }

    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        List<Map<String, Object>> assignments = new ArrayList<>();
        assignments.add(Map.of("id", "ASG-101", "subject", "Advanced Web Technologies", "title", "React 19 Hooks & State Management", "dueDate", "12-AUG-2026", "marks", "50", "status", "Pending"));
        assignments.add(Map.of("id", "ASG-102", "subject", "Cloud Infrastructure", "title", "Docker Containerization & Kubernetes", "dueDate", "15-AUG-2026", "marks", "100", "status", "Submitted"));
        assignments.add(Map.of("id", "ASG-103", "subject", "Database Architecture", "title", "PostgreSQL Indexing & Optimization", "dueDate", "05-AUG-2026", "marks", "50", "status", "Graded", "obtainedMarks", 46));
        return assignments;
    }

    public Map<String, Object> getStudentResults(String enrollmentNo) {
        Map<String, Object> results = new HashMap<>();
        results.put("sgpa", 8.85);
        results.put("cgpa", 8.75);
        results.put("totalCredits", 24);

        List<Map<String, Object>> subjectGrades = Arrays.asList(
                Map.of("code", "MCA301", "name", "Advanced Web Tech", "grade", "A+", "points", 9.0),
                Map.of("code", "MCA302", "name", "Cloud DevOps", "grade", "A", "points", 8.5),
                Map.of("code", "MCA303", "name", "Database Practical", "grade", "O", "points", 10.0),
                Map.of("code", "MCA304", "name", "Software Testing", "grade", "A", "points", 8.0)
        );
        results.put("subjects", subjectGrades);
        return results;
    }

    public Map<String, Object> getStudentProfile(String enrollmentNo) {
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo != null ? enrollmentNo : "2024MCA001");
        Map<String, Object> profile = new HashMap<>();

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            profile.put("enrollmentNo", s.getEnrollmentNo());
            profile.put("name", s.getFirstName() + " " + s.getLastName());
            profile.put("email", s.getEmail());
            profile.put("mobile", s.getMobile());
            profile.put("gender", s.getGender());
            profile.put("dob", s.getDateOfBirth().toString());
            profile.put("address", s.getAddress());
        } else {
            profile.put("enrollmentNo", "2024MCA001");
            profile.put("name", "Alex Johnson");
            profile.put("email", "alex.johnson@educonnect.ac.in");
            profile.put("mobile", "+91 9876543210");
            profile.put("gender", "Male");
            profile.put("dob", "2002-08-15");
            profile.put("address", "Student Hostel Block A, EduConnect Campus");
        }
        profile.put("program", "Master of Computer Applications");
        profile.put("semester", "Semester 3");

        return profile;
    }
}
