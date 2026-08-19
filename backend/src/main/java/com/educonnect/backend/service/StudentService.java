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
        Optional<Student> studentOpt = Optional.empty();
        if (studentIdOrEnrollment != null && !studentIdOrEnrollment.isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(studentIdOrEnrollment.toUpperCase());
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(studentIdOrEnrollment.toLowerCase());
            }
        }

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            data.put("studentName", s.getFirstName() + " " + s.getLastName());
            data.put("enrollmentNo", s.getEnrollmentNo());
        } else {
            data.put("studentName", "");
            data.put("enrollmentNo", studentIdOrEnrollment != null ? studentIdOrEnrollment : "");
        }

        data.put("program", "");
        data.put("semester", "");
        data.put("overallAttendance", "0%");
        data.put("cgpa", "0.0 / 10");
        data.put("todayClasses", Collections.emptyList());

        return data;
    }

    public List<Map<String, Object>> getStudentAttendance(String studentIdOrEnrollment) {
        return Collections.emptyList();
    }

    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        return Collections.emptyList();
    }

    public Map<String, Object> getStudentResults(String enrollmentNo) {
        Map<String, Object> results = new HashMap<>();
        results.put("sgpa", 0.0);
        results.put("cgpa", 0.0);
        results.put("totalCredits", 0);
        results.put("subjects", Collections.emptyList());
        return results;
    }

    public Map<String, Object> getStudentProfile(String enrollmentNo) {
        Optional<Student> studentOpt = Optional.empty();
        if (enrollmentNo != null && !enrollmentNo.isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.toUpperCase());
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(enrollmentNo.toLowerCase());
            }
        }

        Map<String, Object> profile = new HashMap<>();
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            profile.put("enrollmentNo", s.getEnrollmentNo());
            profile.put("name", s.getFirstName() + " " + s.getLastName());
            profile.put("email", s.getEmail() != null ? s.getEmail() : "");
            profile.put("mobile", s.getMobile() != null ? s.getMobile() : "");
            profile.put("gender", s.getGender() != null ? s.getGender() : "");
            profile.put("dob", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
            profile.put("address", s.getAddress() != null ? s.getAddress() : "");
        } else {
            profile.put("enrollmentNo", enrollmentNo != null ? enrollmentNo : "");
            profile.put("name", "");
            profile.put("email", "");
            profile.put("mobile", "");
            profile.put("gender", "");
            profile.put("dob", "");
            profile.put("address", "");
        }
        profile.put("program", "");
        profile.put("semester", "");

        return profile;
    }
}
