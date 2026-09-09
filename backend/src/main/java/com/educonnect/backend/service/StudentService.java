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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAssignments(String enrollmentNo) {
        Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo);
        UUID studentId = studentOpt.map(Student::getStudentId).orElse(null);

        List<Assignment> assignments = assignmentRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Assignment a : assignments) {
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

            if (a.getSubjectId() != null) {
                subjectRepository.findById(a.getSubjectId()).ifPresent(sub -> {
                    map.put("subject_code", sub.getSubjectCode());
                    map.put("subject_name", sub.getSubjectName());
                });
            }

            // Check if student has already submitted this assignment
            List<AssignmentSubmission> subList = Collections.emptyList();
            if (a.getAssignmentId() != null) {
                if (studentId != null) {
                    subList = submissionRepository.findByAssignmentIdAndStudentId(a.getAssignmentId(), studentId);
                }
                if (subList.isEmpty()) {
                    List<AssignmentSubmission> allSubs = submissionRepository.findByAssignmentId(a.getAssignmentId());
                    if (!allSubs.isEmpty()) {
                        subList = allSubs;
                    }
                }
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
        List<WeeklyTest> tests = weeklyTestRepository.findAll();
        List<Map<String, Object>> testList = new ArrayList<>();
        for (WeeklyTest wt : tests) {
            Map<String, Object> map = new HashMap<>();
            String testIdStr = wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "";
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
            map.put("created_at", wt.getCreatedAt() != null ? wt.getCreatedAt().toString() : "");
            testList.add(map);
        }

        List<Map<String, Object>> resultList = new ArrayList<>();
        if (enrollmentNo != null && !enrollmentNo.trim().isEmpty()) {
            Optional<Student> studentOpt = studentRepository.findByEnrollmentNo(enrollmentNo.trim());
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
        }

        Map<String, Object> response = new HashMap<>();
        response.put("tests", testList);
        response.put("exams", testList);
        response.put("results", resultList);
        return response;
    }
}
