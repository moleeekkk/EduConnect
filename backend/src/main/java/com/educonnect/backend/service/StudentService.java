package com.educonnect.backend.service;

import com.educonnect.backend.entity.Student;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.BatchRepository;
import com.educonnect.backend.repository.DepartmentRepository;
import com.educonnect.backend.repository.InstituteRepository;
import com.educonnect.backend.repository.SemesterRepository;
import com.educonnect.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Student> getStudentById(UUID id) {
        return studentRepository.findById(id);
    }

    @Transactional
    public Student createStudent(Student student) {
        student.setStudentId(null); // Ensure Hibernate performs INSERT with generated UUID
        if (student.getIsActive() == null) {
            student.setIsActive(true);
        }
        if (student.getFirstName() == null || student.getFirstName().trim().isEmpty()) {
            student.setFirstName("Student");
        }
        if (student.getLastName() == null) {
            student.setLastName("");
        }
        if (student.getEnrollmentNo() == null || student.getEnrollmentNo().trim().isEmpty()) {
            student.setEnrollmentNo("25CI" + (System.currentTimeMillis() % 100000));
        } else if (studentRepository.existsByEnrollmentNo(student.getEnrollmentNo())) {
            student.setEnrollmentNo(student.getEnrollmentNo() + "-" + (System.currentTimeMillis() % 1000));
        }
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            student.setEmail("student" + (System.currentTimeMillis() % 10000) + "@educonnect.ac.in");
        } else if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            String email = student.getEmail();
            int atIdx = email.indexOf("@");
            if (atIdx > 0) {
                student.setEmail(email.substring(0, atIdx) + "+" + (System.currentTimeMillis() % 10000) + email.substring(atIdx));
            } else {
                student.setEmail("student" + (System.currentTimeMillis() % 10000) + "@educonnect.ac.in");
            }
        }
        if (student.getMobile() == null) student.setMobile("N/A");
        if (student.getGender() == null) student.setGender("Male");
        if (student.getAddress() == null) student.setAddress("");

        // Validate Foreign Keys to prevent FK Constraint Exceptions
        if (student.getInstituteId() != null && !instituteRepository.existsById(student.getInstituteId())) {
            student.setInstituteId(null);
        }
        if (student.getDepartmentId() != null && !departmentRepository.existsById(student.getDepartmentId())) {
            student.setDepartmentId(null);
        }
        if (student.getSemesterId() != null && !semesterRepository.existsById(student.getSemesterId())) {
            student.setSemesterId(null);
        }
        if (student.getBatchId() != null && !batchRepository.existsById(student.getBatchId())) {
            student.setBatchId(null);
        }

        if (student.getCreatedAt() == null) student.setCreatedAt(java.time.LocalDateTime.now());
        student.setUpdatedAt(java.time.LocalDateTime.now());

        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(UUID id, Student updated) {
        return studentRepository.findById(id).map(existing -> {
            if (updated.getEnrollmentNo() != null) existing.setEnrollmentNo(updated.getEnrollmentNo());
            if (updated.getFirstName() != null) existing.setFirstName(updated.getFirstName());
            if (updated.getLastName() != null) existing.setLastName(updated.getLastName());
            if (updated.getSurname() != null) existing.setSurname(updated.getSurname());
            if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
            if (updated.getMobile() != null) existing.setMobile(updated.getMobile());
            if (updated.getGender() != null) existing.setGender(updated.getGender());
            if (updated.getDateOfBirth() != null) existing.setDateOfBirth(updated.getDateOfBirth());
            if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
            if (updated.getProfilePhoto() != null) existing.setProfilePhoto(updated.getProfilePhoto());

            if (updated.getInstituteId() != null) {
                existing.setInstituteId(instituteRepository.existsById(updated.getInstituteId()) ? updated.getInstituteId() : null);
            }
            if (updated.getDepartmentId() != null) {
                existing.setDepartmentId(departmentRepository.existsById(updated.getDepartmentId()) ? updated.getDepartmentId() : null);
            }
            if (updated.getSemesterId() != null) {
                existing.setSemesterId(semesterRepository.existsById(updated.getSemesterId()) ? updated.getSemesterId() : null);
            }
            if (updated.getBatchId() != null) {
                existing.setBatchId(batchRepository.existsById(updated.getBatchId()) ? updated.getBatchId() : null);
            }

            if (updated.getParentName() != null) existing.setParentName(updated.getParentName());
            if (updated.getParentMobile() != null) existing.setParentMobile(updated.getParentMobile());
            if (updated.getParentEmail() != null) existing.setParentEmail(updated.getParentEmail());
            if (updated.getBloodGroup() != null) existing.setBloodGroup(updated.getBloodGroup());
            if (updated.getAdmissionDate() != null) existing.setAdmissionDate(updated.getAdmissionDate());
            if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            return studentRepository.save(existing);
        }).orElseGet(() -> {
            updated.setStudentId(id);
            if (updated.getCreatedAt() == null) updated.setCreatedAt(java.time.LocalDateTime.now());
            if (updated.getUpdatedAt() == null) updated.setUpdatedAt(java.time.LocalDateTime.now());
            return studentRepository.save(updated);
        });
    }

    @Transactional
    public void deleteStudent(UUID id) {
        studentRepository.deleteById(id);
    }

    public Map<String, Object> getStudentDashboard(String studentIdOrEnrollment) {
        Map<String, Object> data = new HashMap<>();
        Optional<Student> sOpt = studentRepository.findByEnrollmentNo(studentIdOrEnrollment);
        if (sOpt.isPresent()) {
            Student s = sOpt.get();
            data.put("studentName", s.getFirstName() + " " + s.getLastName());
            data.put("enrollmentNo", s.getEnrollmentNo());
        } else {
            data.put("studentName", "Student");
            data.put("enrollmentNo", studentIdOrEnrollment != null ? studentIdOrEnrollment : "");
        }
        data.put("program", "Department of Computer Applications");
        data.put("semester", "Semester 1");
        data.put("overallAttendance", "0%");
        data.put("cgpa", "N/A");
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
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo);
        Map<String, Object> profile = new HashMap<>();

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            profile.put("enrollmentNo", s.getEnrollmentNo());
            profile.put("name", s.getFirstName() + " " + s.getLastName());
            profile.put("email", s.getEmail());
            profile.put("mobile", s.getMobile());
            profile.put("gender", s.getGender());
            profile.put("dob", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
            profile.put("address", s.getAddress());
        }
        return profile;
    }
}
