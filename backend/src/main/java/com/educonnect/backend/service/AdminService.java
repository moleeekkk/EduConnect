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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final CourseRepository courseRepository;
    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final WeeklyTestRepository weeklyTestRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
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

        Map<UUID, Student> studentMap = studentRepository.findAll().stream()
                .collect(Collectors.toMap(Student::getStudentId, s -> s, (s1, s2) -> s1));

        Map<UUID, Department> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, d -> d, (d1, d2) -> d1));

        Map<UUID, Semester> semMap = semesterRepository.findAll().stream()
                .collect(Collectors.toMap(Semester::getSemesterId, s -> s, (s1, s2) -> s1));

        // 1. Real Semester Results from DB
        List<SemesterResult> dbResults = semesterResultRepository.findAll();
        List<Map<String, Object>> semesterResults = new ArrayList<>();
        for (SemesterResult r : dbResults) {
            Student s = studentMap.get(r.getStudentId());
            if (s == null) continue;
            Department d = deptMap.get(r.getDepartmentId());
            Semester sem = semMap.get(r.getSemesterId());

            Map<String, Object> res = new HashMap<>();
            res.put("semester_result_id", r.getResultId() != null ? r.getResultId().toString() : "");
            res.put("id", r.getResultId() != null ? r.getResultId().toString() : "");
            res.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            res.put("student_name", ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim());
            res.put("enrollment_no", s.getEnrollmentNo());
            res.put("department_id", d != null && d.getDepartmentId() != null ? d.getDepartmentId().toString() : "");
            res.put("department_name", d != null ? d.getDepartmentName() : "Department");
            res.put("semester_id", sem != null && sem.getSemesterId() != null ? sem.getSemesterId().toString() : "");
            res.put("semester_number", sem != null ? sem.getSemesterNumber() : 1);
            res.put("semester_name", sem != null ? sem.getSemesterName() : "Semester 1");
            res.put("sgpa", r.getSgpa() != null ? r.getSgpa().doubleValue() : 0.0);
            res.put("cgpa", r.getCgpa() != null ? r.getCgpa().doubleValue() : 0.0);
            res.put("total_credits", r.getTotalCredits() != null ? r.getTotalCredits() : 0);
            res.put("earned_credits", r.getEarnedCredits() != null ? r.getEarnedCredits() : 0);
            res.put("total_marks", r.getTotalMarks() != null ? r.getTotalMarks().doubleValue() : 0.0);
            res.put("obtained_marks", r.getObtainedMarks() != null ? r.getObtainedMarks().doubleValue() : 0.0);
            res.put("percentage", r.getPercentage() != null ? r.getPercentage().doubleValue() : 0.0);
            res.put("result_status", r.getResultStatus() != null ? r.getResultStatus() : "PASS");
            res.put("is_published", Boolean.TRUE.equals(r.getIsPublished()));
            semesterResults.add(res);
        }

        // 2. Real Weekly Exams
        List<WeeklyTest> tests = weeklyTestRepository.findAll();
        List<Map<String, Object>> weeklyExams = new ArrayList<>();
        for (WeeklyTest wt : tests) {
            Map<String, Object> map = new HashMap<>();
            map.put("weekly_exam_id", wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "");
            map.put("id", wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "");
            map.put("title", wt.getTitle() != null ? wt.getTitle() : "");
            map.put("exam_date", wt.getTestDate() != null ? wt.getTestDate().toString() : "");
            map.put("test_date", wt.getTestDate() != null ? wt.getTestDate().toString() : "");
            map.put("total_marks", wt.getTotalMarks() != null ? wt.getTotalMarks() : 25);
            map.put("is_published", Boolean.TRUE.equals(wt.getIsPublished()));
            weeklyExams.add(map);
        }

        // 3. Real Weekly Exam Results
        List<WeeklyTestResult> testResults = weeklyTestResultRepository.findAll();
        List<Map<String, Object>> weeklyExamResults = new ArrayList<>();
        for (WeeklyTestResult r : testResults) {
            Student s = studentMap.get(r.getStudentId());
            Map<String, Object> map = new HashMap<>();
            map.put("weekly_exam_result_id", r.getWeeklyTestResultId() != null ? r.getWeeklyTestResultId().toString() : "");
            map.put("id", r.getWeeklyTestResultId() != null ? r.getWeeklyTestResultId().toString() : "");
            map.put("weekly_exam_id", r.getWeeklyTestId() != null ? r.getWeeklyTestId().toString() : "");
            map.put("weekly_test_id", r.getWeeklyTestId() != null ? r.getWeeklyTestId().toString() : "");
            map.put("student_id", r.getStudentId() != null ? r.getStudentId().toString() : "");
            if (s != null) {
                map.put("student_name", ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim());
                map.put("enrollment_no", s.getEnrollmentNo());
            }
            map.put("obtained_marks", r.getObtainedMarks());
            map.put("grade", r.getGrade());
            map.put("remarks", r.getRemarks());
            weeklyExamResults.add(map);
        }

        // 4. Attendance Summary per Student (single batch aggregate query)
        List<Student> students = studentRepository.findAll();
        List<AttendanceRecord> allRecords = attendanceRecordRepository.findAll();
        Map<UUID, List<AttendanceRecord>> recordsByStudent = allRecords.stream()
                .filter(r -> r.getStudentId() != null)
                .collect(Collectors.groupingBy(AttendanceRecord::getStudentId));

        List<Map<String, Object>> attendanceSummary = new ArrayList<>();
        for (Student s : students) {
            List<AttendanceRecord> recs = recordsByStudent.getOrDefault(s.getStudentId(), Collections.emptyList());
            int totalSessions = recs.size();
            int attendedSessions = (int) recs.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            int absentSessions = totalSessions - attendedSessions;
            double percentage = totalSessions > 0 ? Math.round((double) attendedSessions / totalSessions * 1000.0) / 10.0 : 0.0;
            String status = totalSessions == 0 ? "No Data" : (percentage >= 85.0 ? "Good" : (percentage >= 75.0 ? "Average" : "At-Risk"));

            Department d = s.getDepartmentId() != null ? deptMap.get(s.getDepartmentId()) : null;
            Semester sem = s.getSemesterId() != null ? semMap.get(s.getSemesterId()) : null;

            Map<String, Object> attMap = new HashMap<>();
            attMap.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            attMap.put("id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim();
            attMap.put("student_name", fullName.isEmpty() ? "Student" : fullName);
            attMap.put("name", fullName.isEmpty() ? "Student" : fullName);
            attMap.put("enrollment_no", s.getEnrollmentNo());
            attMap.put("enrollmentNo", s.getEnrollmentNo());
            attMap.put("department_id", s.getDepartmentId() != null ? s.getDepartmentId().toString() : "");
            attMap.put("department_name", d != null ? d.getDepartmentName() : "");
            attMap.put("semester_id", s.getSemesterId() != null ? s.getSemesterId().toString() : "");
            attMap.put("semester_number", sem != null ? sem.getSemesterNumber() : 1);
            attMap.put("semester_name", sem != null ? sem.getSemesterName() : "");
            attMap.put("batch_id", s.getBatchId() != null ? s.getBatchId().toString() : "");
            attMap.put("totalSessions", totalSessions);
            attMap.put("attendedSessions", attendedSessions);
            attMap.put("absentSessions", absentSessions);
            attMap.put("percentage", percentage);
            attMap.put("status", status);

            attendanceSummary.add(attMap);
        }

        reports.put("attendanceSummary", attendanceSummary);
        reports.put("semesterResults", semesterResults);
        reports.put("semesterResultDetails", Collections.emptyList());
        reports.put("weeklyExams", weeklyExams);
        reports.put("weeklyExamResults", weeklyExamResults);

        return reports;
    }

    private static final Set<String> ALLOWED_SETTINGS_KEYS = Set.of(
            "system_name",
            "otp_auth",
            "auto_sync",
            "pass_mark_threshold",
            "max_file_upload_mb",
            "academic_term_year"
    );

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        List<SystemSetting> list = systemSettingRepository.findAll();
        Map<String, Object> settings = new HashMap<>();
        for (SystemSetting s : list) {
            String key = s.getSettingKey();
            if (key == null) continue;
            String lowerKey = key.toLowerCase();
            // Security: Keep SMTP/DB/JWT secrets out of generic settings read responses
            if (lowerKey.contains("password") || lowerKey.contains("secret") || lowerKey.contains("token") || lowerKey.contains("smtp")) {
                continue;
            }
            settings.put(key, s.getSettingValue());
        }

        if (!settings.containsKey("system_name")) settings.put("system_name", "EduConnect Educational Management System");
        if (!settings.containsKey("otp_auth")) settings.put("otp_auth", "Active");
        if (!settings.containsKey("auto_sync")) settings.put("auto_sync", "Enabled");
        if (!settings.containsKey("pass_mark_threshold")) settings.put("pass_mark_threshold", "40");
        if (!settings.containsKey("max_file_upload_mb")) settings.put("max_file_upload_mb", "10");
        if (!settings.containsKey("academic_term_year")) settings.put("academic_term_year", "2026-2027");

        return settings;
    }

    @Transactional
    public Map<String, Object> updateSettings(Map<String, Object> reqData) {
        if (reqData != null) {
            reqData.forEach((k, v) -> {
                if (k != null && v != null && ALLOWED_SETTINGS_KEYS.contains(k.trim().toLowerCase())) {
                    String cleanKey = k.trim().toLowerCase();
                    String cleanVal = v.toString().trim();
                    SystemSetting s = SystemSetting.builder()
                            .settingKey(cleanKey)
                            .settingValue(cleanVal)
                            .description("System configuration setting: " + cleanKey)
                            .build();
                    systemSettingRepository.save(s);
                }
            });
        }
        return getSettings();
    }
}
