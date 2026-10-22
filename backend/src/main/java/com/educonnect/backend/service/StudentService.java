package com.educonnect.backend.service;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.BatchRepository;
import com.educonnect.backend.repository.DepartmentRepository;
import com.educonnect.backend.repository.InstituteRepository;
import com.educonnect.backend.repository.SemesterRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import com.educonnect.backend.entity.WeeklyTest;
import com.educonnect.backend.entity.WeeklyTestResult;
import com.educonnect.backend.repository.WeeklyTestRepository;
import com.educonnect.backend.repository.WeeklyTestResultRepository;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final WeeklyTestRepository weeklyTestRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
    private final com.educonnect.backend.repository.LeaveRequestRepository leaveRequestRepository;
    private final com.educonnect.backend.repository.StudentDoubtRepository studentDoubtRepository;
    private final com.educonnect.backend.repository.StudyMaterialRepository studyMaterialRepository;
    private final com.educonnect.backend.repository.QuizRepository quizRepository;
    private final com.educonnect.backend.repository.AttendanceSessionRepository attendanceSessionRepository;
    private final com.educonnect.backend.repository.TeacherSubjectRepository teacherSubjectRepository;
    private final TeacherService teacherService;

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
        } else {
            student.setEnrollmentNo(student.getEnrollmentNo().trim().toUpperCase());
        }
        if (studentRepository.existsByEnrollmentNo(student.getEnrollmentNo())) {
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

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboard(String studentIdOrEnrollment) {
        Map<String, Object> data = new HashMap<>();

        // Resolve student
        Optional<Student> studentOpt = Optional.empty();
        if (studentIdOrEnrollment != null && !studentIdOrEnrollment.trim().isEmpty()) {
            String clean = studentIdOrEnrollment.trim();
            try {
                studentOpt = studentRepository.findById(UUID.fromString(clean));
            } catch (Exception ignored) {}
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNo(clean);
            }
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
        }
        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) studentOpt = Optional.of(all.get(0));
        }

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            data.put("studentId", s.getStudentId() != null ? s.getStudentId().toString() : "");
            data.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            data.put("studentName", s.getFirstName() + (s.getLastName() != null ? " " + s.getLastName() : ""));
            data.put("firstName", s.getFirstName());
            data.put("first_name", s.getFirstName());
            data.put("lastName", s.getLastName() != null ? s.getLastName() : "");
            data.put("last_name", s.getLastName() != null ? s.getLastName() : "");
            data.put("enrollmentNo", s.getEnrollmentNo());
            data.put("enrollment_no", s.getEnrollmentNo());
            data.put("email", s.getEmail());

            if (s.getDepartmentId() != null) {
                departmentRepository.findById(s.getDepartmentId()).ifPresent(d -> {
                    data.put("program", d.getDepartmentName());
                    data.put("departmentName", d.getDepartmentName());
                });
            }
            if (s.getSemesterId() != null) {
                semesterRepository.findById(s.getSemesterId()).ifPresent(sem -> {
                    data.put("semester", sem.getSemesterName());
                    data.put("semesterName", sem.getSemesterName());
                });
            }
            if (s.getBatchId() != null) {
                batchRepository.findById(s.getBatchId()).ifPresent(b -> {
                    data.put("batchName", b.getBatchName());
                });
            }
        } else {
            data.put("studentName", "Student");
            data.put("firstName", "Student");
            data.put("lastName", "");
            data.put("enrollmentNo", studentIdOrEnrollment != null ? studentIdOrEnrollment : "");
        }

        if (data.get("program") == null) data.put("program", "Department of Computer Applications");
        if (data.get("semester") == null) data.put("semester", "Semester 3");

        // 1. Attendance Metrics
        List<Map<String, Object>> attendanceList = getStudentAttendance(studentIdOrEnrollment);
        int totalSessions = attendanceList.size();
        int attendedSessions = 0;
        for (Map<String, Object> att : attendanceList) {
            Object status = att.get("status");
            if (status == null) status = att.get("attendance_status");
            if (status != null && ("Present".equalsIgnoreCase(status.toString()) || "Late".equalsIgnoreCase(status.toString()))) {
                attendedSessions++;
            }
        }
        double attPercentage = totalSessions > 0 ? Math.round((attendedSessions * 100.0 / totalSessions) * 10.0) / 10.0 : 100.0;
        String attendancePctStr = attPercentage + "%";
        String attendanceStatus = attPercentage >= 85.0 ? "Good" : attPercentage >= 75.0 ? "Average" : "At-Risk";

        data.put("overallAttendance", attendancePctStr);
        data.put("attendancePct", attendancePctStr);
        data.put("attendanceStatus", attendanceStatus);
        data.put("totalSessions", totalSessions);
        data.put("attendedSessions", attendedSessions);

        // 2. Enrolled Subjects Metrics
        List<Map<String, Object>> subjects = getSubjectsForStudent(studentIdOrEnrollment);
        int subjectsCount = subjects.size() > 0 ? subjects.size() : (int) subjectRepository.count();
        data.put("enrolledCoursesCount", subjectsCount);
        data.put("subjectsCount", subjectsCount);
        data.put("totalCredits", subjectsCount * 4);
        data.put("subjects", subjects);

        // 3. Pending Assignments Metrics
        List<Map<String, Object>> assignments = getStudentAssignments(studentIdOrEnrollment);
        int pendingCount = 0;
        for (Map<String, Object> asgn : assignments) {
            if (!Boolean.TRUE.equals(asgn.get("submitted"))) {
                pendingCount++;
            }
        }
        data.put("pendingTasksCount", pendingCount);
        data.put("pendingAssignmentsCount", pendingCount);
        data.put("assignments", assignments);

        // 4. Academic Sessions
        List<Map<String, Object>> displaySessions = attendanceList.stream().limit(5).collect(Collectors.toList());
        data.put("sessions", displaySessions);
        data.put("todayClasses", displaySessions);

        // 5. Announcements / Notices
        List<Map<String, Object>> studyMaterials = getStudyMaterials(studentIdOrEnrollment);
        List<Map<String, Object>> notices = new ArrayList<>();
        for (int i = 0; i < Math.min(4, studyMaterials.size()); i++) {
            Map<String, Object> sm = studyMaterials.get(i);
            Map<String, Object> notice = new HashMap<>();
            notice.put("id", sm.get("material_id"));
            notice.put("title", sm.get("title") != null ? sm.get("title") : "Study Material");
            notice.put("description", sm.get("description") != null && !sm.get("description").toString().isEmpty() ? sm.get("description") : "New study material published for course");
            notice.put("target_role", "STUDENTS");
            notice.put("date", sm.get("created_at") != null ? sm.get("created_at").toString().split("T")[0] : LocalDate.now().toString());
            notices.add(notice);
        }
        if (notices.isEmpty()) {
            Map<String, Object> n1 = new HashMap<>();
            n1.put("id", "n-1");
            n1.put("title", "Semester Academic & Examination Schedule");
            n1.put("description", "Regular classes and weekly evaluations ongoing. Please review attendance & marksheet portal.");
            n1.put("target_role", "ALL STUDENTS");
            n1.put("date", LocalDate.now().toString());
            notices.add(n1);
        }
        data.put("announcements", notices);
        data.put("cgpa", "8.89 / 10.0");

        return data;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttendance(String studentIdOrEnrollment) {
        Optional<Student> studentOpt = Optional.empty();
        if (studentIdOrEnrollment != null && !studentIdOrEnrollment.trim().isEmpty()) {
            String clean = studentIdOrEnrollment.trim();
            try {
                studentOpt = studentRepository.findById(UUID.fromString(clean));
            } catch (Exception ignored) {}
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNo(clean);
            }
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
        }
        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) studentOpt = Optional.of(all.get(0));
        }

        UUID studentId = studentOpt.map(Student::getStudentId).orElse(null);

        // Map of sessionId -> AttendanceRecord for this student
        Map<UUID, com.educonnect.backend.entity.AttendanceRecord> studentRecordBySession = new HashMap<>();
        if (studentId != null) {
            List<com.educonnect.backend.entity.AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
            for (com.educonnect.backend.entity.AttendanceRecord r : records) {
                if (r.getSessionId() != null) {
                    studentRecordBySession.put(r.getSessionId(), r);
                }
            }
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        Set<String> processedSessionIds = new HashSet<>();

        // Universal Subject Resolver with guaranteed fallback
        java.util.function.Function<UUID, Optional<Subject>> resolveSubject = (rawId) -> {
            if (rawId == null) return Optional.empty();
            Optional<Subject> direct = subjectRepository.findById(rawId);
            if (direct.isPresent()) return direct;
            Optional<TeacherSubject> tsOpt = teacherSubjectRepository.findById(rawId);
            if (tsOpt.isPresent() && tsOpt.get().getSubjectId() != null) {
                return subjectRepository.findById(tsOpt.get().getSubjectId());
            }
            List<Subject> allSubs = subjectRepository.findAll();
            for (Subject s : allSubs) {
                if (s.getSubjectId() != null && s.getSubjectId().equals(rawId)) {
                    return Optional.of(s);
                }
            }
            if (!allSubs.isEmpty()) {
                return Optional.of(allSubs.get(0));
            }
            return Optional.empty();
        };

        List<Map<String, Object>> studentSubs = getSubjectsForStudent(studentIdOrEnrollment);
        Set<String> studentSubKeys = new HashSet<>();
        for (Map<String, Object> subMap : studentSubs) {
            if (subMap.get("subject_id") != null) studentSubKeys.add(subMap.get("subject_id").toString().toLowerCase());
            if (subMap.get("subject_code") != null) studentSubKeys.add(subMap.get("subject_code").toString().toLowerCase());
            if (subMap.get("subject_name") != null) studentSubKeys.add(subMap.get("subject_name").toString().toLowerCase());
        }

        // 1. Process records explicitly stored in attendance_records for this studentId
        if (studentId != null) {
            List<com.educonnect.backend.entity.AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
            for (com.educonnect.backend.entity.AttendanceRecord rec : records) {
                if (rec.getSessionId() == null) continue;
                String sessIdStr = rec.getSessionId().toString();

                Map<String, Object> map = new HashMap<>();
                map.put("attendance_id", rec.getAttendanceId() != null ? rec.getAttendanceId().toString() : "");
                map.put("student_id", rec.getStudentId() != null ? rec.getStudentId().toString() : "");
                map.put("session_id", sessIdStr);
                map.put("attendance_session_id", sessIdStr);
                map.put("attendance_status", rec.getAttendanceStatus() != null ? rec.getAttendanceStatus() : "Present");
                map.put("status", rec.getAttendanceStatus() != null ? rec.getAttendanceStatus() : "Present");

                attendanceSessionRepository.findById(rec.getSessionId()).ifPresent(sess -> {
                    map.put("session_date", sess.getSessionDate() != null ? sess.getSessionDate().toString() : "");
                    map.put("date", sess.getSessionDate() != null ? sess.getSessionDate().toString() : "");
                    map.put("start_time", sess.getStartTime() != null ? sess.getStartTime().toString() : "");
                    map.put("end_time", sess.getEndTime() != null ? sess.getEndTime().toString() : "");

                    if (sess.getSubjectId() != null) {
                        resolveSubject.apply(sess.getSubjectId()).ifPresent(sub -> {
                            map.put("subject_id", sub.getSubjectId() != null ? sub.getSubjectId().toString() : "");
                            map.put("subject_name", sub.getSubjectName());
                            map.put("subject_code", sub.getSubjectCode());
                        });
                    }
                });

                if (map.get("subject_name") == null && !studentSubs.isEmpty()) {
                    map.put("subject_id", studentSubs.get(0).get("subject_id"));
                    map.put("subject_name", studentSubs.get(0).get("subject_name"));
                    map.put("subject_code", studentSubs.get(0).get("subject_code"));
                }

                processedSessionIds.add(sessIdStr);
                resultList.add(map);
            }
        }

        // 2. Process AttendanceSession entries where session belongs to student's enrolled subjects or records
        List<com.educonnect.backend.entity.AttendanceSession> allSessions = attendanceSessionRepository.findAll();
        for (com.educonnect.backend.entity.AttendanceSession sess : allSessions) {
            if (sess.getSessionId() == null) continue;
            String sessIdStr = sess.getSessionId().toString();
            if (processedSessionIds.contains(sessIdStr)) continue;

            boolean belongsToStudent = false;
            String status = "Present";
            String attId = "";

            if (studentRecordBySession.containsKey(sess.getSessionId())) {
                com.educonnect.backend.entity.AttendanceRecord r = studentRecordBySession.get(sess.getSessionId());
                status = r.getAttendanceStatus() != null && !r.getAttendanceStatus().trim().isEmpty() ? r.getAttendanceStatus().trim() : "Present";
                attId = r.getAttendanceId() != null ? r.getAttendanceId().toString() : "";
                belongsToStudent = true;
            } else {
                List<com.educonnect.backend.entity.AttendanceRecord> recs = attendanceRecordRepository.findBySessionId(sess.getSessionId());
                if (!recs.isEmpty()) {
                    for (com.educonnect.backend.entity.AttendanceRecord r : recs) {
                        if (studentId != null && r.getStudentId() != null && (studentId.equals(r.getStudentId()) || studentId.toString().equalsIgnoreCase(r.getStudentId().toString()))) {
                            status = r.getAttendanceStatus() != null && !r.getAttendanceStatus().trim().isEmpty()
                                    ? r.getAttendanceStatus().trim()
                                    : "Present";
                            attId = r.getAttendanceId() != null ? r.getAttendanceId().toString() : "";
                            belongsToStudent = true;
                            break;
                        }
                    }
                }
            }

            Optional<Subject> subOpt = resolveSubject.apply(sess.getSubjectId());
            String subIdStr = "";
            String subNameStr = "";
            String subCodeStr = "";

            if (subOpt.isPresent()) {
                Subject sub = subOpt.get();
                subIdStr = sub.getSubjectId() != null ? sub.getSubjectId().toString() : "";
                subNameStr = sub.getSubjectName() != null ? sub.getSubjectName() : "";
                subCodeStr = sub.getSubjectCode() != null ? sub.getSubjectCode() : "";

                if (!belongsToStudent && !studentSubKeys.isEmpty()) {
                    if (studentSubKeys.contains(subIdStr.toLowerCase()) ||
                        studentSubKeys.contains(subCodeStr.toLowerCase()) ||
                        studentSubKeys.contains(subNameStr.toLowerCase())) {
                        belongsToStudent = true;
                    }
                }
            } else if (!studentSubs.isEmpty()) {
                subIdStr = String.valueOf(studentSubs.get(0).get("subject_id"));
                subNameStr = String.valueOf(studentSubs.get(0).get("subject_name"));
                subCodeStr = String.valueOf(studentSubs.get(0).get("subject_code"));
                belongsToStudent = true;
            }

            if (!belongsToStudent && studentSubs.isEmpty()) {
                belongsToStudent = true;
            }

            if (!belongsToStudent) {
                continue;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("attendance_id", attId.isEmpty() ? UUID.randomUUID().toString() : attId);
            map.put("student_id", studentId != null ? studentId.toString() : "");
            map.put("session_id", sessIdStr);
            map.put("attendance_session_id", sessIdStr);
            map.put("attendance_status", status);
            map.put("status", status);
            map.put("session_date", sess.getSessionDate() != null ? sess.getSessionDate().toString() : "");
            map.put("date", sess.getSessionDate() != null ? sess.getSessionDate().toString() : "");
            map.put("start_time", sess.getStartTime() != null ? sess.getStartTime().toString() : "");
            map.put("end_time", sess.getEndTime() != null ? sess.getEndTime().toString() : "");
            map.put("subject_id", subIdStr);
            map.put("subject_name", subNameStr);
            map.put("subject_code", subCodeStr);

            processedSessionIds.add(sessIdStr);
            resultList.add(map);
        }

        return resultList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        Optional<Student> studentOpt = Optional.empty();
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            String clean = enrollmentNo.trim();
            try {
                studentOpt = studentRepository.findById(UUID.fromString(clean));
            } catch (Exception ignored) {}

            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNo(clean);
            }

            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
        }

        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Student currentStudent = studentOpt.get();
        UUID studentId = currentStudent.getStudentId();
        String studentEnrollment = currentStudent.getEnrollmentNo();

        // 1. Retrieve all subject IDs belonging to the student's current semester
        List<Map<String, Object>> currentSemesterSubjects = getSubjectsForStudent(studentEnrollment != null ? studentEnrollment : enrollmentNo);
        Set<UUID> currentSemesterSubjectIds = new HashSet<>();
        for (Map<String, Object> subMap : currentSemesterSubjects) {
            Object sId = subMap.get("subject_id");
            if (sId != null && !sId.toString().trim().isEmpty() && !sId.toString().equalsIgnoreCase("null")) {
                try {
                    currentSemesterSubjectIds.add(UUID.fromString(sId.toString().trim()));
                } catch (Exception ignored) {}
            }
        }

        // 2. Also directly add subject IDs in DB that match the student's current semester (and batch/department if assigned)
        if (currentStudent.getSemesterId() != null) {
            List<Subject> allDbSubs = subjectRepository.findAll();
            for (Subject s : allDbSubs) {
                if (currentStudent.getSemesterId().equals(s.getSemesterId())) {
                    if (currentStudent.getDepartmentId() != null && s.getDepartmentId() != null && !currentStudent.getDepartmentId().equals(s.getDepartmentId())) {
                        continue;
                    }
                    if (currentStudent.getBatchId() != null && s.getBatchId() != null && !currentStudent.getBatchId().equals(s.getBatchId())) {
                        continue;
                    }
                    if (s.getSubjectId() != null) {
                        currentSemesterSubjectIds.add(s.getSubjectId());
                    }
                }
            }
        }

        List<Assignment> assignments = assignmentRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Assignment a : assignments) {
            // CONDITION: Assignment's subject_id MUST match one of the student's current semester subject IDs!
            if (a.getSubjectId() == null || !currentSemesterSubjectIds.contains(a.getSubjectId())) {
                continue; // Not visible to this student!
            }

            Map<String, Object> map = new HashMap<>();
            map.put("assignment_id", a.getAssignmentId() != null ? a.getAssignmentId().toString() : "");
            map.put("teacher_subject_id", a.getTeacherSubjectId() != null ? a.getTeacherSubjectId().toString() : "");
            map.put("subject_id", a.getSubjectId() != null ? a.getSubjectId().toString() : "");
            map.put("title", a.getTitle() != null ? a.getTitle() : "");
            map.put("description", a.getDescription() != null ? a.getDescription() : "");
            map.put("due_date", a.getDueDate() != null ? a.getDueDate().toString() : "");
            map.put("total_marks", a.getTotalMarks() != null ? a.getTotalMarks() : 50);
            map.put("attachment", a.getAttachment() != null ? a.getAttachment() : "");
            map.put("file_name", a.getFileName() != null ? a.getFileName() : "");
            map.put("created_at", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");

            subjectRepository.findById(a.getSubjectId()).ifPresent(sub -> {
                map.put("subject_code", sub.getSubjectCode());
                map.put("subject_name", sub.getSubjectName());
            });

            // Check if THIS specific student has already submitted this assignment
            List<AssignmentSubmission> subList = Collections.emptyList();
            if (a.getAssignmentId() != null && studentId != null) {
                subList = submissionRepository.findByAssignmentIdAndStudentId(a.getAssignmentId(), studentId);
            }

            if (!subList.isEmpty()) {
                AssignmentSubmission sub = subList.get(0);
                map.put("submitted", true);
                map.put("submission_id", sub.getSubmissionId().toString());
                map.put("submission_date", sub.getSubmissionDate() != null ? sub.getSubmissionDate().toString() : "");
                map.put("student_attachment", sub.getAttachment() != null ? sub.getAttachment() : "");
                map.put("student_file_name", sub.getFileName() != null ? sub.getFileName() : "");
                map.put("obtained_marks", sub.getObtainedMarks());
                map.put("feedback", sub.getFeedback() != null ? sub.getFeedback() : "");
                map.put("remarks", sub.getFeedback() != null ? sub.getFeedback() : "");
                
                String status = sub.getSubmissionStatus();
                if (status == null || "Submitted".equalsIgnoreCase(status) || "Graded".equalsIgnoreCase(status)) {
                    if (a.getDueDate() != null && sub.getSubmissionDate() != null && sub.getSubmissionDate().toLocalDate().isAfter(a.getDueDate())) {
                        status = "Late";
                    } else {
                        status = "Timely";
                    }
                }
                map.put("submission_status", status);
            } else {
                map.put("submitted", false);
                String unsubStatus = "Pending";
                if (a.getDueDate() != null && LocalDate.now().isAfter(a.getDueDate())) {
                    unsubStatus = "Missed";
                }
                map.put("submission_status", unsubStatus);
            }

            list.add(map);
        }
        return list;
    }

    @Transactional
    public AssignmentSubmission submitAssignment(UUID assignmentId, String enrollmentNo, Map<String, Object> reqData) {
        String finalEnrollmentNo = enrollmentNo;
        if (reqData != null) {
            if (reqData.get("enrollmentNo") != null) finalEnrollmentNo = (String) reqData.get("enrollmentNo");
            else if (reqData.get("enrollment_no") != null) finalEnrollmentNo = (String) reqData.get("enrollment_no");
        }
        if (finalEnrollmentNo == null || finalEnrollmentNo.trim().isEmpty()) {
            finalEnrollmentNo = "2024MCA001";
        }

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(finalEnrollmentNo.trim());
        UUID studentId;
        if (studentOpt.isPresent()) {
            studentId = studentOpt.get().getStudentId();
        } else {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) {
                studentId = all.get(0).getStudentId();
            } else {
                studentId = UUID.randomUUID();
            }
        }

        String attachmentVal = reqData != null && reqData.get("attachment") != null 
                ? (String) reqData.get("attachment") 
                : (reqData != null && reqData.get("fileName") != null ? (String) reqData.get("fileName") : "submission.pdf");

        String fileNameVal = reqData != null && reqData.get("fileName") != null ? (String) reqData.get("fileName") : null;
        if (fileNameVal != null && fileNameVal.startsWith("data:")) {
            fileNameVal = "submission.pdf";
        }
        String filePathVal = reqData != null && reqData.get("filePath") != null ? (String) reqData.get("filePath") : null;
        String fileTypeVal = reqData != null && reqData.get("fileType") != null ? (String) reqData.get("fileType") : null;

        Optional<Assignment> asgnOpt = assignmentRepository.findById(assignmentId);
        String calculatedStatus = "Timely";
        if (asgnOpt.isPresent() && asgnOpt.get().getDueDate() != null) {
            LocalDate dueDate = asgnOpt.get().getDueDate();
            LocalDate today = LocalDate.now();
            if (today.isAfter(dueDate)) {
                calculatedStatus = "Late";
            }
        }

        // UPSERT: Check if existing submission exists for this assignment + student
        List<AssignmentSubmission> existingList = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        AssignmentSubmission sub;
        if (!existingList.isEmpty()) {
            // Update / Replace existing submission
            sub = existingList.get(0);
            sub.setAttachment(attachmentVal);
            if (fileNameVal != null) sub.setFileName(fileNameVal);
            if (filePathVal != null) sub.setFilePath(filePathVal);
            if (fileTypeVal != null) sub.setFileType(fileTypeVal);
            sub.setSubmissionDate(java.time.LocalDateTime.now());
            sub.setSubmissionStatus(calculatedStatus);
            sub.setUpdatedAt(java.time.LocalDateTime.now());

            if (existingList.size() > 1) {
                submissionRepository.deleteAll(existingList.subList(1, existingList.size()));
            }
        } else {
            // Create new submission
            sub = new AssignmentSubmission();
            sub.setAssignmentId(assignmentId);
            sub.setStudentId(studentId);
            sub.setSubmissionDate(java.time.LocalDateTime.now());
            sub.setAttachment(attachmentVal);
            sub.setFileName(fileNameVal);
            sub.setFilePath(filePathVal);
            sub.setFileType(fileTypeVal);
            sub.setSubmissionStatus(calculatedStatus);
        }

        return submissionRepository.save(sub);
    }

    public Map<String, Object> getStudentResults(String enrollmentNo) {
        Map<String, Object> results = new HashMap<>();
        results.put("sgpa", 0.0);
        results.put("cgpa", 0.0);
        results.put("totalCredits", 0);
        results.put("subjects", Collections.emptyList());
        return results;
    }

    public Map<String, Object> mapStudentToProfileMap(Student s) {
        Map<String, Object> profile = new HashMap<>();
        if (s == null) return profile;

        profile.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
        profile.put("studentId", s.getStudentId() != null ? s.getStudentId().toString() : "");
        profile.put("enrollment_no", s.getEnrollmentNo() != null ? s.getEnrollmentNo() : "");
        profile.put("enrollmentNo", s.getEnrollmentNo() != null ? s.getEnrollmentNo() : "");
        profile.put("first_name", s.getFirstName() != null ? s.getFirstName() : "");
        profile.put("firstName", s.getFirstName() != null ? s.getFirstName() : "");
        profile.put("last_name", s.getLastName() != null ? s.getLastName() : "");
        profile.put("lastName", s.getLastName() != null ? s.getLastName() : "");
        profile.put("surname", s.getSurname() != null ? s.getSurname() : "");

        String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim();
        profile.put("name", fullName.isEmpty() ? "Student" : fullName);

        profile.put("email", s.getEmail() != null ? s.getEmail() : "");
        profile.put("mobile", s.getMobile() != null ? s.getMobile() : "");
        profile.put("gender", s.getGender() != null ? s.getGender() : "Male");
        profile.put("date_of_birth", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
        profile.put("dob", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
        profile.put("address", s.getAddress() != null ? s.getAddress() : "");
        profile.put("profile_photo", s.getProfilePhoto() != null ? s.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        profile.put("profilePhoto", s.getProfilePhoto() != null ? s.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        profile.put("blood_group", s.getBloodGroup() != null ? s.getBloodGroup() : "");
        profile.put("bloodGroup", s.getBloodGroup() != null ? s.getBloodGroup() : "");
        profile.put("parent_name", s.getParentName() != null ? s.getParentName() : "");
        profile.put("parentName", s.getParentName() != null ? s.getParentName() : "");
        profile.put("parent_mobile", s.getParentMobile() != null ? s.getParentMobile() : "");
        profile.put("parentMobile", s.getParentMobile() != null ? s.getParentMobile() : "");
        profile.put("parent_email", s.getParentEmail() != null ? s.getParentEmail() : "");
        profile.put("parentEmail", s.getParentEmail() != null ? s.getParentEmail() : "");
        profile.put("admission_date", s.getAdmissionDate() != null ? s.getAdmissionDate().toString() : "");
        profile.put("admissionDate", s.getAdmissionDate() != null ? s.getAdmissionDate().toString() : "");
        profile.put("is_active", s.getIsActive() != null ? s.getIsActive() : true);
        profile.put("isActive", s.getIsActive() != null ? s.getIsActive() : true);

        return profile;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentProfile(String enrollmentNo) {
        Optional<Student> studentOpt = Optional.empty();
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
        }
        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) {
                studentOpt = Optional.of(all.get(0));
            }
        }

        if (studentOpt.isPresent()) {
            return mapStudentToProfileMap(studentOpt.get());
        }
        return new HashMap<>();
    }

    @Transactional
    public Map<String, Object> updateStudentProfile(Map<String, Object> reqData) {
        String studentIdStr = reqData.get("student_id") != null ? reqData.get("student_id").toString()
                : (reqData.get("studentId") != null ? reqData.get("studentId").toString() : null);
        String enrollmentNo = reqData.get("enrollment_no") != null ? reqData.get("enrollment_no").toString()
                : (reqData.get("enrollmentNo") != null ? reqData.get("enrollmentNo").toString() : null);

        Optional<Student> studentOpt = Optional.empty();
        if (studentIdStr != null && !studentIdStr.trim().isEmpty()) {
            try {
                studentOpt = studentRepository.findById(UUID.fromString(studentIdStr.trim()));
            } catch (Exception ignored) {}
        }
        if (studentOpt.isEmpty() && enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
        }
        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) {
                studentOpt = Optional.of(all.get(0));
            }
        }

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            if (reqData.containsKey("first_name")) s.setFirstName((String) reqData.get("first_name"));
            else if (reqData.containsKey("firstName")) s.setFirstName((String) reqData.get("firstName"));

            if (reqData.containsKey("last_name")) s.setLastName((String) reqData.get("last_name"));
            else if (reqData.containsKey("lastName")) s.setLastName((String) reqData.get("lastName"));

            if (reqData.containsKey("email")) s.setEmail((String) reqData.get("email"));
            if (reqData.containsKey("mobile")) s.setMobile((String) reqData.get("mobile"));
            if (reqData.containsKey("gender")) s.setGender((String) reqData.get("gender"));

            String dobVal = reqData.get("date_of_birth") != null ? reqData.get("date_of_birth").toString()
                    : (reqData.get("dob") != null ? reqData.get("dob").toString() : null);
            if (dobVal != null && !dobVal.trim().isEmpty()) {
                try {
                    s.setDateOfBirth(LocalDate.parse(dobVal.trim()));
                } catch (Exception ignored) {}
            }

            if (reqData.containsKey("address")) s.setAddress((String) reqData.get("address"));

            String photoVal = reqData.get("profile_photo") != null ? reqData.get("profile_photo").toString()
                    : (reqData.get("profilePhoto") != null ? reqData.get("profilePhoto").toString() : null);
            if (photoVal != null) s.setProfilePhoto(photoVal);

            String bgVal = reqData.get("blood_group") != null ? reqData.get("blood_group").toString()
                    : (reqData.get("bloodGroup") != null ? reqData.get("bloodGroup").toString() : null);
            if (bgVal != null) s.setBloodGroup(bgVal);

            String parentNameVal = reqData.get("parent_name") != null ? reqData.get("parent_name").toString()
                    : (reqData.get("parentName") != null ? reqData.get("parentName").toString() : null);
            if (parentNameVal != null) s.setParentName(parentNameVal);

            String parentMobileVal = reqData.get("parent_mobile") != null ? reqData.get("parent_mobile").toString()
                    : (reqData.get("parentMobile") != null ? reqData.get("parentMobile").toString() : null);
            if (parentMobileVal != null) s.setParentMobile(parentMobileVal);

            s.setUpdatedAt(java.time.LocalDateTime.now());
            Student saved = studentRepository.save(s);
            return mapStudentToProfileMap(saved);
        }
        return new HashMap<>();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getWeeklyTestsForStudent(String enrollmentNo) {
        Optional<Student> studentOpt = Optional.empty();
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
        }

        UUID studentDeptId = studentOpt.map(Student::getDepartmentId).orElse(null);
        UUID studentSemId = studentOpt.map(Student::getSemesterId).orElse(null);

        List<WeeklyTest> tests = weeklyTestRepository.findAll();
        List<Map<String, Object>> testList = new ArrayList<>();
        for (WeeklyTest wt : tests) {
            // Department Filter: if test specifies department, only show to student in that department
            if (wt.getDepartmentId() != null && studentDeptId != null && !wt.getDepartmentId().equals(studentDeptId)) {
                continue;
            }
            // Semester Filter: if test specifies semester, only show to student in that semester
            if (wt.getSemesterId() != null && studentSemId != null && !wt.getSemesterId().equals(studentSemId)) {
                continue;
            }
            // Subject-level Department/Semester check fallback
            if (wt.getSubjectId() != null && (studentDeptId != null || studentSemId != null)) {
                Optional<Subject> sOpt = subjectRepository.findById(wt.getSubjectId());
                if (sOpt.isPresent()) {
                    Subject sub = sOpt.get();
                    if (studentDeptId != null && sub.getDepartmentId() != null && !sub.getDepartmentId().equals(studentDeptId)) {
                        continue;
                    }
                    if (studentSemId != null && sub.getSemesterId() != null && !sub.getSemesterId().equals(studentSemId)) {
                        continue;
                    }
                }
            }

            Map<String, Object> map = new HashMap<>();
            String testIdStr = wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "";
            map.put("weekly_test_id", testIdStr);
            map.put("weekly_exam_id", testIdStr);
            map.put("teacher_subject_id", wt.getTeacherSubjectId() != null ? wt.getTeacherSubjectId().toString() : "");
            map.put("subject_id", wt.getSubjectId() != null ? wt.getSubjectId().toString() : "");
            map.put("department_id", wt.getDepartmentId() != null ? wt.getDepartmentId().toString() : "");
            map.put("semester_id", wt.getSemesterId() != null ? wt.getSemesterId().toString() : "");
            map.put("title", wt.getTitle() != null ? wt.getTitle() : "");
            map.put("description", wt.getDescription() != null ? wt.getDescription() : "");
            String dateStr = wt.getTestDate() != null ? wt.getTestDate().toString() : "";
            map.put("test_date", dateStr);
            map.put("exam_date", dateStr);
            map.put("start_time", wt.getStartTime() != null ? wt.getStartTime().toString() : "10:00:00");
            map.put("end_time", wt.getEndTime() != null ? wt.getEndTime().toString() : "11:00:00");
            map.put("total_marks", wt.getTotalMarks() != null ? wt.getTotalMarks() : 25);
            map.put("created_at", wt.getCreatedAt() != null ? wt.getCreatedAt().toString() : "");
            testList.add(map);
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        if (studentOpt.isPresent()) {
            List<WeeklyTestResult> dbResults = weeklyTestResultRepository.findByStudentId(studentOpt.get().getStudentId());
            for (WeeklyTestResult r : dbResults) {
                Map<String, Object> rMap = new HashMap<>();
                String resIdStr = r.getWeeklyTestResultId() != null ? r.getWeeklyTestResultId().toString() : "";
                String testIdStr = r.getWeeklyTestId() != null ? r.getWeeklyTestId().toString() : "";
                rMap.put("weekly_test_result_id", resIdStr);
                rMap.put("weekly_exam_result_id", resIdStr);
                rMap.put("weekly_test_id", testIdStr);
                rMap.put("weekly_exam_id", testIdStr);
                rMap.put("student_id", r.getStudentId() != null ? r.getStudentId().toString() : "");
                rMap.put("obtained_marks", r.getObtainedMarks());
                rMap.put("grade", r.getGrade() != null ? r.getGrade() : "-");
                rMap.put("remarks", r.getRemarks() != null ? r.getRemarks() : "");
                resultList.add(rMap);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("tests", testList);
        response.put("exams", testList);
        response.put("results", resultList);
        return response;
    }

    @Transactional(readOnly = true)
    public List<com.educonnect.backend.entity.LeaveRequest> getLeaveRequests(String enrollmentNo) {
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            String clean = enrollmentNo.trim();
            Optional<Student> sOpt = Optional.empty();
            try {
                sOpt = studentRepository.findById(UUID.fromString(clean));
            } catch (Exception ignored) {}
            if (sOpt.isEmpty()) {
                sOpt = studentRepository.findByEnrollmentNo(clean);
            }
            if (sOpt.isEmpty()) {
                sOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
            if (sOpt.isPresent() && sOpt.get().getStudentId() != null) {
                List<com.educonnect.backend.entity.LeaveRequest> list = leaveRequestRepository.findByStudentId(sOpt.get().getStudentId());
                if (!list.isEmpty()) return list;
            }
        }
        return leaveRequestRepository.findAll();
    }

    @Transactional
    public com.educonnect.backend.entity.LeaveRequest submitLeaveRequest(String enrollmentNo, Map<String, Object> reqData) {
        String finalEnroll = (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) ? enrollmentNo.trim() : "2024MCA001";
        Optional<Student> sOpt = Optional.empty();
        try {
            sOpt = studentRepository.findById(UUID.fromString(finalEnroll));
        } catch (Exception ignored) {}
        if (sOpt.isEmpty()) {
            sOpt = studentRepository.findByEnrollmentNo(finalEnroll);
        }
        if (sOpt.isEmpty()) {
            sOpt = studentRepository.findByEmail(finalEnroll.toLowerCase());
        }
        if (sOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) sOpt = Optional.of(all.get(0));
        }

        UUID studentId = sOpt.map(Student::getStudentId).orElse(null);

        com.educonnect.backend.entity.LeaveRequest lr = new com.educonnect.backend.entity.LeaveRequest();
        lr.setStudentId(studentId);
        lr.setLeaveType(reqData.get("leave_type") != null ? (String) reqData.get("leave_type") : "Sick");
        
        try {
            if (reqData.get("from_date") != null) lr.setFromDate(LocalDate.parse((String) reqData.get("from_date")));
        } catch (Exception ignored) {}
        if (lr.getFromDate() == null) lr.setFromDate(LocalDate.now());

        try {
            if (reqData.get("to_date") != null) lr.setToDate(LocalDate.parse((String) reqData.get("to_date")));
        } catch (Exception ignored) {}
        if (lr.getToDate() == null) lr.setToDate(LocalDate.now());

        lr.setReason(reqData.get("reason") != null ? (String) reqData.get("reason") : "");
        lr.setStatus("Pending");

        return leaveRequestRepository.save(lr);
    }

    private Optional<Student> resolveStudentEntity(String identifier, Map<String, Object> reqData) {
        String reqStudentId = reqData != null ? (String) reqData.get("student_id") : null;
        if (reqStudentId == null && reqData != null) reqStudentId = (String) reqData.get("studentId");

        String[] candidates = new String[]{reqStudentId, identifier, "2024MCA001"};
        for (String candidate : candidates) {
            if (candidate == null || candidate.trim().isEmpty()) continue;
            String clean = candidate.trim();
            try {
                Optional<Student> opt = studentRepository.findById(UUID.fromString(clean));
                if (opt.isPresent()) return opt;
            } catch (Exception ignored) {}

            Optional<Student> opt = studentRepository.findByEnrollmentNo(clean);
            if (opt.isPresent()) return opt;

            opt = studentRepository.findAll().stream()
                    .filter(s -> (s.getEnrollmentNo() != null && s.getEnrollmentNo().equalsIgnoreCase(clean)) ||
                                 (s.getEmail() != null && s.getEmail().equalsIgnoreCase(clean)))
                    .findFirst();
            if (opt.isPresent()) return opt;
        }

        List<Student> all = studentRepository.findAll();
        if (!all.isEmpty()) return Optional.of(all.get(0));
        return Optional.empty();
    }

    @Transactional(readOnly = true)
    public List<com.educonnect.backend.entity.StudentDoubt> getStudentDoubts(String identifier) {
        Optional<Student> sOpt = resolveStudentEntity(identifier, null);
        if (sOpt.isPresent()) {
            List<com.educonnect.backend.entity.StudentDoubt> list = studentDoubtRepository.findByStudentId(sOpt.get().getStudentId());
            if (!list.isEmpty()) return list;
        }
        return studentDoubtRepository.findAll();
    }

    @Transactional
    public com.educonnect.backend.entity.StudentDoubt askDoubt(String identifier, Map<String, Object> reqData) {
        Optional<Student> sOpt = resolveStudentEntity(identifier, reqData);
        UUID studentId = sOpt.map(Student::getStudentId).orElse(null);

        com.educonnect.backend.entity.StudentDoubt sd = new com.educonnect.backend.entity.StudentDoubt();
        sd.setStudentId(studentId);

        String subjName = (String) reqData.get("subject_name");
        if (subjName == null) subjName = (String) reqData.get("subjectName");
        if (subjName == null || subjName.trim().isEmpty()) subjName = "Advanced Web Technologies";
        sd.setSubjectName(subjName);

        String qText = (String) reqData.get("question");
        if (qText == null || qText.trim().isEmpty()) {
            String title = (String) reqData.get("title");
            String desc = (String) reqData.get("description");
            if (title != null && desc != null && !desc.trim().isEmpty()) {
                qText = title.trim() + ": " + desc.trim();
            } else if (title != null) {
                qText = title.trim();
            } else if (desc != null) {
                qText = desc.trim();
            } else {
                qText = "Academic Doubt";
            }
        }
        sd.setQuestion(qText);
        sd.setStatus("Pending");

        return studentDoubtRepository.save(sd);
    }

    @Transactional
    public com.educonnect.backend.entity.StudentDoubt updateDoubt(UUID id, Map<String, Object> reqData) {
        Optional<com.educonnect.backend.entity.StudentDoubt> opt = studentDoubtRepository.findById(id);
        if (opt.isPresent()) {
            com.educonnect.backend.entity.StudentDoubt sd = opt.get();
            String subjName = (String) reqData.get("subject_name");
            if (subjName == null) subjName = (String) reqData.get("subjectName");
            if (subjName != null && !subjName.trim().isEmpty()) {
                sd.setSubjectName(subjName.trim());
            }

            String qText = (String) reqData.get("question");
            if (qText == null || qText.trim().isEmpty()) {
                String title = (String) reqData.get("title");
                String desc = (String) reqData.get("description");
                if (title != null && desc != null && !desc.trim().isEmpty()) {
                    qText = title.trim() + ": " + desc.trim();
                } else if (title != null) {
                    qText = title.trim();
                } else if (desc != null) {
                    qText = desc.trim();
                }
            }
            if (qText != null && !qText.trim().isEmpty()) {
                sd.setQuestion(qText.trim());
            }

            return studentDoubtRepository.save(sd);
        }
        return null;
    }

    private UUID[] resolveStudentDeptAndSem(String identifier) {
        Optional<Student> studentOpt = Optional.empty();
        String clean = (identifier != null && !identifier.trim().isEmpty()) ? identifier.trim() : "2024MCA001";

        try {
            studentOpt = studentRepository.findById(UUID.fromString(clean));
        } catch (Exception ignored) {}

        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(clean);
        }

        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findAll().stream()
                    .filter(s -> s.getEnrollmentNo() != null && s.getEnrollmentNo().equalsIgnoreCase(clean))
                    .findFirst();
        }

        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(clean.toLowerCase());
        }

        UUID deptId = studentOpt.map(Student::getDepartmentId).orElse(null);
        UUID semId = studentOpt.map(Student::getSemesterId).orElse(null);

        // Fallback: If deptId is null, attempt to infer from department code matching identifier (e.g. BCA vs MCA)
        if (deptId == null) {
            String upper = clean.toUpperCase();
            if (upper.contains("BCA")) {
                deptId = departmentRepository.findAll().stream()
                        .filter(d -> d.getDepartmentCode() != null && d.getDepartmentCode().toUpperCase().contains("BCA"))
                        .map(com.educonnect.backend.entity.Department::getDepartmentId)
                        .findFirst()
                        .orElse(null);
            } else if (upper.contains("MCA")) {
                deptId = departmentRepository.findAll().stream()
                        .filter(d -> d.getDepartmentCode() != null && d.getDepartmentCode().toUpperCase().contains("MCA"))
                        .map(com.educonnect.backend.entity.Department::getDepartmentId)
                        .findFirst()
                        .orElse(null);
            }
        }

        if (semId == null && deptId != null) {
            List<com.educonnect.backend.entity.Semester> sems = semesterRepository.findByDepartmentIdOrderBySemesterNumberAsc(deptId);
            if (!sems.isEmpty()) {
                semId = sems.get(0).getSemesterId();
            }
        }

        return new UUID[]{deptId, semId};
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudyMaterials(String enrollmentNo) {
        UUID[] deptSem = resolveStudentDeptAndSem(enrollmentNo);
        UUID stuDeptId = deptSem[0];
        UUID stuSemId = deptSem[1];

        List<Map<String, Object>> allMaterials = teacherService.getStudyMaterials();
        List<Map<String, Object>> filteredList = new ArrayList<>();

        for (Map<String, Object> smMap : allMaterials) {
            String subjIdStr = smMap.get("subject_id") != null ? smMap.get("subject_id").toString()
                    : (smMap.get("subjectId") != null ? smMap.get("subjectId").toString() : null);

            if (subjIdStr != null && !subjIdStr.trim().isEmpty()) {
                try {
                    UUID subjectId = UUID.fromString(subjIdStr.trim());
                    Optional<Subject> subOpt = subjectRepository.findById(subjectId);
                    if (subOpt.isPresent()) {
                        Subject sub = subOpt.get();
                        UUID subDeptId = sub.getDepartmentId();
                        UUID subSemId = sub.getSemesterId();

                        // 1. Department Visibility Filter:
                        // If subject belongs to a specific department, student MUST be in that exact department.
                        if (subDeptId != null) {
                            if (stuDeptId == null || !stuDeptId.equals(subDeptId)) {
                                continue; // Skip: Student is not in the same department (e.g. BCA vs MCA)
                            }
                        }

                        // 2. Semester Visibility Filter:
                        // If subject belongs to a specific semester, student MUST be in that exact semester.
                        if (subSemId != null) {
                            if (stuSemId == null || !stuSemId.equals(subSemId)) {
                                continue; // Skip: Student is not in the same semester (e.g. Sem 1 vs Sem 3)
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            filteredList.add(smMap);
        }

        return filteredList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudyMaterials() {
        return getStudyMaterials("2024MCA001");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuizzesForStudent(String enrollmentNo) {
        String finalEnroll = (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) ? enrollmentNo.trim() : "2024MCA001";
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(finalEnroll);
        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            if (!all.isEmpty()) studentOpt = Optional.of(all.get(0));
        }

        UUID studentDeptId = studentOpt.map(Student::getDepartmentId).orElse(null);
        UUID studentSemId = studentOpt.map(Student::getSemesterId).orElse(null);

        List<Map<String, Object>> allQuizzes = teacherService.getQuizzes();
        List<Map<String, Object>> filteredList = new ArrayList<>();

        for (Map<String, Object> quizMap : allQuizzes) {
            List<?> mcqs = (List<?>) quizMap.get("mcqs");
            if (mcqs == null || mcqs.isEmpty()) {
                List<?> questions = (List<?>) quizMap.get("questions");
                if (questions == null || questions.isEmpty()) {
                    continue;
                }
            }

            String subjIdStr = (String) quizMap.get("subject_id");
            if (subjIdStr != null && !subjIdStr.trim().isEmpty()) {
                try {
                    UUID subjectId = UUID.fromString(subjIdStr.trim());
                    Optional<Subject> subOpt = subjectRepository.findById(subjectId);
                    if (subOpt.isPresent()) {
                        Subject sub = subOpt.get();
                        if (studentDeptId != null && sub.getDepartmentId() != null && !sub.getDepartmentId().equals(studentDeptId)) {
                            continue;
                        }
                        if (studentSemId != null && sub.getSemesterId() != null && !sub.getSemesterId().equals(studentSemId)) {
                            continue;
                        }
                    }
                } catch (Exception ignored) {}
            }
            filteredList.add(quizMap);
        }
        return filteredList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuizzes() {
        return getQuizzesForStudent("2024MCA001");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimetable(String enrollmentNo) {
        List<Map<String, Object>> timetable = new ArrayList<>();
        timetable.add(Map.of("day", "Monday", "time", "09:30 AM - 10:30 AM", "subject", "Advanced Web Technologies", "room", "Lab 301", "faculty", "Dr. Sarah Jenkins"));
        timetable.add(Map.of("day", "Monday", "time", "10:45 AM - 11:45 AM", "subject", "Cloud Computing", "room", "LH 202", "faculty", "Prof. Robert Smith"));
        timetable.add(Map.of("day", "Tuesday", "time", "09:30 AM - 10:30 AM", "subject", "Database Management Systems", "room", "Lab 102", "faculty", "Dr. Emily Davis"));
        timetable.add(Map.of("day", "Wednesday", "time", "11:00 AM - 12:00 PM", "subject", "Data Structures & Algorithms", "room", "LH 104", "faculty", "Prof. Michael Brown"));
        timetable.add(Map.of("day", "Thursday", "time", "02:00 PM - 03:30 PM", "subject", "Machine Learning Lab", "room", "AI Center", "faculty", "Dr. Sarah Jenkins"));
        timetable.add(Map.of("day", "Friday", "time", "10:00 AM - 11:30 AM", "subject", "Software Engineering", "room", "LH 205", "faculty", "Dr. Alan Turing"));
        return timetable;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMarksheet(String enrollmentNo) {
        Map<String, Object> map = new HashMap<>();
        map.put("enrollmentNo", enrollmentNo != null ? enrollmentNo : "2024MCA001");
        map.put("studentName", "Alex Johnson");
        map.put("program", "Master of Computer Applications");
        map.put("semester", "Semester 3");
        map.put("sgpa", 8.85);
        map.put("cgpa", 8.92);
        map.put("status", "PASSED WITH DISTINCTION");
        
        List<Map<String, Object>> subjects = List.of(
                Map.of("code", "MCA301", "name", "Advanced Web Technologies", "credits", 4, "grade", "A+", "points", 10),
                Map.of("code", "MCA302", "name", "Cloud Computing Architecture", "credits", 4, "grade", "A", "points", 9),
                Map.of("code", "MCA303", "name", "Database Security & Admin", "credits", 3, "grade", "A+", "points", 10),
                Map.of("code", "MCA304", "name", "Software Project Management", "credits", 3, "grade", "B+", "points", 8),
                Map.of("code", "MCA305", "name", "Full Stack Development Lab", "credits", 2, "grade", "O", "points", 10)
        );
        map.put("subjects", subjects);
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSubjectsForStudent(String identifier) {
        Optional<Student> studentOpt = Optional.empty();
        if (identifier != null && !identifier.trim().isEmpty()) {
            String clean = identifier.trim();
            try {
                studentOpt = studentRepository.findById(UUID.fromString(clean));
            } catch (Exception ignored) {}
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNo(clean);
            }
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
        }

        if (studentOpt.isEmpty()) {
            List<Student> all = studentRepository.findAll();
            for (Student s : all) {
                if (s.getEnrollmentNo() != null && s.getEnrollmentNo().toUpperCase().contains("MCA")) {
                    studentOpt = Optional.of(s);
                    break;
                }
            }
            if (studentOpt.isEmpty() && !all.isEmpty()) {
                studentOpt = Optional.of(all.get(0));
            }
        }

        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Student student = studentOpt.get();
        UUID studentDeptId = student.getDepartmentId();
        UUID studentSemId = student.getSemesterId();

        boolean isMcaStudent = false;
        String enroll = student.getEnrollmentNo() != null ? student.getEnrollmentNo().toUpperCase() : "";
        String email = student.getEmail() != null ? student.getEmail().toLowerCase() : "";
        if (enroll.contains("MCA") || email.contains("mca")) {
            isMcaStudent = true;
        }

        if (studentDeptId != null) {
            Optional<com.educonnect.backend.entity.Department> deptOpt = departmentRepository.findById(studentDeptId);
            if (deptOpt.isPresent()) {
                String dName = deptOpt.get().getDepartmentName() != null ? deptOpt.get().getDepartmentName().toUpperCase() : "";
                String dCode = deptOpt.get().getDepartmentCode() != null ? deptOpt.get().getDepartmentCode().toUpperCase() : "";
                if (dName.contains("MCA") || dName.contains("COMPUTER APPLICATION") || dCode.contains("MCA")) {
                    isMcaStudent = true;
                }
            }
        }

        Integer semNum = null;
        if (studentSemId != null) {
            Optional<com.educonnect.backend.entity.Semester> semOpt = semesterRepository.findById(studentSemId);
            if (semOpt.isPresent()) {
                semNum = semOpt.get().getSemesterNumber();
            }
        }
        if (semNum == null) {
            semNum = 1;
        }

        List<Subject> allSubjects = subjectRepository.findAll();
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (Subject sub : allSubjects) {
            if (sub.getDepartmentId() != null) {
                Optional<com.educonnect.backend.entity.Department> subDeptOpt = departmentRepository.findById(sub.getDepartmentId());
                if (subDeptOpt.isPresent()) {
                    String subDeptCode = subDeptOpt.get().getDepartmentCode() != null ? subDeptOpt.get().getDepartmentCode().toUpperCase() : "";
                    String subDeptName = subDeptOpt.get().getDepartmentName() != null ? subDeptOpt.get().getDepartmentName().toUpperCase() : "";
                    if (isMcaStudent) {
                        if (subDeptCode.contains("BTECH") || subDeptName.contains("BTECH") || subDeptName.contains("BACHELOR OF TECHNOLOGY") || subDeptCode.contains("CSE") || subDeptName.contains("CIVIL") || subDeptName.contains("MECHANICAL")) {
                            continue;
                        }
                    }
                }
            }

            if (studentDeptId != null && sub.getDepartmentId() != null && !sub.getDepartmentId().equals(studentDeptId)) {
                continue;
            }

            // Match batch if both student and subject specify a batch
            if (student.getBatchId() != null && sub.getBatchId() != null && !sub.getBatchId().equals(student.getBatchId())) {
                continue;
            }

            // Match semester: subject must belong to student's current semester
            if (studentSemId != null) {
                if (sub.getSemesterId() == null) {
                    continue;
                }
                if (!sub.getSemesterId().equals(studentSemId)) {
                    Optional<com.educonnect.backend.entity.Semester> subSemOpt = semesterRepository.findById(sub.getSemesterId());
                    if (subSemOpt.isEmpty() || !semNum.equals(subSemOpt.get().getSemesterNumber())) {
                        continue;
                    }
                }
            } else if (sub.getSemesterId() != null) {
                Optional<com.educonnect.backend.entity.Semester> subSemOpt = semesterRepository.findById(sub.getSemesterId());
                if (subSemOpt.isPresent() && subSemOpt.get().getSemesterNumber() != null && !semNum.equals(subSemOpt.get().getSemesterNumber())) {
                    continue;
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("subject_id", sub.getSubjectId() != null ? sub.getSubjectId().toString() : "");
            map.put("id", sub.getSubjectId() != null ? sub.getSubjectId().toString() : "");
            map.put("subject_name", sub.getSubjectName());
            map.put("name", sub.getSubjectName());
            map.put("subject_code", sub.getSubjectCode());
            map.put("code", sub.getSubjectCode());
            map.put("credits", sub.getCredits());
            map.put("department_id", sub.getDepartmentId() != null ? sub.getDepartmentId().toString() : "");
            map.put("semester_id", sub.getSemesterId() != null ? sub.getSemesterId().toString() : "");
            resultList.add(map);
        }

        if (resultList.isEmpty() && isMcaStudent && semNum == 1) {
            List<Map<String, Object>> mcaSem1Default = List.of(
                Map.of("subject_id", "mca-101", "id", "mca-101", "subject_name", "Programming in C & Data Structures", "name", "Programming in C & Data Structures", "subject_code", "MCA101", "code", "MCA101", "credits", 4),
                Map.of("subject_id", "mca-102", "id", "mca-102", "subject_name", "Database Management Systems", "name", "Database Management Systems", "subject_code", "MCA102", "code", "MCA102", "credits", 4),
                Map.of("subject_id", "mca-103", "id", "mca-103", "subject_name", "Computer Organization & Architecture", "name", "Computer Organization & Architecture", "subject_code", "MCA103", "code", "MCA103", "credits", 3),
                Map.of("subject_id", "mca-104", "id", "mca-104", "subject_name", "Discrete Mathematics", "name", "Discrete Mathematics", "subject_code", "MCA104", "code", "MCA104", "credits", 3),
                Map.of("subject_id", "mca-105", "id", "mca-105", "subject_name", "Software Engineering Foundations", "name", "Software Engineering Foundations", "subject_code", "MCA105", "code", "MCA105", "credits", 3)
            );
            return mcaSem1Default;
        }

        return resultList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSyllabus() {
        return List.of(
                Map.of("unit", "Unit 1", "title", "React Component Lifecycle & Hooks", "description", "useState, useEffect, custom hooks, virtual DOM reconciler"),
                Map.of("unit", "Unit 2", "title", "RESTful API Integration with Axios", "description", "HTTP methods, interceptors, async state management, CORS"),
                Map.of("unit", "Unit 3", "title", "Spring Boot Microservices & JPA", "description", "Entity mapping, Repositories, Spring Security, Hibernate ORM"),
                Map.of("unit", "Unit 4", "title", "PostgreSQL Database Design & Indexing", "description", "Schema normalization, ACID properties, foreign keys, triggers")
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDigitalID(String enrollmentNo) {
        String finalEnroll = (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) ? enrollmentNo.trim() : "2024MCA001";
        Optional<Student> sOpt = studentRepository.findByEnrollmentNo(finalEnroll);
        
        Map<String, Object> card = new HashMap<>();
        if (sOpt.isPresent()) {
            Student s = sOpt.get();
            card.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            card.put("enrollment_no", s.getEnrollmentNo());
            card.put("name", (s.getFirstName() + " " + s.getLastName()).trim());
            card.put("email", s.getEmail());
            card.put("mobile", s.getMobile());
            card.put("department", "Computer Applications");
            card.put("program", "MCA (2024-2026)");
            card.put("dob", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "2002-08-15");
            card.put("blood_group", s.getBloodGroup() != null ? s.getBloodGroup() : "O+");
            card.put("valid_until", "2026-06-30");
            card.put("profile_photo", s.getProfilePhoto() != null ? s.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        } else {
            card.put("enrollment_no", finalEnroll);
            card.put("name", "Alex Johnson");
            card.put("email", "alex.johnson@educonnect.ac.in");
            card.put("mobile", "+91 9876543212");
            card.put("department", "Computer Applications");
            card.put("program", "MCA (2024-2026)");
            card.put("dob", "2002-08-15");
            card.put("blood_group", "O+");
            card.put("valid_until", "2026-06-30");
            card.put("profile_photo", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        }
        return card;
    }
}
