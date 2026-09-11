package com.educonnect.backend.service;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.Student;
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
import com.educonnect.backend.repository.NoticeRepository;


import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.TeacherSubjectRepository;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final WeeklyTestRepository weeklyTestRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
    private final SemesterResultRepository semesterResultRepository;

    public Map<String, Object> getStudentDashboard(String studentIdOrEnrollment) {
        Map<String, Object> data = new HashMap<>();
        String cleanIdentifier = studentIdOrEnrollment;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Student> sOpt = Optional.empty();
        if (cleanIdentifier != null && !cleanIdentifier.trim().isEmpty()) {
            sOpt = studentRepository.findByEnrollmentNo(cleanIdentifier.trim());
            if (sOpt.isEmpty()) {
                sOpt = studentRepository.findByEmail(cleanIdentifier.trim());
            }
        }

        UUID deptId = null;
        UUID batchId = null;
        UUID studentId = null;
        String enrollmentNo = "";

        if (sOpt.isPresent()) {
            Student s = sOpt.get();
            studentId = s.getStudentId();
            enrollmentNo = s.getEnrollmentNo();
            data.put("studentName", (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : ""));
            data.put("enrollmentNo", s.getEnrollmentNo());
            deptId = s.getDepartmentId();
            batchId = s.getBatchId();

            if (s.getDepartmentId() != null) {
                departmentRepository.findById(s.getDepartmentId()).ifPresent(d -> data.put("program", d.getDepartmentName()));
            }
            if (s.getSemesterId() != null) {
                semesterRepository.findById(s.getSemesterId()).ifPresent(sem -> data.put("semester", sem.getSemesterName()));
            }
        } else {
            data.put("studentName", "Student");
            data.put("enrollmentNo", cleanIdentifier != null ? cleanIdentifier : "");
        }
        if (!data.containsKey("program")) data.put("program", "Department of Computer Applications");
        if (!data.containsKey("semester")) data.put("semester", "Semester 1");

        // Calculate real attendance %
        if (studentId != null) {
            List<AttendanceRecord> recs = attendanceRecordRepository.findByStudentId(studentId);
            int total = recs.size();
            long presentCount = recs.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            String overallAttendance = total > 0 ? String.format(Locale.US, "%.1f%%", (double) presentCount / total * 100.0) : "0%";
            data.put("overallAttendance", overallAttendance);
            data.put("attendancePct", overallAttendance);
        } else {
            data.put("overallAttendance", "0%");
            data.put("attendancePct", "0%");
        }

        // Calculate real CGPA & SGPA from published semester results
        if (studentId != null && semesterResultRepository != null) {
            List<com.educonnect.backend.entity.SemesterResult> results = semesterResultRepository.findByStudentIdAndIsPublishedTrue(studentId);
            if (!results.isEmpty()) {
                com.educonnect.backend.entity.SemesterResult latest = results.stream()
                        .max(Comparator.comparing(com.educonnect.backend.entity.SemesterResult::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                        .orElse(results.get(0));
                String cgpaStr = latest.getCgpa() != null ? String.format(Locale.US, "%.2f / 10.0", latest.getCgpa()) : "N/A";
                data.put("cgpa", cgpaStr);
                data.put("sgpa", latest.getSgpa() != null ? latest.getSgpa().toString() : "N/A");
            } else {
                data.put("cgpa", "N/A");
                data.put("sgpa", "N/A");
            }
        } else {
            data.put("cgpa", "N/A");
            data.put("sgpa", "N/A");
        }

        // Calculate enrolled courses count
        if (enrollmentNo != null && !enrollmentNo.isEmpty()) {
            List<com.educonnect.backend.entity.Subject> subjects = getSubjectsForStudent(enrollmentNo);
            data.put("enrolledCoursesCount", subjects.size());
        } else {
            data.put("enrolledCoursesCount", 0);
        }

        // Calculate pending tasks count (unsubmitted assignments)
        if (enrollmentNo != null && !enrollmentNo.isEmpty()) {
            List<Map<String, Object>> assignments = getStudentAssignments(enrollmentNo);
            long pendingCount = assignments.stream().filter(a -> Boolean.FALSE.equals(a.get("submitted"))).count();
            data.put("pendingTasksCount", (int) pendingCount);
        } else {
            data.put("pendingTasksCount", 0);
        }

        data.put("todayClasses", Collections.emptyList());

        // Fetch announcements/notices
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        final UUID finalDeptId = deptId;
        final UUID finalBatchId = batchId;
        List<Map<String, Object>> announcements = noticeRepository.findActiveUnexpiredNotices(now).stream()
                .filter(n -> {
                    String target = n.getTargetRole() != null ? n.getTargetRole().toUpperCase() : "ALL";
                    if ("TEACHER".equals(target)) return false;
                    if (n.getDepartmentId() != null && !Objects.equals(n.getDepartmentId(), finalDeptId)) {
                        return false;
                    }
                    if (n.getBatchId() != null && !Objects.equals(n.getBatchId(), finalBatchId)) {
                        return false;
                    }
                    return true;
                })
                .map(n -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", n.getNoticeId() != null ? n.getNoticeId().toString() : "");
                    map.put("notice_id", n.getNoticeId() != null ? n.getNoticeId().toString() : "");
                    map.put("title", n.getTitle() != null ? n.getTitle() : "");
                    map.put("description", n.getDescription() != null ? n.getDescription() : "");
                    map.put("target_role", n.getTargetRole() != null ? n.getTargetRole() : "ALL");
                    map.put("author_name", n.getAuthorName() != null ? n.getAuthorName() : "");
                    map.put("date", n.getPublishDate() != null ? n.getPublishDate().toLocalDate().toString() : "");
                    map.put("publish_date", n.getPublishDate() != null ? n.getPublishDate().toString() : "");
                    return map;
                })
                .collect(Collectors.toList());

        data.put("announcements", announcements);
        data.put("notices", announcements);

        return data;
    }


    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttendance(String studentIdOrEnrollment) {
        String cleanIdentifier = studentIdOrEnrollment;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Student> studentOpt = Optional.empty();
        if (cleanIdentifier != null && !cleanIdentifier.trim().isEmpty()) {
            String clean = cleanIdentifier.trim();
            studentOpt = studentRepository.findByEnrollmentNo(clean);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
            if (studentOpt.isEmpty()) {
                try {
                    studentOpt = studentRepository.findById(UUID.fromString(clean));
                } catch (IllegalArgumentException ignored) {}
            }
        }

        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Student student = studentOpt.get();
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(student.getStudentId());
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> sessionIds = records.stream()
                .map(AttendanceRecord::getSessionId)
                .collect(Collectors.toSet());

        Map<UUID, AttendanceSession> sessionMap = attendanceSessionRepository.findAllById(sessionIds).stream()
                .collect(Collectors.toMap(AttendanceSession::getSessionId, s -> s, (s1, s2) -> s1));

        Set<UUID> allocIds = sessionMap.values().stream()
                .map(AttendanceSession::getTeacherSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, TeacherSubject> allocMap = teacherSubjectRepository.findAllById(allocIds).stream()
                .collect(Collectors.toMap(TeacherSubject::getAllocationId, a -> a, (a1, a2) -> a1));

        Set<UUID> subjectIds = allocMap.values().stream()
                .map(TeacherSubject::getSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, com.educonnect.backend.entity.Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(com.educonnect.backend.entity.Subject::getSubjectId, s -> s, (s1, s2) -> s1));

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (AttendanceRecord rec : records) {
            AttendanceSession sess = sessionMap.get(rec.getSessionId());
            if (sess == null) continue;

            TeacherSubject alloc = allocMap.get(sess.getTeacherSubjectId());
            com.educonnect.backend.entity.Subject sub = alloc != null ? subjectMap.get(alloc.getSubjectId()) : null;

            Map<String, Object> map = new HashMap<>();
            map.put("attendance_id", rec.getAttendanceId().toString());
            map.put("session_id", sess.getSessionId().toString());
            map.put("session_date", sess.getSessionDate().toString());
            map.put("lecture_no", sess.getLectureNo());
            map.put("start_time", sess.getStartTime().toString());
            map.put("end_time", sess.getEndTime().toString());
            map.put("topic", sess.getTopic() != null ? sess.getTopic() : "");
            map.put("attendance_status", rec.getAttendanceStatus());
            map.put("status", rec.getAttendanceStatus());
            map.put("remarks", rec.getRemarks() != null ? rec.getRemarks() : "");

            if (sub != null) {
                map.put("subject_id", sub.getSubjectId().toString());
                map.put("subject_name", sub.getSubjectName());
                map.put("subject_code", sub.getSubjectCode());
            } else {
                map.put("subject_name", "Assigned Subject");
                map.put("subject_code", "SUBJ");
            }

            Map<String, Object> sessionSubObj = new HashMap<>();
            sessionSubObj.put("session_date", sess.getSessionDate().toString());
            sessionSubObj.put("lecture_no", sess.getLectureNo());
            sessionSubObj.put("start_time", sess.getStartTime().toString());
            sessionSubObj.put("end_time", sess.getEndTime().toString());
            sessionSubObj.put("topic", sess.getTopic() != null ? sess.getTopic() : "");
            map.put("session", sessionSubObj);

            Map<String, Object> subjectSubObj = new HashMap<>();
            subjectSubObj.put("subject_name", sub != null ? sub.getSubjectName() : "Subject");
            subjectSubObj.put("subject_code", sub != null ? sub.getSubjectCode() : "");
            map.put("subject", subjectSubObj);

            resultList.add(map);
        }

        resultList.sort((m1, m2) -> ((String) m2.get("session_date")).compareTo((String) m1.get("session_date")));
        return resultList;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        String cleanIdentifier = enrollmentNo;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Student> studentOpt = Optional.empty();
        if (cleanIdentifier != null && !cleanIdentifier.trim().isEmpty()) {
            String clean = cleanIdentifier.trim();
            studentOpt = studentRepository.findByEnrollmentNo(clean);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(clean.toLowerCase());
            }
            if (studentOpt.isEmpty()) {
                try {
                    studentOpt = studentRepository.findById(UUID.fromString(clean));
                } catch (IllegalArgumentException ignored) {}
            }
        }

        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Student student = studentOpt.get();
        UUID studentId = student.getStudentId();
        UUID deptId = student.getDepartmentId();
        UUID semId = student.getSemesterId();
        UUID batchId = student.getBatchId();

        List<com.educonnect.backend.entity.Subject> studentSubjects = Collections.emptyList();
        if (deptId != null || semId != null) {
            studentSubjects = subjectRepository.findAll().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                    .filter(s -> deptId == null || Objects.equals(s.getDepartmentId(), deptId))
                    .filter(s -> semId == null || Objects.equals(s.getSemesterId(), semId))
                    .toList();
        }

        Set<UUID> subjectIds = studentSubjects.stream()
                .map(com.educonnect.backend.entity.Subject::getSubjectId)
                .collect(Collectors.toSet());

        List<Assignment> allAssignments = assignmentRepository.findAll();
        List<Assignment> eligibleAssignments = new ArrayList<>();

        for (Assignment a : allAssignments) {
            if (a.getTeacherSubjectId() != null) {
                TeacherSubject alloc = teacherSubjectRepository.findById(a.getTeacherSubjectId()).orElse(null);
                if (alloc != null) {
                    if (alloc.getBatchId() != null && batchId != null && !Objects.equals(alloc.getBatchId(), batchId)) {
                        continue;
                    }
                    if (alloc.getSubjectId() != null) {
                        com.educonnect.backend.entity.Subject sub = subjectRepository.findById(alloc.getSubjectId()).orElse(null);
                        if (sub != null) {
                            if (sub.getDepartmentId() != null && deptId != null && !Objects.equals(sub.getDepartmentId(), deptId)) {
                                continue;
                            }
                            if (sub.getSemesterId() != null && semId != null && !Objects.equals(sub.getSemesterId(), semId)) {
                                continue;
                            }
                        }
                    }
                    eligibleAssignments.add(a);
                    continue;
                }
            }
            if (a.getSubjectId() != null && (subjectIds.isEmpty() || subjectIds.contains(a.getSubjectId()))) {
                eligibleAssignments.add(a);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Assignment a : eligibleAssignments) {
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
            map.put("file_path", a.getFilePath() != null ? a.getFilePath() : "");
            map.put("file_type", a.getFileType() != null ? a.getFileType() : "");
            map.put("file_size", a.getFileSize() != null ? a.getFileSize() : 0L);
            map.put("created_at", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");

            if (a.getSubjectId() != null) {
                subjectRepository.findById(a.getSubjectId()).ifPresent(sub -> {
                    map.put("subject_code", sub.getSubjectCode());
                    map.put("subject_name", sub.getSubjectName());
                });
            }

            // Check if student has already submitted this assignment
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
            }

            list.add(map);
        }

        list.sort((m1, m2) -> ((String) m2.get("created_at")).compareTo((String) m1.get("created_at")));
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
            finalEnrollmentNo = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }
        if (finalEnrollmentNo == null || finalEnrollmentNo.trim().isEmpty()) {
            throw new IllegalArgumentException("Authenticated student enrollment number is missing.");
        }

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(finalEnrollmentNo.trim());
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(finalEnrollmentNo.trim().toLowerCase());
        }
        if (studentOpt.isEmpty()) {
            throw new NoSuchElementException("Student record not found for enrollment: " + finalEnrollmentNo);
        }
        Student student = studentOpt.get();
        UUID studentId = student.getStudentId();

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found for ID: " + assignmentId));

        if (assignment.getTeacherSubjectId() != null) {
            TeacherSubject alloc = teacherSubjectRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
            if (alloc != null && alloc.getBatchId() != null && student.getBatchId() != null && !Objects.equals(alloc.getBatchId(), student.getBatchId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not in the permitted batch cohort for this assignment.");
            }
        }

        String attachmentVal = reqData != null && reqData.get("attachment") != null 
                ? (String) reqData.get("attachment") 
                : (reqData != null && reqData.get("fileName") != null ? (String) reqData.get("fileName") : "submission.pdf");

        String fileNameVal = reqData != null && reqData.get("fileName") != null 
                ? (String) reqData.get("fileName") 
                : (reqData != null && reqData.get("file_name") != null ? (String) reqData.get("file_name") : "submission.pdf");

        String filePathVal = reqData != null && reqData.get("filePath") != null 
                ? (String) reqData.get("filePath") 
                : (reqData != null && reqData.get("file_path") != null ? (String) reqData.get("file_path") : null);

        String fileTypeVal = reqData != null && reqData.get("fileType") != null 
                ? (String) reqData.get("fileType") 
                : (reqData != null && reqData.get("file_type") != null ? (String) reqData.get("file_type") : "application/pdf");

        Long fileSizeVal = null;
        if (reqData != null) {
            Object sz = reqData.containsKey("fileSize") ? reqData.get("fileSize") : reqData.get("file_size");
            if (sz instanceof Number) fileSizeVal = ((Number) sz).longValue();
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String calculatedStatus = "Timely";
        if (assignment.getDueDate() != null) {
            if (now.toLocalDate().isAfter(assignment.getDueDate())) {
                calculatedStatus = "Late";
            }
        }

        // Unique (assignment_id, student_id) active submission model
        List<AssignmentSubmission> existingList = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        AssignmentSubmission sub;
        if (!existingList.isEmpty()) {
            sub = existingList.get(0);
            sub.setAttachment(attachmentVal);
            if (fileNameVal != null) sub.setFileName(fileNameVal);
            if (filePathVal != null) sub.setFilePath(filePathVal);
            if (fileTypeVal != null) sub.setFileType(fileTypeVal);
            if (fileSizeVal != null) sub.setFileSize(fileSizeVal);
            sub.setSubmissionDate(now);
            sub.setSubmissionStatus(calculatedStatus);
            // Resubmission policy: reset prior grades on new file upload to prevent stale grades attached to replaced work
            sub.setObtainedMarks(null);
            sub.setFeedback(null);
            sub.setUpdatedAt(now);

            if (existingList.size() > 1) {
                submissionRepository.deleteAll(existingList.subList(1, existingList.size()));
            }
        } else {
            sub = new AssignmentSubmission();
            sub.setAssignmentId(assignmentId);
            sub.setStudentId(studentId);
            sub.setSubmissionDate(now);
            sub.setAttachment(attachmentVal);
            sub.setFileName(fileNameVal);
            sub.setFilePath(filePathVal);
            sub.setFileType(fileTypeVal);
            sub.setFileSize(fileSizeVal);
            sub.setSubmissionStatus(calculatedStatus);
            sub.setObtainedMarks(null);
            sub.setFeedback(null);
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
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
            if (studentOpt.isPresent()) {
                return mapStudentToProfileMap(studentOpt.get());
            }
        }
        return new HashMap<>();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDigitalID(String enrollmentNo) {
        String cleanIdentifier = enrollmentNo;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Student> studentOpt = Optional.empty();
        if (cleanIdentifier != null && !cleanIdentifier.trim().isEmpty()) {
            studentOpt = studentRepository.findByEnrollmentNo(cleanIdentifier.trim());
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(cleanIdentifier.trim());
            }
        }

        if (studentOpt.isEmpty()) {
            return Collections.emptyMap();
        }

        Student s = studentOpt.get();
        Map<String, Object> digitalIdMap = new HashMap<>();

        digitalIdMap.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : null);
        digitalIdMap.put("studentId", s.getStudentId() != null ? s.getStudentId().toString() : null);
        digitalIdMap.put("enrollment_no", s.getEnrollmentNo());
        digitalIdMap.put("enrollmentNo", s.getEnrollmentNo());
        digitalIdMap.put("first_name", s.getFirstName());
        digitalIdMap.put("last_name", s.getLastName());
        digitalIdMap.put("surname", s.getSurname());

        String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim();
        digitalIdMap.put("name", fullName.isEmpty() ? null : fullName);

        digitalIdMap.put("email", s.getEmail());
        digitalIdMap.put("mobile", s.getMobile() != null && !s.getMobile().trim().isEmpty() ? s.getMobile() : null);
        digitalIdMap.put("gender", s.getGender());
        digitalIdMap.put("address", s.getAddress() != null && !s.getAddress().trim().isEmpty() ? s.getAddress() : null);
        digitalIdMap.put("profile_photo", s.getProfilePhoto() != null && !s.getProfilePhoto().trim().isEmpty() ? s.getProfilePhoto() : null);
        digitalIdMap.put("blood_group", s.getBloodGroup() != null && !s.getBloodGroup().trim().isEmpty() ? s.getBloodGroup() : null);
        digitalIdMap.put("parent_name", s.getParentName() != null && !s.getParentName().trim().isEmpty() ? s.getParentName() : null);
        digitalIdMap.put("parent_mobile", s.getParentMobile() != null && !s.getParentMobile().trim().isEmpty() ? s.getParentMobile() : null);
        digitalIdMap.put("parent_email", s.getParentEmail() != null && !s.getParentEmail().trim().isEmpty() ? s.getParentEmail() : null);

        boolean isActive = Boolean.TRUE.equals(s.getIsActive());
        digitalIdMap.put("is_active", isActive);
        digitalIdMap.put("status", isActive ? "Active Student" : "Inactive Student");

        // Resolve Institute
        if (s.getInstituteId() != null) {
            instituteRepository.findById(s.getInstituteId()).ifPresent(inst -> {
                digitalIdMap.put("institute_id", inst.getInstituteId().toString());
                digitalIdMap.put("institute_name", inst.getInstituteName());
                digitalIdMap.put("institute_code", inst.getInstituteCode());
            });
        }
        if (!digitalIdMap.containsKey("institute_name")) {
            digitalIdMap.put("institute_name", null);
        }

        // Resolve Department
        if (s.getDepartmentId() != null) {
            departmentRepository.findById(s.getDepartmentId()).ifPresent(dept -> {
                digitalIdMap.put("department_id", dept.getDepartmentId().toString());
                digitalIdMap.put("department_name", dept.getDepartmentName());
                digitalIdMap.put("department_code", dept.getDepartmentCode());
                digitalIdMap.put("program_label", dept.getDepartmentName());
            });
        }
        if (!digitalIdMap.containsKey("department_name")) {
            digitalIdMap.put("department_name", null);
            digitalIdMap.put("program_label", null);
        }

        // Resolve Semester
        if (s.getSemesterId() != null) {
            semesterRepository.findById(s.getSemesterId()).ifPresent(sem -> {
                digitalIdMap.put("semester_id", sem.getSemesterId().toString());
                digitalIdMap.put("semester_name", sem.getSemesterName());
                digitalIdMap.put("semester_number", sem.getSemesterNumber());
            });
        }
        if (!digitalIdMap.containsKey("semester_name")) {
            digitalIdMap.put("semester_name", null);
        }

        // Resolve Batch & Validity Rule
        if (s.getBatchId() != null) {
            batchRepository.findById(s.getBatchId()).ifPresent(b -> {
                digitalIdMap.put("batch_id", b.getBatchId().toString());
                digitalIdMap.put("batch_name", b.getBatchName());
                digitalIdMap.put("start_year", b.getStartYear());
                digitalIdMap.put("end_year", b.getEndYear());
                if (b.getEndYear() != null) {
                    digitalIdMap.put("valid_until", "June " + b.getEndYear());
                    digitalIdMap.put("validity_date", "June " + b.getEndYear());
                }
            });
        }
        if (!digitalIdMap.containsKey("valid_until")) {
            digitalIdMap.put("valid_until", null);
            digitalIdMap.put("validity_date", null);
        }
        if (!digitalIdMap.containsKey("batch_name")) {
            digitalIdMap.put("batch_name", null);
        }

        return digitalIdMap;
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
        String cleanIdentifier = enrollmentNo;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(cleanIdentifier.trim());
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(cleanIdentifier.trim());
        }

        Student student = studentOpt.orElse(null);
        List<com.educonnect.backend.entity.Subject> studentSubjects = student != null
                ? getSubjectsForStudent(student.getEnrollmentNo())
                : Collections.emptyList();

        Set<UUID> subjectIds = studentSubjects.stream()
                .map(com.educonnect.backend.entity.Subject::getSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<WeeklyTest> tests = weeklyTestRepository.findAll().stream()
                .filter(wt -> wt.getSubjectId() != null && (subjectIds.isEmpty() || subjectIds.contains(wt.getSubjectId())))
                .toList();

        Set<UUID> publishedTestIds = new HashSet<>();
        List<Map<String, Object>> testList = new ArrayList<>();

        for (WeeklyTest wt : tests) {
            Map<String, Object> map = new HashMap<>();
            String testIdStr = wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "";
            boolean isPub = Boolean.TRUE.equals(wt.getIsPublished());
            if (isPub && wt.getWeeklyTestId() != null) {
                publishedTestIds.add(wt.getWeeklyTestId());
            }

            map.put("weekly_test_id", testIdStr);
            map.put("weekly_exam_id", testIdStr);
            map.put("teacher_subject_id", wt.getTeacherSubjectId() != null ? wt.getTeacherSubjectId().toString() : "");
            map.put("subject_id", wt.getSubjectId() != null ? wt.getSubjectId().toString() : "");
            map.put("title", wt.getTitle() != null ? wt.getTitle() : "");
            map.put("description", wt.getDescription() != null ? wt.getDescription() : "");
            String dateStr = wt.getTestDate() != null ? wt.getTestDate().toString() : "";
            map.put("test_date", dateStr);
            map.put("exam_date", dateStr);
            map.put("start_time", wt.getStartTime() != null ? wt.getStartTime().toString() : "10:00:00");
            map.put("end_time", wt.getEndTime() != null ? wt.getEndTime().toString() : "11:00:00");
            map.put("total_marks", wt.getTotalMarks() != null ? wt.getTotalMarks() : 25);
            map.put("is_published", isPub);
            map.put("created_at", wt.getCreatedAt() != null ? wt.getCreatedAt().toString() : "");

            if (wt.getSubjectId() != null) {
                subjectRepository.findById(wt.getSubjectId()).ifPresent(sub -> {
                    map.put("subject_code", sub.getSubjectCode());
                    map.put("subject_name", sub.getSubjectName());
                });
            }

            testList.add(map);
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        if (student != null) {
            List<WeeklyTestResult> dbResults = weeklyTestResultRepository.findByStudentId(student.getStudentId());
            for (WeeklyTestResult r : dbResults) {
                // Filter out draft (unpublished) test results for students!
                if (r.getWeeklyTestId() == null || !publishedTestIds.contains(r.getWeeklyTestId())) {
                    continue;
                }

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
    public List<com.educonnect.backend.entity.Subject> getSubjectsForStudent(String enrollmentNo) {
        if (enrollmentNo == null || enrollmentNo.trim().isEmpty()) {
            return Collections.emptyList();
        }
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }
        Student student = studentOpt.get();
        UUID deptId = student.getDepartmentId();
        UUID semId = student.getSemesterId();
        if (deptId == null && semId == null) {
            return Collections.emptyList();
        }
        return subjectRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .filter(s -> deptId == null || Objects.equals(s.getDepartmentId(), deptId))
                .filter(s -> semId == null || Objects.equals(s.getSemesterId(), semId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<com.educonnect.backend.entity.Batch> getBatchesForStudent(String enrollmentNo) {
        if (enrollmentNo == null || enrollmentNo.trim().isEmpty()) {
            return batchRepository.findByIsActiveTrue();
        }
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
        if (studentOpt.isPresent() && studentOpt.get().getBatchId() != null) {
            UUID batchId = studentOpt.get().getBatchId();
            return batchRepository.findAllById(Collections.singletonList(batchId)).stream()
                    .filter(b -> Boolean.TRUE.equals(b.getIsActive()))
                    .toList();
        }
        return batchRepository.findByIsActiveTrue();
    }
}
