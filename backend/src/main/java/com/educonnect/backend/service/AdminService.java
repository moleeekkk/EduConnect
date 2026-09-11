package com.educonnect.backend.service;

import com.educonnect.backend.dto.UserDto;
import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final InstituteRepository instituteRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final SemesterResultRepository semesterResultRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        long totalStudents = studentRepository.count();
        long totalFaculty = teacherRepository.count();
        long activeInstitutes = instituteRepository.count();
        long activePrograms = departmentRepository.count();
        long activeBatches = batchRepository.count();

        data.put("totalStudents", totalStudents);
        data.put("totalFaculty", totalFaculty);
        data.put("activeInstitutes", activeInstitutes);
        data.put("activePrograms", activePrograms);
        data.put("activeBatches", activeBatches);
        data.put("totalDepartments", activePrograms);
        data.put("recentLogs", Collections.emptyList());

        return data;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        List<UserDto> users = new ArrayList<>();

        studentRepository.findAll().forEach(s -> users.add(UserDto.builder()
                .id(s.getStudentId() != null ? s.getStudentId().toString() : s.getEnrollmentNo())
                .name(((s.getFirstName() != null ? s.getFirstName().trim() : "") + " " + (s.getLastName() != null ? s.getLastName().trim() : "")).trim())
                .email(s.getEmail())
                .role("Student")
                .department("Computer Applications")
                .status(Boolean.TRUE.equals(s.getIsActive()) ? "Active" : "Inactive")
                .identifier(s.getEnrollmentNo())
                .build()));

        teacherRepository.findAll().forEach(t -> users.add(UserDto.builder()
                .id(t.getTeacherId() != null ? t.getTeacherId().toString() : t.getEmail())
                .name(((t.getFirstName() != null ? t.getFirstName().trim() : "") + " " + (t.getLastName() != null ? t.getLastName().trim() : "")).trim())
                .email(t.getEmail())
                .role("Teacher")
                .department(t.getDesignation() != null ? t.getDesignation() : "Computer Science")
                .status(Boolean.TRUE.equals(t.getIsActive()) ? "Active" : "Inactive")
                .identifier(t.getEmail())
                .build()));

        adminRepository.findAll().forEach(a -> users.add(UserDto.builder()
                .id(a.getAdminId() != null ? a.getAdminId().toString() : a.getEmail())
                .name(((a.getFirstName() != null ? a.getFirstName().trim() : "") + " " + (a.getLastName() != null ? a.getLastName().trim() : "")).trim())
                .email(a.getEmail())
                .role("Admin")
                .department("Administration")
                .status(Boolean.TRUE.equals(a.getIsActive()) ? "Active" : "Inactive")
                .identifier(a.getEmail())
                .build()));

        return users;
    }

    @Transactional
    public UserDto createUser(UserDto dto) {
        if ("Student".equalsIgnoreCase(dto.getRole())) {
            String enrollmentNo = dto.getIdentifier() != null && !dto.getIdentifier().trim().isEmpty()
                    ? dto.getIdentifier().trim()
                    : "25CI" + (System.currentTimeMillis() % 100000);
            String[] nameParts = dto.getName() != null ? dto.getName().trim().split(" ") : new String[]{"Student"};
            Student s = Student.builder()
                    .enrollmentNo(enrollmentNo)
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "")
                    .email(dto.getEmail() != null ? dto.getEmail().trim() : enrollmentNo.toLowerCase() + "@educonnect.ac.in")
                    .mobile("+91 9876543210")
                    .gender("Male")
                    .dateOfBirth(LocalDate.of(2002, 1, 1))
                    .address("Institutional Campus")
                    .isActive(true)
                    .build();
            Student saved = studentRepository.save(s);
            dto.setId(saved.getStudentId() != null ? saved.getStudentId().toString() : enrollmentNo);
        } else {
            String[] nameParts = dto.getName() != null ? dto.getName().trim().split(" ") : new String[]{"Faculty"};
            Teacher t = Teacher.builder()
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "")
                    .email(dto.getEmail() != null ? dto.getEmail().trim() : "faculty" + (System.currentTimeMillis() % 1000) + "@educonnect.ac.in")
                    .password(passwordEncoder.encode("teacher123"))
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

    @Transactional
    public UserDto updateUser(String id, UserDto dto) {
        if (id == null || id.trim().isEmpty()) return dto;
        String cleanId = id.trim();

        // Check if Student by enrollment or UUID
        Optional<Student> sOpt = studentRepository.findByEnrollmentNo(cleanId);
        if (sOpt.isEmpty()) {
            try { sOpt = studentRepository.findById(UUID.fromString(cleanId)); } catch (Exception ignored) {}
        }
        if (sOpt.isPresent()) {
            Student s = sOpt.get();
            if (dto.getName() != null) {
                String[] parts = dto.getName().trim().split(" ");
                s.setFirstName(parts[0]);
                s.setLastName(parts.length > 1 ? parts[1] : "");
            }
            if (dto.getEmail() != null) s.setEmail(dto.getEmail());
            if (dto.getStatus() != null) s.setIsActive("Active".equalsIgnoreCase(dto.getStatus()));
            studentRepository.save(s);
            return dto;
        }

        // Check if Teacher by email or UUID
        Optional<Teacher> tOpt = teacherRepository.findByEmail(cleanId);
        if (tOpt.isEmpty()) {
            try { tOpt = teacherRepository.findById(UUID.fromString(cleanId)); } catch (Exception ignored) {}
        }
        if (tOpt.isPresent()) {
            Teacher t = tOpt.get();
            if (dto.getName() != null) {
                String[] parts = dto.getName().trim().split(" ");
                t.setFirstName(parts[0]);
                t.setLastName(parts.length > 1 ? parts[1] : "");
            }
            if (dto.getEmail() != null) t.setEmail(dto.getEmail());
            if (dto.getStatus() != null) t.setIsActive("Active".equalsIgnoreCase(dto.getStatus()));
            teacherRepository.save(t);
            return dto;
        }

        return dto;
    }

    @Transactional
    public void deleteUser(String id) {
        if (id == null || id.trim().isEmpty()) return;
        String cleanId = id.trim();

        Optional<Student> sOpt = studentRepository.findByEnrollmentNo(cleanId);
        if (sOpt.isEmpty()) {
            try { sOpt = studentRepository.findById(UUID.fromString(cleanId)); } catch (Exception ignored) {}
        }
        if (sOpt.isPresent()) {
            studentRepository.delete(sOpt.get());
            return;
        }

        Optional<Teacher> tOpt = teacherRepository.findByEmail(cleanId);
        if (tOpt.isEmpty()) {
            try { tOpt = teacherRepository.findById(UUID.fromString(cleanId)); } catch (Exception ignored) {}
        }
        if (tOpt.isPresent()) {
            teacherRepository.delete(tOpt.get());
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourses() {
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Course c : courses) {
            Map<String, Object> map = new HashMap<>();
            map.put("course_id", c.getCourseId() != null ? c.getCourseId().toString() : "");
            map.put("code", c.getCode() != null ? c.getCode() : "");
            map.put("name", c.getName() != null ? c.getName() : "");
            map.put("credits", c.getCredits() != null ? c.getCredits() : 4);
            map.put("type", c.getType() != null ? c.getType() : "Theory");
            map.put("semester", c.getSemester() != null ? c.getSemester() : 1);
            map.put("is_active", c.getIsActive() != null ? c.getIsActive() : true);
            list.add(map);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> createCourse(Map<String, Object> courseData) {
        String code = (String) courseData.getOrDefault("code", "MCA" + (System.currentTimeMillis() % 1000));
        String name = (String) courseData.getOrDefault("name", "New Course");
        int credits = 4;
        if (courseData.get("credits") instanceof Number) credits = ((Number) courseData.get("credits")).intValue();

        int semester = 1;
        if (courseData.get("semester") instanceof Number) semester = ((Number) courseData.get("semester")).intValue();

        String type = courseData.get("type") != null ? (String) courseData.get("type") : "Theory";

        Course course = Course.builder()
                .code(code)
                .name(name)
                .credits(credits)
                .semester(semester)
                .type(type)
                .isActive(true)
                .build();

        Course saved = courseRepository.save(course);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Course module created and persisted to database");
        res.put("course_id", saved.getCourseId().toString());
        res.put("code", saved.getCode());
        res.put("name", saved.getName());
        res.put("credits", saved.getCredits());
        res.put("type", saved.getType());
        res.put("semester", saved.getSemester());
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminProfile(String email) {
        Optional<Admin> adminOpt = Optional.empty();
        if (email != null && !email.trim().isEmpty()) {
            adminOpt = adminRepository.findByEmail(email.trim().toLowerCase());
        }
        if (adminOpt.isEmpty()) {
            List<Admin> all = adminRepository.findAll();
            if (!all.isEmpty()) adminOpt = Optional.of(all.get(0));
        }

        if (adminOpt.isPresent()) {
            Admin a = adminOpt.get();
            Map<String, Object> map = new HashMap<>();
            map.put("admin_id", a.getAdminId() != null ? a.getAdminId().toString() : "");
            map.put("first_name", a.getFirstName() != null ? a.getFirstName() : "");
            map.put("last_name", a.getLastName() != null ? a.getLastName() : "");
            map.put("email", a.getEmail() != null ? a.getEmail() : "");
            map.put("mobile", a.getMobile() != null ? a.getMobile() : "");
            map.put("gender", a.getGender() != null ? a.getGender() : "Male");
            map.put("date_of_birth", a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : "1985-05-15");
            map.put("address", a.getAddress() != null ? a.getAddress() : "");
            map.put("profile_photo", a.getProfilePhoto() != null ? a.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
            return map;
        }

        return Collections.emptyMap();
    }

    @Transactional
    public Map<String, Object> updateAdminProfile(String authenticatedEmail, Map<String, Object> reqData) {
        String email = authenticatedEmail != null ? authenticatedEmail : (String) reqData.get("email");
        Optional<Admin> adminOpt = Optional.empty();
        if (email != null && !email.trim().isEmpty()) {
            adminOpt = adminRepository.findByEmail(email.trim().toLowerCase());
        }
        if (adminOpt.isEmpty()) {
            List<Admin> all = adminRepository.findAll();
            if (!all.isEmpty()) adminOpt = Optional.of(all.get(0));
        }

        if (adminOpt.isPresent()) {
            Admin a = adminOpt.get();
            if (reqData.containsKey("first_name")) a.setFirstName((String) reqData.get("first_name"));
            if (reqData.containsKey("last_name")) a.setLastName((String) reqData.get("last_name"));
            if (reqData.containsKey("mobile")) a.setMobile((String) reqData.get("mobile"));
            if (reqData.containsKey("address")) a.setAddress((String) reqData.get("address"));
            if (reqData.containsKey("gender")) a.setGender((String) reqData.get("gender"));
            if (reqData.containsKey("profile_photo")) a.setProfilePhoto((String) reqData.get("profile_photo"));
            adminRepository.save(a);
            return getAdminProfile(a.getEmail());
        }

        return Collections.emptyMap();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReports() {
        Map<String, Object> reports = new HashMap<>();

        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> semesterResults = new ArrayList<>();
        for (Student s : students) {
            Map<String, Object> res = new HashMap<>();
            res.put("semester_result_id", "res-" + (s.getStudentId() != null ? s.getStudentId().toString() : UUID.randomUUID().toString()));
            res.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            res.put("student_name", (s.getFirstName() + " " + s.getLastName()).trim());
            res.put("enrollment_no", s.getEnrollmentNo());
            res.put("semester_id", s.getSemesterId() != null ? s.getSemesterId().toString() : "sem-001");
            res.put("semester_number", 1);
            res.put("semester_name", "Semester 1");
            res.put("sgpa", 8.4);
            res.put("cgpa", 8.2);
            res.put("total_credits", 24);
            res.put("result_status", "Pass");
            semesterResults.add(res);
        }

        List<WeeklyTest> tests = weeklyTestRepository.findAll();
        List<Map<String, Object>> weeklyExams = new ArrayList<>();
        for (WeeklyTest wt : tests) {
            Map<String, Object> map = new HashMap<>();
            map.put("weekly_exam_id", wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "");
            map.put("title", wt.getTitle() != null ? wt.getTitle() : "");
            map.put("exam_date", wt.getTestDate() != null ? wt.getTestDate().toString() : "");
            map.put("total_marks", wt.getTotalMarks() != null ? wt.getTotalMarks() : 25);
            weeklyExams.add(map);
        }

        List<WeeklyTestResult> testResults = weeklyTestResultRepository.findAll();
        List<Map<String, Object>> weeklyExamResults = new ArrayList<>();
        for (WeeklyTestResult r : testResults) {
            Map<String, Object> map = new HashMap<>();
            map.put("weekly_exam_result_id", r.getWeeklyTestResultId() != null ? r.getWeeklyTestResultId().toString() : "");
            map.put("weekly_exam_id", r.getWeeklyTestId() != null ? r.getWeeklyTestId().toString() : "");
            map.put("student_id", r.getStudentId() != null ? r.getStudentId().toString() : "");
            map.put("obtained_marks", r.getObtainedMarks());
            map.put("grade", r.getGrade());
            map.put("remarks", r.getRemarks());
            weeklyExamResults.add(map);
        }

        reports.put("semesterResults", semesterResults);
        reports.put("semesterResultDetails", Collections.emptyList());
        reports.put("weeklyExams", weeklyExams);
        reports.put("weeklyExamResults", weeklyExamResults);

        return reports;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        List<SystemSetting> list = systemSettingRepository.findAll();
        Map<String, Object> settings = new HashMap<>();
        for (SystemSetting s : list) {
            settings.put(s.getSettingKey(), s.getSettingValue());
        }
        if (!settings.containsKey("otp_auth")) settings.put("otp_auth", "Active");
        if (!settings.containsKey("auto_sync")) settings.put("auto_sync", "Enabled");
        if (!settings.containsKey("system_name")) settings.put("system_name", "EduConnect Educational Management System");
        return settings;
    }

    @Transactional
    public Map<String, Object> updateSettings(Map<String, Object> reqData) {
        if (reqData != null) {
            reqData.forEach((k, v) -> {
                if (v != null) {
                    SystemSetting s = SystemSetting.builder()
                            .settingKey(k)
                            .settingValue(v.toString())
                            .description("System configuration setting")
                            .build();
                    systemSettingRepository.save(s);
                }
            });
        }
        return getSettings();
    }
}
