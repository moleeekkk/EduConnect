package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentLeaveRequests(String identifier) {
        Student student = resolveStudentByIdentifier(identifier);
        List<LeaveRequest> requests = leaveRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getStudentId());

        if (requests.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> reviewerIds = requests.stream().map(LeaveRequest::getReviewedBy).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Teacher> reviewerMap = teacherRepository.findAllById(reviewerIds).stream()
                .collect(Collectors.toMap(Teacher::getTeacherId, t -> t));

        List<Map<String, Object>> result = new ArrayList<>();
        for (LeaveRequest req : requests) {
            result.add(mapLeaveToStudentMap(req, reviewerMap.get(req.getReviewedBy())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createStudentLeaveRequest(String identifier, Map<String, Object> body) {
        Student student = resolveStudentByIdentifier(identifier);

        String leaveType = parseString(body.get("leave_type"));
        if (leaveType == null || (!Arrays.asList("Sick", "Personal", "Emergency", "Other").contains(leaveType))) {
            leaveType = "Sick";
        }

        String fromDateStr = parseString(body.get("from_date"));
        String toDateStr = parseString(body.get("to_date"));
        if (fromDateStr == null || toDateStr == null) {
            throw new IllegalArgumentException("From Date and To Date are required.");
        }

        LocalDate fromDate;
        LocalDate toDate;
        try {
            fromDate = LocalDate.parse(fromDateStr);
            toDate = LocalDate.parse(toDateStr);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD.");
        }

        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("To Date cannot be earlier than From Date.");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(fromDate, toDate) + 1;

        String reason = parseString(body.get("reason"));
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason for leave request is required.");
        }
        if (reason.trim().length() > 2000) {
            throw new IllegalArgumentException("Reason exceeds maximum length of 2000 characters.");
        }

        // Check overlapping active leave requests
        List<LeaveRequest> overlaps = leaveRequestRepository.findByStudentIdAndStatusNotAndFromDateLessThanEqualAndToDateGreaterThanEqual(
                student.getStudentId(), "Rejected", toDate, fromDate);
        if (!overlaps.isEmpty()) {
            throw new IllegalArgumentException("An active leave request already exists covering the selected date range.");
        }

        LeaveRequest request = LeaveRequest.builder()
                .studentId(student.getStudentId())
                .departmentId(student.getDepartmentId())
                .semesterId(student.getSemesterId())
                .batchId(student.getBatchId())
                .leaveType(leaveType)
                .fromDate(fromDate)
                .toDate(toDate)
                .totalDays(totalDays)
                .reason(reason.trim())
                .status("Pending")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(request);
        return mapLeaveToStudentMap(saved, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherLeaveRequests(String identifier) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        List<UUID> subjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toList());
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);

        List<UUID> deptIds = subjects.stream().map(Subject::getDepartmentId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        List<UUID> semIds = allocations.stream().map(TeacherSubject::getSemesterId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        if (semIds.isEmpty()) {
            semIds = subjects.stream().map(Subject::getSemesterId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        }

        List<LeaveRequest> requests;
        if (!deptIds.isEmpty() && !semIds.isEmpty()) {
            requests = leaveRequestRepository.findByDepartmentIdInAndSemesterIdInOrderByCreatedAtDesc(deptIds, semIds);
        } else {
            requests = leaveRequestRepository.findAll();
        }

        if (requests.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> studentIds = requests.stream().map(LeaveRequest::getStudentId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getStudentId, s -> s));

        Set<UUID> reviewerIds = requests.stream().map(LeaveRequest::getReviewedBy).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Teacher> reviewerMap = teacherRepository.findAllById(reviewerIds).stream()
                .collect(Collectors.toMap(Teacher::getTeacherId, t -> t));

        List<Map<String, Object>> result = new ArrayList<>();
        for (LeaveRequest req : requests) {
            result.add(mapLeaveToTeacherMap(req, studentMap.get(req.getStudentId()), reviewerMap.get(req.getReviewedBy())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> updateTeacherLeaveStatus(String identifier, UUID requestId, Map<String, Object> body) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Leave request not found with id: " + requestId));

        // State transition lock: Prevent duplicate review or concurrent overwrite of final decision
        if (!"Pending".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("Leave application has already been reviewed (" + request.getStatus() + ") and cannot be modified.");
        }

        validateTeacherCohortAuthority(teacher.getTeacherId(), request);

        String targetStatus = parseString(body.get("status"));
        if (targetStatus == null || (!targetStatus.equalsIgnoreCase("Approved") && !targetStatus.equalsIgnoreCase("Rejected"))) {
            throw new IllegalArgumentException("Invalid status choice. Expected Approved or Rejected.");
        }
        targetStatus = targetStatus.substring(0, 1).toUpperCase() + targetStatus.substring(1).toLowerCase();

        String remarks = parseString(body.get("remarks"));
        if (remarks == null) {
            remarks = targetStatus.equalsIgnoreCase("Approved") ? "Approved." : "Rejected.";
        }

        request.setStatus(targetStatus);
        request.setReviewedBy(teacher.getTeacherId());
        request.setReviewedDate(LocalDate.now());
        request.setRemarks(remarks.trim());

        LeaveRequest saved = leaveRequestRepository.save(request);

        Student student = studentRepository.findById(saved.getStudentId()).orElse(null);
        return mapLeaveToTeacherMap(saved, student, teacher);
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
            return studentRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Student record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Student record not found for: " + cleanId);
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
            return teacherRepository.findById(UUID.fromString(cleanId))
                    .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + cleanId));
        } catch (Exception e) {
            throw new NoSuchElementException("Teacher record not found for: " + cleanId);
        }
    }

    private void validateTeacherCohortAuthority(UUID teacherId, LeaveRequest request) {
        if (SecurityUtils.isAdmin()) return;

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        List<UUID> subjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toList());
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        Map<UUID, Subject> subjectMap = subjects.stream().collect(Collectors.toMap(Subject::getSubjectId, s -> s, (s1, s2) -> s1));

        boolean authorized = allocations.stream().anyMatch(a -> {
            Subject s = subjectMap.get(a.getSubjectId());
            UUID deptId = s != null ? s.getDepartmentId() : null;
            UUID semId = a.getSemesterId() != null ? a.getSemesterId() : (s != null ? s.getSemesterId() : null);
            return Objects.equals(deptId, request.getDepartmentId()) && Objects.equals(semId, request.getSemesterId());
        });

        if (!authorized && !allocations.isEmpty()) {
            // Check department match
            authorized = allocations.stream().anyMatch(a -> {
                Subject s = subjectMap.get(a.getSubjectId());
                UUID deptId = s != null ? s.getDepartmentId() : null;
                return Objects.equals(deptId, request.getDepartmentId());
            });
        }

        if (!authorized && !allocations.isEmpty()) {
            throw new AccessDeniedException("Access denied: You are not an authorized reviewer for this student's cohort.");
        }
    }

    private Map<String, Object> mapLeaveToStudentMap(LeaveRequest r, Teacher reviewer) {
        Map<String, Object> map = new HashMap<>();
        String reqIdStr = r.getLeaveRequestId().toString();
        map.put("leave_request_id", reqIdStr);
        map.put("id", reqIdStr);
        map.put("student_id", r.getStudentId().toString());
        map.put("leave_type", r.getLeaveType());
        map.put("from_date", r.getFromDate().toString());
        map.put("to_date", r.getToDate().toString());
        map.put("total_days", r.getTotalDays());
        map.put("reason", r.getReason());
        map.put("status", r.getStatus());
        map.put("reviewed_by", reviewer != null ? (reviewer.getFirstName() + " " + reviewer.getLastName()).trim() : null);
        map.put("reviewed_date", r.getReviewedDate() != null ? r.getReviewedDate().toString() : null);
        map.put("remarks", r.getRemarks());
        map.put("created_at", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapLeaveToTeacherMap(LeaveRequest r, Student stu, Teacher reviewer) {
        Map<String, Object> map = new HashMap<>();
        String reqIdStr = r.getLeaveRequestId().toString();
        map.put("leave_request_id", reqIdStr);
        map.put("id", reqIdStr);
        map.put("student_id", r.getStudentId().toString());
        map.put("student_name", stu != null ? (stu.getFirstName() + " " + stu.getLastName()).trim() : "Student");
        map.put("enrollment_no", stu != null && stu.getEnrollmentNo() != null ? stu.getEnrollmentNo() : "");
        map.put("leave_type", r.getLeaveType());
        map.put("from_date", r.getFromDate().toString());
        map.put("to_date", r.getToDate().toString());
        map.put("total_days", r.getTotalDays());
        map.put("reason", r.getReason());
        map.put("status", r.getStatus());
        map.put("reviewed_by", reviewer != null ? (reviewer.getFirstName() + " " + reviewer.getLastName()).trim() : null);
        map.put("reviewed_date", r.getReviewedDate() != null ? r.getReviewedDate().toString() : null);
        map.put("remarks", r.getRemarks());
        map.put("created_at", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
        return map;
    }

    private String parseString(Object obj) {
        if (obj == null) return null;
        String s = String.valueOf(obj);
        return s.trim().isEmpty() ? null : s.trim();
    }
}
