package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SemesterResultService {

    private final SemesterResultRepository semesterResultRepository;
    private final SemesterResultDetailRepository semesterResultDetailRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final DepartmentRepository departmentRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
    private final WeeklyTestRepository weeklyTestRepository;
    private final AdminRepository adminRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentMarksheet(String identifier, String semesterIdStr) {
        Student student = resolveStudentByIdentifier(identifier);
        if (student == null) {
            throw new NoSuchElementException("Student record not found.");
        }

        // Fetch student's department semesters
        List<Semester> semList = Collections.emptyList();
        if (student.getDepartmentId() != null) {
            semList = semesterRepository.findByDepartmentIdOrderBySemesterNumberAsc(student.getDepartmentId());
        }
        if (semList.isEmpty()) {
            semList = semesterRepository.findAll().stream()
                    .sorted(Comparator.comparingInt(Semester::getSemesterNumber))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> semesterDtos = new ArrayList<>();
        for (Semester s : semList) {
            Map<String, Object> semMap = new HashMap<>();
            semMap.put("semester_id", s.getSemesterId().toString());
            semMap.put("id", s.getSemesterId().toString());
            semMap.put("semester_number", s.getSemesterNumber());
            semMap.put("semester_name", s.getSemesterName());
            semesterDtos.add(semMap);
        }

        UUID selectedSemId = parseUuid(semesterIdStr);
        if (selectedSemId == null) {
            selectedSemId = student.getSemesterId();
        }
        if (selectedSemId == null && !semList.isEmpty()) {
            selectedSemId = semList.get(0).getSemesterId();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("semesters", semesterDtos);
        response.put("selectedSemesterId", selectedSemId != null ? selectedSemId.toString() : "");

        if (selectedSemId == null) {
            response.put("result", null);
            response.put("details", Collections.emptyList());
            response.put("weeklyResults", Collections.emptyList());
            return response;
        }

        // Fetch published result for selected semester
        Optional<SemesterResult> resultOpt = semesterResultRepository.findByStudentIdAndSemesterIdAndIsPublishedTrue(
                student.getStudentId(), selectedSemId);

        if (resultOpt.isEmpty()) {
            response.put("result", null);
            response.put("details", Collections.emptyList());
            response.put("weeklyResults", fetchStudentWeeklyResults(student.getStudentId()));
            return response;
        }

        SemesterResult result = resultOpt.get();
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("result_id", result.getResultId().toString());
        resultMap.put("id", result.getResultId().toString());
        resultMap.put("sgpa", result.getSgpa().setScale(2, RoundingMode.HALF_UP).toString());
        resultMap.put("cgpa", result.getCgpa().setScale(2, RoundingMode.HALF_UP).toString());
        resultMap.put("total_credits", result.getTotalCredits());
        resultMap.put("earned_credits", result.getEarnedCredits());
        resultMap.put("total_marks", result.getTotalMarks().setScale(2, RoundingMode.HALF_UP).toString());
        resultMap.put("obtained_marks", result.getObtainedMarks().setScale(2, RoundingMode.HALF_UP).toString());
        resultMap.put("percentage", result.getPercentage().setScale(2, RoundingMode.HALF_UP).toString());
        resultMap.put("result_status", result.getResultStatus());
        resultMap.put("published_at", result.getPublishedAt() != null ? result.getPublishedAt().toString() : "");
        response.put("result", resultMap);

        // Fetch details
        List<SemesterResultDetail> details = semesterResultDetailRepository.findByResultIdAndIsPublishedTrue(result.getResultId());
        Set<UUID> subIds = details.stream().map(SemesterResultDetail::getSubjectId).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        List<Map<String, Object>> detailDtos = new ArrayList<>();
        for (SemesterResultDetail d : details) {
            Subject sub = subjectMap.get(d.getSubjectId());
            Map<String, Object> dMap = new HashMap<>();
            dMap.put("semester_result_detail_id", d.getDetailId().toString());
            dMap.put("detail_id", d.getDetailId().toString());
            dMap.put("id", d.getDetailId().toString());
            dMap.put("subject_id", d.getSubjectId().toString());
            dMap.put("internal_marks", d.getInternalMarks().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("external_marks", d.getExternalMarks().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("obtained_marks", d.getObtainedMarks().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("total_marks", d.getTotalMarks().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("percentage", d.getPercentage().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("grade", d.getGrade());
            dMap.put("grade_point", d.getGradePoint().setScale(2, RoundingMode.HALF_UP).toString());
            dMap.put("result_status", d.getResultStatus());
            dMap.put("remarks", d.getRemarks() != null ? d.getRemarks() : (d.getResultStatus().equalsIgnoreCase("PASS") ? "Passed" : "Re-appear"));

            // Subj sub-object for Marksheet.jsx line 108 (`det.subj.subject_code`)
            Map<String, Object> subjMap = new HashMap<>();
            subjMap.put("subject_id", sub != null ? sub.getSubjectId().toString() : d.getSubjectId().toString());
            subjMap.put("subject_name", sub != null ? sub.getSubjectName() : "Subject");
            subjMap.put("subject_code", sub != null ? sub.getSubjectCode() : "SUB");
            subjMap.put("credits", sub != null && sub.getCredits() != null ? sub.getCredits() : d.getCredits());
            dMap.put("subj", subjMap);
            dMap.put("subject_name", sub != null ? sub.getSubjectName() : "Subject");
            dMap.put("subject_code", sub != null ? sub.getSubjectCode() : "SUB");
            dMap.put("credits", sub != null && sub.getCredits() != null ? sub.getCredits() : d.getCredits());

            detailDtos.add(dMap);
        }
        response.put("details", detailDtos);
        response.put("weeklyResults", fetchStudentWeeklyResults(student.getStudentId()));

        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherSubjectRoster(String teacherIdentifier, UUID subjectId, UUID semesterId) {
        Teacher teacher = resolveTeacherByIdentifier(teacherIdentifier);
        if (teacher == null) {
            throw new NoSuchElementException("Teacher record not found.");
        }

        validateTeacherSubjectAllocation(teacher.getTeacherId(), subjectId);

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found."));

        UUID effectiveSemId = semesterId != null ? semesterId : subject.getSemesterId();
        if (effectiveSemId == null) {
            throw new IllegalArgumentException("Semester ID is required.");
        }

        // Find students in subject's department/semester
        List<Student> students = studentRepository.findByDepartmentIdAndSemesterId(subject.getDepartmentId(), effectiveSemId);
        if (students.isEmpty()) {
            students = studentRepository.findByDepartmentId(subject.getDepartmentId());
        }

        List<SemesterResultDetail> existingDetails = semesterResultDetailRepository.findBySubjectIdAndSemesterId(subjectId, effectiveSemId);
        Map<UUID, SemesterResultDetail> detailMap = existingDetails.stream()
                .collect(Collectors.toMap(SemesterResultDetail::getStudentId, d -> d, (d1, d2) -> d1));

        List<Map<String, Object>> roster = new ArrayList<>();
        for (Student s : students) {
            SemesterResultDetail detail = detailMap.get(s.getStudentId());

            Map<String, Object> row = new HashMap<>();
            row.put("student_id", s.getStudentId().toString());
            row.put("enrollment_no", s.getEnrollmentNo());
            row.put("student_name", (s.getFirstName() + " " + s.getLastName()).trim());
            row.put("internal_marks", detail != null ? detail.getInternalMarks() : 0);
            row.put("external_marks", detail != null ? detail.getExternalMarks() : 0);
            row.put("obtained_marks", detail != null ? detail.getObtainedMarks() : 0);
            row.put("total_marks", detail != null ? detail.getTotalMarks() : 100);
            row.put("percentage", detail != null ? detail.getPercentage() : 0);
            row.put("grade", detail != null ? detail.getGrade() : "F");
            row.put("grade_point", detail != null ? detail.getGradePoint() : 0);
            row.put("result_status", detail != null ? detail.getResultStatus() : "PASS");
            row.put("remarks", detail != null && detail.getRemarks() != null ? detail.getRemarks() : "");
            roster.add(row);
        }
        return roster;
    }

    @Transactional
    public List<Map<String, Object>> saveTeacherSubjectMarks(String teacherIdentifier, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(teacherIdentifier);
        if (teacher == null) {
            throw new NoSuchElementException("Teacher record not found.");
        }

        UUID subjectId = parseRequiredUuid(body, "subject_id", "subjectId", "Subject");
        UUID semesterId = parseRequiredUuid(body, "semester_id", "semesterId", "Semester");

        validateTeacherSubjectAllocation(teacher.getTeacherId(), subjectId);

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with id: " + subjectId));

        int credits = subject.getCredits() != null && subject.getCredits() > 0 ? subject.getCredits() : 4;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> marksList = (List<Map<String, Object>>) body.get("marks");
        if (marksList == null || marksList.isEmpty()) {
            throw new IllegalArgumentException("Marks list cannot be empty.");
        }

        List<Map<String, Object>> updatedRows = new ArrayList<>();
        Set<UUID> affectedStudentIds = new HashSet<>();

        for (Map<String, Object> m : marksList) {
            UUID studentId = parseRequiredUuid(m, "student_id", "studentId", "Student");
            BigDecimal internal = parseBigDecimal(m.get("internal_marks"), "Internal marks");
            BigDecimal external = parseBigDecimal(m.get("external_marks"), "External marks");

            if (internal.compareTo(BigDecimal.ZERO) < 0 || internal.compareTo(new BigDecimal("40.00")) > 0) {
                throw new IllegalArgumentException("Internal marks must be between 0 and 40.");
            }
            if (external.compareTo(BigDecimal.ZERO) < 0 || external.compareTo(new BigDecimal("60.00")) > 0) {
                throw new IllegalArgumentException("External marks must be between 0 and 60.");
            }

            BigDecimal obtained = internal.add(external);
            BigDecimal total = new BigDecimal("100.00");
            BigDecimal pct = obtained.divide(total, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP);

            String grade = calculateGrade(pct);
            BigDecimal gradePoint = calculateGradePoint(pct);
            String status = pct.compareTo(new BigDecimal("40.00")) >= 0 ? "PASS" : "FAIL";
            String remarks = parseString(m.get("remarks"));

            SemesterResultDetail detail = semesterResultDetailRepository.findByStudentIdAndSubjectIdAndSemesterId(studentId, subjectId, semesterId)
                    .orElseGet(() -> SemesterResultDetail.builder()
                            .studentId(studentId)
                            .subjectId(subjectId)
                            .semesterId(semesterId)
                            .build());

            detail.setCredits(credits);
            detail.setInternalMarks(internal);
            detail.setExternalMarks(external);
            detail.setObtainedMarks(obtained);
            detail.setTotalMarks(total);
            detail.setPercentage(pct);
            detail.setGrade(grade);
            detail.setGradePoint(gradePoint);
            detail.setResultStatus(status);
            detail.setRemarks(remarks);

            SemesterResultDetail savedDetail = semesterResultDetailRepository.save(detail);
            affectedStudentIds.add(studentId);

            Map<String, Object> row = new HashMap<>();
            row.put("detail_id", savedDetail.getDetailId().toString());
            row.put("student_id", studentId.toString());
            row.put("obtained_marks", obtained.setScale(2, RoundingMode.HALF_UP).toString());
            row.put("percentage", pct.setScale(2, RoundingMode.HALF_UP).toString());
            row.put("grade", grade);
            row.put("grade_point", gradePoint.setScale(2, RoundingMode.HALF_UP).toString());
            row.put("result_status", status);
            updatedRows.add(row);
        }

        // Recalculate draft SemesterResult for each affected student
        for (UUID studentId : affectedStudentIds) {
            recalculateStudentSemesterResult(studentId, semesterId, subject.getDepartmentId());
        }

        return updatedRows;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAdminCohortResults(UUID departmentId, UUID semesterId) {
        List<SemesterResult> results = semesterResultRepository.findByDepartmentIdAndSemesterId(departmentId, semesterId);
        if (results.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> studentIds = results.stream().map(SemesterResult::getStudentId).collect(Collectors.toSet());
        Map<UUID, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getStudentId, s -> s));

        List<Map<String, Object>> list = new ArrayList<>();
        for (SemesterResult r : results) {
            Student s = studentMap.get(r.getStudentId());
            Map<String, Object> map = new HashMap<>();
            map.put("result_id", r.getResultId().toString());
            map.put("student_id", r.getStudentId().toString());
            map.put("enrollment_no", s != null ? s.getEnrollmentNo() : "");
            map.put("student_name", s != null ? (s.getFirstName() + " " + s.getLastName()).trim() : "Student");
            map.put("sgpa", r.getSgpa().setScale(2, RoundingMode.HALF_UP).toString());
            map.put("cgpa", r.getCgpa().setScale(2, RoundingMode.HALF_UP).toString());
            map.put("total_credits", r.getTotalCredits());
            map.put("earned_credits", r.getEarnedCredits());
            map.put("percentage", r.getPercentage().setScale(2, RoundingMode.HALF_UP).toString());
            map.put("result_status", r.getResultStatus());
            map.put("is_published", Boolean.TRUE.equals(r.getIsPublished()));
            map.put("published_at", r.getPublishedAt() != null ? r.getPublishedAt().toString() : "");
            list.add(map);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> publishCohortResults(String adminIdentifier, UUID departmentId, UUID semesterId) {
        Admin admin = resolveAdminByIdentifier(adminIdentifier);
        UUID adminId = admin != null ? admin.getAdminId() : null;

        List<SemesterResult> results = semesterResultRepository.findByDepartmentIdAndSemesterId(departmentId, semesterId);
        if (results.isEmpty()) {
            throw new IllegalArgumentException("No semester results found to publish for the selected cohort.");
        }

        LocalDateTime now = LocalDateTime.now();
        int publishedCount = 0;

        for (SemesterResult r : results) {
            r.setIsPublished(true);
            r.setPublishedAt(now);
            r.setPublishedBy(adminId);
            semesterResultRepository.save(r);

            List<SemesterResultDetail> details = semesterResultDetailRepository.findByResultId(r.getResultId());
            for (SemesterResultDetail d : details) {
                d.setIsPublished(true);
                semesterResultDetailRepository.save(d);
            }
            publishedCount++;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("published_count", publishedCount);
        res.put("published_at", now.toString());
        res.put("status", "SUCCESS");
        return res;
    }

    public void recalculateStudentSemesterResult(UUID studentId, UUID semesterId, UUID departmentId) {
        List<SemesterResultDetail> details = semesterResultDetailRepository.findByStudentIdAndSemesterId(studentId, semesterId);
        if (details.isEmpty()) return;

        int totalCredits = 0;
        int earnedCredits = 0;
        BigDecimal totalGradePoints = BigDecimal.ZERO;
        BigDecimal totalMarks = BigDecimal.ZERO;
        BigDecimal obtainedMarks = BigDecimal.ZERO;
        boolean hasFail = false;

        for (SemesterResultDetail d : details) {
            int c = d.getCredits() != null ? d.getCredits() : 4;
            totalCredits += c;
            BigDecimal gp = d.getGradePoint() != null ? d.getGradePoint() : BigDecimal.ZERO;

            if (!"F".equalsIgnoreCase(d.getGrade()) && c > 0) {
                earnedCredits += c;
            } else {
                hasFail = true;
            }

            totalGradePoints = totalGradePoints.add(gp.multiply(new BigDecimal(c)));
            totalMarks = totalMarks.add(d.getTotalMarks() != null ? d.getTotalMarks() : new BigDecimal("100.00"));
            obtainedMarks = obtainedMarks.add(d.getObtainedMarks() != null ? d.getObtainedMarks() : BigDecimal.ZERO);
        }

        BigDecimal sgpa = totalCredits > 0
                ? totalGradePoints.divide(new BigDecimal(totalCredits), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal percentage = totalMarks.compareTo(BigDecimal.ZERO) > 0
                ? obtainedMarks.divide(totalMarks, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String resultStatus = (earnedCredits == totalCredits && !hasFail) ? "PASS" : "FAIL";

        // Calculate CGPA including past results
        List<SemesterResult> pastResults = semesterResultRepository.findByStudentId(studentId);
        BigDecimal cgpaSum = sgpa;
        int cgpaSemCount = 1;
        for (SemesterResult pr : pastResults) {
            if (!pr.getSemesterId().equals(semesterId) && pr.getSgpa() != null) {
                cgpaSum = cgpaSum.add(pr.getSgpa());
                cgpaSemCount++;
            }
        }
        BigDecimal cgpa = cgpaSemCount > 0 ? cgpaSum.divide(new BigDecimal(cgpaSemCount), 2, RoundingMode.HALF_UP) : sgpa;

        SemesterResult result = semesterResultRepository.findByStudentIdAndSemesterId(studentId, semesterId)
                .orElseGet(() -> SemesterResult.builder()
                        .studentId(studentId)
                        .semesterId(semesterId)
                        .departmentId(departmentId)
                        .build());

        result.setSgpa(sgpa);
        result.setCgpa(cgpa);
        result.setTotalCredits(totalCredits);
        result.setEarnedCredits(earnedCredits);
        result.setTotalMarks(totalMarks);
        result.setObtainedMarks(obtainedMarks);
        result.setPercentage(percentage);
        result.setResultStatus(resultStatus);

        semesterResultRepository.save(result);
    }

    private String calculateGrade(BigDecimal pct) {
        if (pct.compareTo(new BigDecimal("90.00")) >= 0) return "O";
        if (pct.compareTo(new BigDecimal("80.00")) >= 0) return "A+";
        if (pct.compareTo(new BigDecimal("70.00")) >= 0) return "A";
        if (pct.compareTo(new BigDecimal("60.00")) >= 0) return "B+";
        if (pct.compareTo(new BigDecimal("55.00")) >= 0) return "B";
        if (pct.compareTo(new BigDecimal("50.00")) >= 0) return "C";
        if (pct.compareTo(new BigDecimal("40.00")) >= 0) return "P";
        return "F";
    }

    private BigDecimal calculateGradePoint(BigDecimal pct) {
        if (pct.compareTo(new BigDecimal("90.00")) >= 0) return new BigDecimal("10.00");
        if (pct.compareTo(new BigDecimal("80.00")) >= 0) return new BigDecimal("9.00");
        if (pct.compareTo(new BigDecimal("70.00")) >= 0) return new BigDecimal("8.00");
        if (pct.compareTo(new BigDecimal("60.00")) >= 0) return new BigDecimal("7.00");
        if (pct.compareTo(new BigDecimal("55.00")) >= 0) return new BigDecimal("6.00");
        if (pct.compareTo(new BigDecimal("50.00")) >= 0) return new BigDecimal("5.00");
        if (pct.compareTo(new BigDecimal("40.00")) >= 0) return new BigDecimal("4.00");
        return BigDecimal.ZERO;
    }

    private List<Map<String, Object>> fetchStudentWeeklyResults(UUID studentId) {
        List<WeeklyTestResult> wList = weeklyTestResultRepository.findByStudentId(studentId);
        if (wList.isEmpty()) return Collections.emptyList();

        Set<UUID> testIds = wList.stream().map(WeeklyTestResult::getWeeklyTestId).collect(Collectors.toSet());
        Map<UUID, WeeklyTest> testMap = weeklyTestRepository.findAllById(testIds).stream()
                .collect(Collectors.toMap(WeeklyTest::getWeeklyTestId, t -> t));

        List<Map<String, Object>> list = new ArrayList<>();
        for (WeeklyTestResult wr : wList) {
            WeeklyTest wt = testMap.get(wr.getWeeklyTestId());
            Map<String, Object> map = new HashMap<>();
            map.put("weekly_test_result_id", wr.getWeeklyTestResultId().toString());
            map.put("obtained_marks", wr.getObtainedMarks());
            map.put("grade", wr.getGrade() != null ? wr.getGrade() : "P");
            map.put("remarks", wr.getRemarks() != null ? wr.getRemarks() : "");

            Map<String, Object> testObj = new HashMap<>();
            testObj.put("title", wt != null ? wt.getTitle() : "Weekly Exam");
            testObj.put("test_date", wt != null ? wt.getTestDate().toString() : "");
            testObj.put("total_marks", wt != null ? wt.getTotalMarks() : 25);
            map.put("test", testObj);

            list.add(map);
        }
        return list;
    }

    private Student resolveStudentByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Student> opt = studentRepository.findByEnrollmentNo(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = studentRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return studentRepository.findById(UUID.fromString(cleanId)).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Teacher resolveTeacherByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Teacher> opt = teacherRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        opt = teacherRepository.findByEmployeeId(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return teacherRepository.findById(UUID.fromString(cleanId)).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private Admin resolveAdminByIdentifier(String identifier) {
        String cleanId = identifier != null && !identifier.trim().isEmpty()
                ? identifier.trim()
                : SecurityUtils.getCurrentUserIdentifier();

        Optional<Admin> opt = adminRepository.findByEmail(cleanId);
        if (opt.isPresent()) return opt.get();
        try {
            return adminRepository.findById(UUID.fromString(cleanId)).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private void validateTeacherSubjectAllocation(UUID teacherId, UUID subjectId) {
        if (SecurityUtils.isAdmin()) return;
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        boolean authorized = allocations.stream().anyMatch(a -> Objects.equals(a.getSubjectId(), subjectId));
        if (!authorized && !allocations.isEmpty()) {
            throw new AccessDeniedException("Access Denied: You are not authorized to manage marks for this subject.");
        }
    }

    private UUID parseRequiredUuid(Map<String, Object> body, String key1, String key2, String fieldLabel) {
        UUID val = parseUuid(body.get(key1));
        if (val == null) val = parseUuid(body.get(key2));
        if (val == null) {
            throw new IllegalArgumentException(fieldLabel + " is required.");
        }
        return val;
    }

    private UUID parseUuid(Object obj) {
        if (obj == null) return null;
        if (obj instanceof UUID) return (UUID) obj;
        String str = obj.toString().trim();
        if (str.isEmpty()) return null;
        try {
            return UUID.fromString(str);
        } catch (Exception e) {
            return null;
        }
    }

    private String parseString(Object obj) {
        return obj != null ? obj.toString().trim() : null;
    }

    private BigDecimal parseBigDecimal(Object obj, String fieldLabel) {
        if (obj == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(obj.toString().trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid numeric value for " + fieldLabel + ".");
        }
    }
}
