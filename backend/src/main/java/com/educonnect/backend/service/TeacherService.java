package com.educonnect.backend.service;

import com.educonnect.backend.dto.AttendanceMarkRequest;
import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.entity.Batch;
import com.educonnect.backend.entity.Department;
import com.educonnect.backend.entity.Semester;
import com.educonnect.backend.entity.Student;
import com.educonnect.backend.entity.Teacher;
import com.educonnect.backend.entity.TeacherSubject;
import com.educonnect.backend.entity.Subject;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.entity.WeeklyTest;
import com.educonnect.backend.entity.WeeklyTestResult;
import com.educonnect.backend.repository.WeeklyTestRepository;
import com.educonnect.backend.repository.WeeklyTestResultRepository;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import com.educonnect.backend.repository.BatchRepository;
import com.educonnect.backend.repository.StudentRepository;
import com.educonnect.backend.repository.SubjectRepository;
import com.educonnect.backend.repository.TeacherRepository;
import com.educonnect.backend.repository.TeacherSubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final WeeklyTestRepository weeklyTestRepository;
    private final WeeklyTestResultRepository weeklyTestResultRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;

    private Optional<Teacher> resolveTeacherByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String clean = identifier.trim();
        try {
            UUID uuid = UUID.fromString(clean);
            Optional<Teacher> tOpt = teacherRepository.findById(uuid);
            if (tOpt.isPresent()) return tOpt;
        } catch (IllegalArgumentException ignored) {}
        return teacherRepository.findByEmail(clean.toLowerCase());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignmentsForTeacher(String identifier) {
        Optional<Teacher> teacherOpt = resolveTeacherByIdentifier(identifier);
        if (teacherOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Teacher teacher = teacherOpt.get();
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        if (allocations.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> allocationIds = allocations.stream()
                .map(TeacherSubject::getAllocationId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> subjectIds = allocations.stream()
                .map(TeacherSubject::getSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Assignment> assignments = assignmentRepository.findAll().stream()
                .filter(a -> (a.getTeacherSubjectId() != null && allocationIds.contains(a.getTeacherSubjectId()))
                        || (a.getSubjectId() != null && subjectIds.contains(a.getSubjectId())))
                .toList();

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

            // Calculate cohort student roster size specifically for this assignment's allocation
            UUID allocId = a.getTeacherSubjectId();
            List<Student> cohortStudents = getStudentsForAllocation(allocId);
            int cohortSize = cohortStudents.size();

            if (a.getAssignmentId() != null) {
                List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(a.getAssignmentId());
                int timely = 0;
                int late = 0;
                for (AssignmentSubmission sub : subs) {
                    String status = sub.getSubmissionStatus();
                    if (status == null || "Submitted".equalsIgnoreCase(status) || "Graded".equalsIgnoreCase(status)) {
                        if (a.getDueDate() != null && sub.getSubmissionDate() != null && sub.getSubmissionDate().toLocalDate().isAfter(a.getDueDate())) {
                            status = "Late";
                        } else {
                            status = "Timely";
                        }
                    }
                    if ("Late".equalsIgnoreCase(status)) {
                        late++;
                    } else {
                        timely++;
                    }
                }
                int missed = Math.max(0, cohortSize - (timely + late));
                map.put("timely_count", timely);
                map.put("late_count", late);
                map.put("missed_count", missed);
                map.put("total_submissions", subs.size());
            } else {
                map.put("timely_count", 0);
                map.put("late_count", 0);
                map.put("missed_count", cohortSize);
                map.put("total_submissions", 0);
            }

            list.add(map);
        }

        list.sort((m1, m2) -> ((String) m2.get("created_at")).compareTo((String) m1.get("created_at")));
        return list;
    }

    @Transactional
    public Assignment createAssignment(Map<String, Object> reqData, String identifier) {
        String cleanIdentifier = identifier;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        String title = (String) reqData.get("title");
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Assignment title is required.");
        }

        LocalDate dueDate;
        if (reqData.get("due_date") != null && !((String) reqData.get("due_date")).trim().isEmpty()) {
            try {
                dueDate = LocalDate.parse(((String) reqData.get("due_date")).trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid due_date format. Expected YYYY-MM-DD.");
            }
        } else {
            throw new IllegalArgumentException("Due date is required.");
        }

        Integer totalMarks = 50;
        if (reqData.get("total_marks") != null) {
            Object marksObj = reqData.get("total_marks");
            if (marksObj instanceof Number) totalMarks = ((Number) marksObj).intValue();
            else if (marksObj instanceof String) {
                try { totalMarks = Integer.parseInt((String) marksObj); } catch (Exception ignored) {}
            }
        }
        if (totalMarks <= 0) {
            throw new IllegalArgumentException("Total marks must be a positive integer.");
        }

        UUID teacherSubjectId = null;
        UUID subjectId = null;

        if (reqData.get("teacher_subject_id") != null && !((String) reqData.get("teacher_subject_id")).trim().isEmpty()) {
            try {
                teacherSubjectId = UUID.fromString(((String) reqData.get("teacher_subject_id")).trim());
            } catch (Exception ignored) {}
        }

        if (reqData.get("subject_id") != null && !((String) reqData.get("subject_id")).trim().isEmpty()) {
            try {
                subjectId = UUID.fromString(((String) reqData.get("subject_id")).trim());
            } catch (Exception ignored) {}
        }

        TeacherSubject allocation = null;
        if (teacherSubjectId != null) {
            final UUID tsId = teacherSubjectId;
            allocation = teacherSubjectRepository.findById(tsId)
                    .orElseThrow(() -> new NoSuchElementException("Subject allocation not found for ID: " + tsId));
        } else if (subjectId != null) {
            List<TeacherSubject> allocs = teacherSubjectRepository.findByTeacherIdAndSubjectIdAndIsActiveTrue(teacher.getTeacherId(), subjectId);
            if (!allocs.isEmpty()) {
                allocation = allocs.get(0);
            }
        }

        if (allocation == null) {
            throw new IllegalArgumentException("Valid active teacher subject allocation is required to publish an assignment.");
        }

        if (!Objects.equals(allocation.getTeacherId(), teacher.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to publish assignments for this subject allocation.");
        }

        if (subjectId != null && !Objects.equals(allocation.getSubjectId(), subjectId)) {
            throw new IllegalArgumentException("Inconsistent subject and allocation combination.");
        }

        Assignment assignment = new Assignment();
        assignment.setTeacherSubjectId(allocation.getAllocationId());
        assignment.setSubjectId(allocation.getSubjectId());
        assignment.setTitle(title.trim());
        assignment.setDescription((String) reqData.get("description"));
        assignment.setDueDate(dueDate);
        assignment.setTotalMarks(totalMarks);

        assignment.setAttachment((String) reqData.get("attachment"));
        String fn = (String) reqData.get("file_name");
        if (fn == null) fn = (String) reqData.get("fileName");
        assignment.setFileName(fn);

        String fp = (String) reqData.get("file_path");
        if (fp == null) fp = (String) reqData.get("filePath");
        assignment.setFilePath(fp);

        String ft = (String) reqData.get("file_type");
        if (ft == null) ft = (String) reqData.get("fileType");
        assignment.setFileType(ft);

        Object fsObj = reqData.containsKey("file_size") ? reqData.get("file_size") : reqData.get("fileSize");
        if (fsObj instanceof Number) assignment.setFileSize(((Number) fsObj).longValue());

        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment createAssignment(Map<String, Object> reqData) {
        return createAssignment(reqData, null);
    }

    @Transactional
    public Assignment updateAssignment(UUID id, Map<String, Object> reqData, String identifier) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found for ID: " + id));

        String cleanIdentifier = identifier;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        if (assignment.getTeacherSubjectId() != null) {
            TeacherSubject alloc = teacherSubjectRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
            if (alloc != null && !Objects.equals(alloc.getTeacherId(), teacher.getTeacherId())) {
                throw new AccessDeniedException("Access denied: You cannot edit an assignment published by another teacher.");
            }
        }

        if (reqData.containsKey("title") && reqData.get("title") != null) {
            String title = (String) reqData.get("title");
            if (title.trim().isEmpty()) {
                throw new IllegalArgumentException("Assignment title cannot be empty.");
            }
            assignment.setTitle(title.trim());
        }

        if (reqData.containsKey("description")) {
            assignment.setDescription((String) reqData.get("description"));
        }

        if (reqData.get("due_date") != null && !((String) reqData.get("due_date")).trim().isEmpty()) {
            try {
                assignment.setDueDate(LocalDate.parse(((String) reqData.get("due_date")).trim()));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid due_date format. Expected YYYY-MM-DD.");
            }
        }

        if (reqData.get("total_marks") != null) {
            Object marksObj = reqData.get("total_marks");
            Integer tm = null;
            if (marksObj instanceof Number) tm = ((Number) marksObj).intValue();
            else if (marksObj instanceof String) {
                try { tm = Integer.parseInt((String) marksObj); } catch (Exception ignored) {}
            }
            if (tm != null && tm > 0) {
                assignment.setTotalMarks(tm);
            }
        }

        String newAttachment = (String) reqData.get("attachment");
        String newFileName = reqData.containsKey("file_name") ? (String) reqData.get("file_name") : (String) reqData.get("fileName");
        if (newAttachment != null && !newAttachment.trim().isEmpty()) {
            assignment.setAttachment(newAttachment);
        }
        if (newFileName != null && !newFileName.trim().isEmpty()) {
            assignment.setFileName(newFileName);
        }

        String newFilePath = reqData.containsKey("file_path") ? (String) reqData.get("file_path") : (String) reqData.get("filePath");
        if (newFilePath != null && !newFilePath.trim().isEmpty()) {
            assignment.setFilePath(newFilePath);
        }

        String newFileType = reqData.containsKey("file_type") ? (String) reqData.get("file_type") : (String) reqData.get("fileType");
        if (newFileType != null && !newFileType.trim().isEmpty()) {
            assignment.setFileType(newFileType);
        }

        Object uFsObj = reqData.containsKey("file_size") ? reqData.get("file_size") : reqData.get("fileSize");
        if (uFsObj instanceof Number) assignment.setFileSize(((Number) uFsObj).longValue());

        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment updateAssignment(UUID id, Map<String, Object> reqData) {
        return updateAssignment(id, reqData, null);
    }

    @Transactional
    public void deleteAssignment(UUID id, String identifier) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found for ID: " + id));

        String cleanIdentifier = identifier;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        if (assignment.getTeacherSubjectId() != null) {
            TeacherSubject alloc = teacherSubjectRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
            if (alloc != null && !Objects.equals(alloc.getTeacherId(), teacher.getTeacherId())) {
                throw new AccessDeniedException("Access denied: You cannot delete an assignment published by another teacher.");
            }
        }

        List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(id);
        if (!subs.isEmpty()) {
            throw new IllegalStateException("Cannot delete assignment: Academic records exist with " + subs.size() + " active student submission(s). Submissions must be preserved for academic audit.");
        }

        assignmentRepository.delete(assignment);
    }

    @Transactional
    public void deleteAssignment(UUID id) {
        deleteAssignment(id, null);
    }

    @Transactional(readOnly = true)
    public List<Subject> getAssignedSubjectsForTeacher(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Optional<Teacher> teacherOpt = resolveTeacherByIdentifier(identifier);
        if (teacherOpt.isEmpty()) {
            return Collections.emptyList();
        }

        UUID teacherId = teacherOpt.get().getTeacherId();
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        if (allocations.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> assignedSubjectIds = allocations.stream()
                .map(TeacherSubject::getSubjectId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (assignedSubjectIds.isEmpty()) {
            return Collections.emptyList();
        }

        return subjectRepository.findAllById(assignedSubjectIds).stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsForTeacher(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Optional<Teacher> teacherOpt = resolveTeacherByIdentifier(identifier);
        if (teacherOpt.isEmpty()) {
            return Collections.emptyList();
        }

        UUID teacherId = teacherOpt.get().getTeacherId();
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        if (allocations.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Student> permittedStudents = new LinkedHashSet<>();

        for (TeacherSubject alloc : allocations) {
            if (alloc.getSubjectId() == null) continue;

            Optional<Subject> subjOpt = subjectRepository.findById(alloc.getSubjectId());
            if (subjOpt.isEmpty() || Boolean.FALSE.equals(subjOpt.get().getIsActive())) {
                continue;
            }

            Subject subject = subjOpt.get();
            UUID deptId = subject.getDepartmentId();
            UUID semId = subject.getSemesterId();
            UUID batchId = alloc.getBatchId();

            if (deptId == null && semId == null && batchId == null) {
                log.warn("Legacy allocation {} lacks safe cohort mapping.", alloc.getAllocationId());
                continue;
            }

            List<Student> cohortStudents = studentRepository.findAll().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                    .filter(s -> deptId == null || Objects.equals(s.getDepartmentId(), deptId))
                    .filter(s -> semId == null || Objects.equals(s.getSemesterId(), semId))
                    .filter(s -> batchId == null || Objects.equals(s.getBatchId(), batchId))
                    .toList();

            permittedStudents.addAll(cohortStudents);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Student s : permittedStudents) {
            Map<String, Object> map = new HashMap<>();
            map.put("student_id", s.getStudentId() != null ? s.getStudentId().toString() : "");
            map.put("enrollment_no", s.getEnrollmentNo() != null ? s.getEnrollmentNo() : "");
            map.put("first_name", s.getFirstName() != null ? s.getFirstName() : "");
            map.put("last_name", s.getLastName() != null ? s.getLastName() : "");
            map.put("surname", s.getSurname() != null ? s.getSurname() : "");
            map.put("email", s.getEmail() != null ? s.getEmail() : "");
            map.put("mobile", s.getMobile() != null ? s.getMobile() : "");
            map.put("gender", s.getGender() != null ? s.getGender() : "Male");
            map.put("date_of_birth", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
            map.put("address", s.getAddress() != null ? s.getAddress() : "");
            map.put("profile_photo", s.getProfilePhoto() != null ? s.getProfilePhoto() : "");
            map.put("department_id", s.getDepartmentId() != null ? s.getDepartmentId().toString() : "");
            map.put("semester_id", s.getSemesterId() != null ? s.getSemesterId().toString() : "");
            map.put("batch_id", s.getBatchId() != null ? s.getBatchId().toString() : "");
            map.put("parent_name", s.getParentName() != null ? s.getParentName() : "");
            map.put("parent_mobile", s.getParentMobile() != null ? s.getParentMobile() : "");
            map.put("parent_email", s.getParentEmail() != null ? s.getParentEmail() : "");
            map.put("blood_group", s.getBloodGroup() != null ? s.getBloodGroup() : "");
            map.put("is_active", s.getIsActive() != null ? s.getIsActive() : true);
            result.add(map);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsForAllocation(UUID allocationId) {
        if (allocationId == null) {
            return Collections.emptyList();
        }
        Optional<TeacherSubject> allocOpt = teacherSubjectRepository.findById(allocationId);
        if (allocOpt.isEmpty()) {
            return Collections.emptyList();
        }
        TeacherSubject alloc = allocOpt.get();
        if (alloc.getSubjectId() == null) {
            return Collections.emptyList();
        }
        Optional<Subject> subjOpt = subjectRepository.findById(alloc.getSubjectId());
        if (subjOpt.isEmpty()) {
            return Collections.emptyList();
        }
        Subject subject = subjOpt.get();
        UUID deptId = subject.getDepartmentId();
        UUID semId = subject.getSemesterId();
        UUID batchId = alloc.getBatchId();

        return studentRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .filter(s -> deptId == null || Objects.equals(s.getDepartmentId(), deptId))
                .filter(s -> semId == null || Objects.equals(s.getSemesterId(), semId))
                .filter(s -> batchId == null || Objects.equals(s.getBatchId(), batchId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Batch> getAssignedBatchesForTeacher(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Optional<Teacher> teacherOpt = resolveTeacherByIdentifier(identifier);
        if (teacherOpt.isEmpty()) {
            return Collections.emptyList();
        }

        UUID teacherId = teacherOpt.get().getTeacherId();
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        if (allocations.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> batchIds = new HashSet<>();
        for (TeacherSubject alloc : allocations) {
            if (alloc.getBatchId() != null) {
                batchIds.add(alloc.getBatchId());
            }
        }

        if (batchIds.isEmpty()) {
            return batchRepository.findByIsActiveTrue();
        }

        return batchRepository.findAllById(batchIds).stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> getTeacherById(UUID id) {
        return teacherRepository.findById(id);
    }

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        teacher.setTeacherId(null);
        if (teacher.getIsActive() == null) {
            teacher.setIsActive(true);
        }
        String rawPass = (teacher.getPassword() == null || teacher.getPassword().trim().isEmpty())
                ? "teacher123"
                : teacher.getPassword().trim();
        teacher.setPassword(passwordEncoder.encode(rawPass));
        if (teacher.getFirstName() == null || teacher.getFirstName().trim().isEmpty()) {
            teacher.setFirstName("Faculty");
        }
        if (teacher.getLastName() == null) {
            teacher.setLastName("");
        }
        if (teacher.getEmployeeId() == null || teacher.getEmployeeId().trim().isEmpty()) {
            teacher.setEmployeeId("EMP" + (System.currentTimeMillis() % 100000));
        }
        if (teacher.getEmail() == null || teacher.getEmail().trim().isEmpty() || !teacher.getEmail().contains("@")) {
            teacher.setEmail("teacher" + (System.currentTimeMillis() % 10000) + "@educonnect.ac.in");
        } else if (teacherRepository.existsByEmail(teacher.getEmail())) {
            String[] parts = teacher.getEmail().split("@");
            teacher.setEmail(parts[0] + "+" + (System.currentTimeMillis() % 10000) + "@" + (parts.length > 1 ? parts[1] : "educonnect.ac.in"));
        }
        if (teacher.getMobile() == null || teacher.getMobile().trim().isEmpty()) teacher.setMobile("N/A");
        if (teacher.getGender() == null || teacher.getGender().trim().isEmpty()) teacher.setGender("Male");
        if (teacher.getDesignation() == null || teacher.getDesignation().trim().isEmpty()) teacher.setDesignation("Assistant Professor");
        if (teacher.getQualification() == null) teacher.setQualification("");
        if (teacher.getExperience() == null) teacher.setExperience(0);
        if (teacher.getAddress() == null) teacher.setAddress("");
        if (teacher.getCreatedAt() == null) teacher.setCreatedAt(java.time.LocalDateTime.now());
        if (teacher.getUpdatedAt() == null) teacher.setUpdatedAt(java.time.LocalDateTime.now());

        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(UUID id, Teacher updatedTeacher) {
        return teacherRepository.findById(id).map(existing -> {
            if (updatedTeacher.getEmployeeId() != null && !updatedTeacher.getEmployeeId().trim().isEmpty()) {
                existing.setEmployeeId(updatedTeacher.getEmployeeId());
            }
            if (updatedTeacher.getFirstName() != null && !updatedTeacher.getFirstName().trim().isEmpty()) {
                existing.setFirstName(updatedTeacher.getFirstName());
            }
            if (updatedTeacher.getLastName() != null) {
                existing.setLastName(updatedTeacher.getLastName());
            }
            if (updatedTeacher.getSurname() != null) {
                existing.setSurname(updatedTeacher.getSurname());
            }
            if (updatedTeacher.getEmail() != null && !updatedTeacher.getEmail().trim().isEmpty() && !updatedTeacher.getEmail().equals(existing.getEmail())) {
                if (teacherRepository.existsByEmail(updatedTeacher.getEmail())) {
                    String[] parts = updatedTeacher.getEmail().split("@");
                    existing.setEmail(parts[0] + "+" + (System.currentTimeMillis() % 10000) + "@" + (parts.length > 1 ? parts[1] : "educonnect.ac.in"));
                } else {
                    existing.setEmail(updatedTeacher.getEmail());
                }
            }
            if (updatedTeacher.getMobile() != null) existing.setMobile(updatedTeacher.getMobile());
            if (updatedTeacher.getGender() != null) existing.setGender(updatedTeacher.getGender());
            if (updatedTeacher.getDesignation() != null) existing.setDesignation(updatedTeacher.getDesignation());
            if (updatedTeacher.getQualification() != null) existing.setQualification(updatedTeacher.getQualification());
            if (updatedTeacher.getExperience() != null) existing.setExperience(updatedTeacher.getExperience());
            if (updatedTeacher.getJoiningDate() != null) existing.setJoiningDate(updatedTeacher.getJoiningDate());
            if (updatedTeacher.getDateOfBirth() != null) existing.setDateOfBirth(updatedTeacher.getDateOfBirth());
            if (updatedTeacher.getAddress() != null) existing.setAddress(updatedTeacher.getAddress());
            if (updatedTeacher.getProfilePhoto() != null) existing.setProfilePhoto(updatedTeacher.getProfilePhoto());
            if (updatedTeacher.getIsActive() != null) existing.setIsActive(updatedTeacher.getIsActive());
            existing.setUpdatedAt(java.time.LocalDateTime.now());
            return teacherRepository.save(existing);
        }).orElseGet(() -> {
            updatedTeacher.setTeacherId(id);
            if (updatedTeacher.getCreatedAt() == null) updatedTeacher.setCreatedAt(java.time.LocalDateTime.now());
            if (updatedTeacher.getUpdatedAt() == null) updatedTeacher.setUpdatedAt(java.time.LocalDateTime.now());
            return teacherRepository.save(updatedTeacher);
        });
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        teacherRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherDashboard(String teacherId) {
        Map<String, Object> data = new HashMap<>();
        String cleanIdentifier = teacherId;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Optional<Teacher> tOpt = resolveTeacherByIdentifier(cleanIdentifier);
        if (tOpt.isEmpty()) {
            data.put("teacherName", "Faculty Member");
            data.put("department", "Academic Department");
            data.put("assignedCoursesCount", 0);
            data.put("totalStudents", 0);
            data.put("pendingGradingCount", 0);
            data.put("assignmentsCount", 0);
            data.put("attendanceRate", "0%");
            data.put("todayClasses", Collections.emptyList());
            return data;
        }

        Teacher teacher = tOpt.get();
        UUID tId = teacher.getTeacherId();
        String fullName = ((teacher.getFirstName() != null ? teacher.getFirstName() : "") + " " + (teacher.getLastName() != null ? teacher.getLastName() : "")).trim();
        data.put("teacherName", fullName.isEmpty() ? "Faculty Member" : fullName);
        data.put("department", teacher.getDesignation() != null ? teacher.getDesignation() : "Assistant Professor");

        // 1. Assigned Courses Count
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(tId);
        data.put("assignedCoursesCount", allocations.size());

        // 2. Total Students in Assigned Cohorts
        Set<UUID> uniqueStudentIds = new HashSet<>();
        for (TeacherSubject alloc : allocations) {
            List<Student> cohort = getStudentsForAllocation(alloc.getAllocationId());
            for (Student s : cohort) {
                if (s.getStudentId() != null) {
                    uniqueStudentIds.add(s.getStudentId());
                }
            }
        }
        data.put("totalStudents", uniqueStudentIds.size());

        // 3. Teacher's Assignments & Pending Grading Count
        Set<UUID> allocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> subjIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());

        List<Assignment> teacherAssignments = assignmentRepository.findAll().stream()
                .filter(a -> (a.getTeacherSubjectId() != null && allocIds.contains(a.getTeacherSubjectId()))
                        || (a.getSubjectId() != null && subjIds.contains(a.getSubjectId())))
                .toList();

        data.put("assignmentsCount", teacherAssignments.size());

        int pendingGrading = 0;
        for (Assignment a : teacherAssignments) {
            if (a.getAssignmentId() != null) {
                List<AssignmentSubmission> subs = submissionRepository.findByAssignmentId(a.getAssignmentId());
                for (AssignmentSubmission sub : subs) {
                    if (sub.getObtainedMarks() == null || "Submitted".equalsIgnoreCase(sub.getSubmissionStatus())) {
                        pendingGrading++;
                    }
                }
            }
        }
        data.put("pendingGradingCount", pendingGrading);

        // 4. Attendance Rate across Recorded Sessions
        List<AttendanceSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getTeacherSubjectId() != null && allocIds.contains(s.getTeacherSubjectId()))
                .toList();

        if (!sessions.isEmpty()) {
            List<UUID> sessionIds = sessions.stream().map(AttendanceSession::getSessionId).toList();
            List<AttendanceRecord> records = recordRepository.findBySessionIdIn(sessionIds);
            int totalRecs = records.size();
            long presentCount = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            String rateStr = totalRecs > 0 ? String.format(Locale.US, "%.1f%%", (double) presentCount / totalRecs * 100.0) : "0%";
            data.put("attendanceRate", rateStr);
        } else {
            data.put("attendanceRate", "0%");
        }

        data.put("todayClasses", Collections.emptyList());
        return data;
    }

    @Transactional
    public Map<String, Object> markAttendance(AttendanceMarkRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Attendance mark request body cannot be null.");
        }

        String cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        UUID allocationId = request.getTeacherSubjectId();
        if (allocationId == null) {
            throw new IllegalArgumentException("Valid teacher subject allocation ID (teacher_subject_id) is required.");
        }

        TeacherSubject allocation = teacherSubjectRepository.findById(allocationId)
                .orElseThrow(() -> new NoSuchElementException("Teacher subject allocation not found for ID: " + allocationId));

        if (!Objects.equals(allocation.getTeacherId(), teacher.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to mark attendance for this subject allocation.");
        }

        String dateStr = request.getSessionDate();
        if (dateStr == null || dateStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Session date (session_date) is required.");
        }
        LocalDate sessionDate;
        try {
            sessionDate = LocalDate.parse(dateStr.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid session_date format. Expected YYYY-MM-DD.");
        }

        Integer lectureNo = request.getLectureNo();
        if (lectureNo == null || lectureNo < 1) {
            lectureNo = 1;
        }

        LocalTime startTime = LocalTime.of(9, 30);
        LocalTime endTime = LocalTime.of(11, 0);
        if (request.getStartTime() != null && !request.getStartTime().trim().isEmpty()) {
            try {
                startTime = LocalTime.parse(request.getStartTime().trim());
            } catch (Exception e) {
                try { startTime = LocalTime.parse(request.getStartTime().trim() + ":00"); } catch (Exception ignored) {}
            }
        }
        if (request.getEndTime() != null && !request.getEndTime().trim().isEmpty()) {
            try {
                endTime = LocalTime.parse(request.getEndTime().trim());
            } catch (Exception e) {
                try { endTime = LocalTime.parse(request.getEndTime().trim() + ":00"); } catch (Exception ignored) {}
            }
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time (" + startTime + ") must be strictly before end time (" + endTime + ").");
        }

        String topic = (request.getTopic() != null && !request.getTopic().trim().isEmpty())
                ? request.getTopic().trim()
                : "Lecture Session";

        List<AttendanceMarkRequest.StudentStatus> statuses = request.getStudentStatuses();
        if (statuses == null || statuses.isEmpty()) {
            throw new IllegalArgumentException("Student attendance roster records (student_statuses/records) cannot be empty.");
        }

        List<Student> cohortStudents = getStudentsForAllocation(allocationId);
        Set<UUID> validStudentIds = cohortStudents.stream()
                .map(Student::getStudentId)
                .collect(Collectors.toSet());

        for (AttendanceMarkRequest.StudentStatus statusItem : statuses) {
            if (statusItem.getStudentId() == null) {
                throw new IllegalArgumentException("Student ID in attendance roster cannot be null.");
            }
            if (!validStudentIds.contains(statusItem.getStudentId())) {
                throw new IllegalArgumentException("Student " + statusItem.getStudentId() + " does not belong to the permitted cohort for this allocation.");
            }
            String st = statusItem.getStatus();
            if (st == null || st.trim().isEmpty()) {
                st = "Present";
            }
            if (!"Present".equalsIgnoreCase(st) && !"Absent".equalsIgnoreCase(st) && !"Late".equalsIgnoreCase(st)) {
                throw new IllegalArgumentException("Invalid attendance status '" + st + "'. Expected Present, Absent, or Late.");
            }
        }

        Optional<AttendanceSession> existingSessionOpt = sessionRepository
                .findByTeacherSubjectIdAndSessionDateAndLectureNo(allocationId, sessionDate, lectureNo);

        AttendanceSession session;
        if (existingSessionOpt.isPresent()) {
            session = existingSessionOpt.get();
            session.setStartTime(startTime);
            session.setEndTime(endTime);
            session.setTopic(topic);
            session.setUpdatedAt(LocalDateTime.now());
        } else {
            session = AttendanceSession.builder()
                    .teacherSubjectId(allocationId)
                    .sessionDate(sessionDate)
                    .lectureNo(lectureNo)
                    .startTime(startTime)
                    .endTime(endTime)
                    .topic(topic)
                    .build();
        }
        AttendanceSession savedSession = sessionRepository.save(session);

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;

        for (AttendanceMarkRequest.StudentStatus statusItem : statuses) {
            String normStatus = "Present";
            if ("Absent".equalsIgnoreCase(statusItem.getStatus())) normStatus = "Absent";
            else if ("Late".equalsIgnoreCase(statusItem.getStatus())) normStatus = "Late";

            if ("Present".equals(normStatus)) presentCount++;
            else if ("Absent".equals(normStatus)) absentCount++;
            else if ("Late".equals(normStatus)) lateCount++;

            Optional<AttendanceRecord> recOpt = recordRepository.findBySessionIdAndStudentId(savedSession.getSessionId(), statusItem.getStudentId());
            AttendanceRecord record;
            if (recOpt.isPresent()) {
                record = recOpt.get();
                record.setAttendanceStatus(normStatus);
                record.setRemarks(statusItem.getRemarks() != null ? statusItem.getRemarks() : "");
                record.setUpdatedAt(LocalDateTime.now());
            } else {
                record = AttendanceRecord.builder()
                        .sessionId(savedSession.getSessionId())
                        .studentId(statusItem.getStudentId())
                        .attendanceStatus(normStatus)
                        .remarks(statusItem.getRemarks() != null ? statusItem.getRemarks() : "")
                        .build();
            }
            recordRepository.save(record);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", existingSessionOpt.isPresent() ? "Attendance session updated successfully." : "Attendance session saved successfully.");
        response.put("session_id", savedSession.getSessionId().toString());
        response.put("sessionId", savedSession.getSessionId().toString());
        response.put("total_records", statuses.size());
        response.put("present_count", presentCount);
        response.put("absent_count", absentCount);
        response.put("late_count", lateCount);

        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherAttendanceSessions(String subjectIdFilter, String dateFilter) {
        String cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherId(teacher.getTeacherId());
        if (allocations.isEmpty()) return Collections.emptyList();

        Map<UUID, TeacherSubject> allocMap = allocations.stream()
                .collect(Collectors.toMap(TeacherSubject::getAllocationId, a -> a, (a1, a2) -> a1));

        List<AttendanceSession> sessions = sessionRepository.findByTeacherSubjectIdIn(allocMap.keySet());
        if (sessions.isEmpty()) return Collections.emptyList();

        List<Map<String, Object>> resultList = new ArrayList<>();
        for (AttendanceSession sess : sessions) {
            TeacherSubject alloc = allocMap.get(sess.getTeacherSubjectId());
            if (alloc == null) continue;

            if (subjectIdFilter != null && !subjectIdFilter.trim().isEmpty()) {
                if (!alloc.getSubjectId().toString().equalsIgnoreCase(subjectIdFilter.trim())) {
                    continue;
                }
            }
            if (dateFilter != null && !dateFilter.trim().isEmpty()) {
                if (!sess.getSessionDate().toString().equalsIgnoreCase(dateFilter.trim())) {
                    continue;
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("session_id", sess.getSessionId().toString());
            map.put("allocation_id", alloc.getAllocationId().toString());
            map.put("subject_id", alloc.getSubjectId().toString());
            map.put("session_date", sess.getSessionDate().toString());
            map.put("lecture_no", sess.getLectureNo());
            map.put("start_time", sess.getStartTime().toString());
            map.put("end_time", sess.getEndTime().toString());
            map.put("topic", sess.getTopic() != null ? sess.getTopic() : "");

            subjectRepository.findById(alloc.getSubjectId()).ifPresent(sub -> {
                map.put("subject_name", sub.getSubjectName());
                map.put("subject_code", sub.getSubjectCode());
            });

            List<AttendanceRecord> records = recordRepository.findBySessionId(sess.getSessionId());
            long presentCount = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getAttendanceStatus())).count();
            long absentCount = records.stream().filter(r -> "Absent".equalsIgnoreCase(r.getAttendanceStatus())).count();
            long lateCount = records.stream().filter(r -> "Late".equalsIgnoreCase(r.getAttendanceStatus())).count();

            map.put("total_students", records.size());
            map.put("present_count", presentCount);
            map.put("absent_count", absentCount);
            map.put("late_count", lateCount);

            resultList.add(map);
        }

        resultList.sort((m1, m2) -> ((String) m2.get("session_date")).compareTo((String) m1.get("session_date")));
        return resultList;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSessionDetail(UUID sessionId) {
        String cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        AttendanceSession sess = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Attendance session not found for ID: " + sessionId));

        TeacherSubject alloc = teacherSubjectRepository.findById(sess.getTeacherSubjectId())
                .orElseThrow(() -> new NoSuchElementException("Teacher subject allocation not found for session."));

        if (!Objects.equals(alloc.getTeacherId(), teacher.getTeacherId())) {
            throw new AccessDeniedException("Access denied: You do not own this attendance session.");
        }

        Map<String, Object> detail = new HashMap<>();
        detail.put("session_id", sess.getSessionId().toString());
        detail.put("teacher_subject_id", alloc.getAllocationId().toString());
        detail.put("allocation_id", alloc.getAllocationId().toString());
        detail.put("subject_id", alloc.getSubjectId().toString());
        detail.put("session_date", sess.getSessionDate().toString());
        detail.put("lecture_no", sess.getLectureNo());
        detail.put("start_time", sess.getStartTime().toString());
        detail.put("end_time", sess.getEndTime().toString());
        detail.put("topic", sess.getTopic() != null ? sess.getTopic() : "");

        subjectRepository.findById(alloc.getSubjectId()).ifPresent(sub -> {
            detail.put("subject_name", sub.getSubjectName());
            detail.put("subject_code", sub.getSubjectCode());
        });

        List<AttendanceRecord> records = recordRepository.findBySessionId(sess.getSessionId());
        Map<UUID, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(AttendanceRecord::getStudentId, r -> r, (r1, r2) -> r1));

        List<Student> cohortStudents = getStudentsForAllocation(alloc.getAllocationId());
        List<Map<String, Object>> studentList = new ArrayList<>();

        for (Student stu : cohortStudents) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("student_id", stu.getStudentId().toString());
            sMap.put("enrollment_no", stu.getEnrollmentNo());
            sMap.put("first_name", stu.getFirstName());
            sMap.put("last_name", stu.getLastName());
            sMap.put("profile_photo", stu.getProfilePhoto() != null ? stu.getProfilePhoto() : "");

            AttendanceRecord rec = recordMap.get(stu.getStudentId());
            if (rec != null) {
                sMap.put("status", rec.getAttendanceStatus());
                sMap.put("remarks", rec.getRemarks() != null ? rec.getRemarks() : "");
            } else {
                sMap.put("status", "Present");
                sMap.put("remarks", "");
            }
            studentList.add(sMap);
        }

        detail.put("records", studentList);
        detail.put("student_statuses", studentList);
        return detail;
    }

    public List<Map<String, Object>> getPendingGrades(String teacherId) {
        return Collections.emptyList();
    }

    // --- Teacher Subject Allocation Methods ---
    @Transactional(readOnly = true)
    public List<TeacherSubject> getAllTeacherSubjects() {
        return teacherSubjectRepository.findAll();
    }

    @Transactional
    public TeacherSubject assignTeacherSubject(TeacherSubject allocation) {
        Optional<TeacherSubject> existing = Optional.empty();
        if (allocation.getBatchId() != null) {
            existing = teacherSubjectRepository.findByTeacherIdAndSubjectIdAndBatchId(allocation.getTeacherId(), allocation.getSubjectId(), allocation.getBatchId());
        } else {
            existing = teacherSubjectRepository.findByTeacherIdAndSubjectId(allocation.getTeacherId(), allocation.getSubjectId());
        }

        if (existing.isPresent()) {
            TeacherSubject ts = existing.get();
            ts.setIsActive(allocation.getIsActive() != null ? allocation.getIsActive() : true);
            if (allocation.getBatchId() != null) ts.setBatchId(allocation.getBatchId());
            if (allocation.getSemesterId() != null) ts.setSemesterId(allocation.getSemesterId());
            return teacherSubjectRepository.save(ts);
        } else {
            allocation.setAllocationId(null);
            if (allocation.getIsActive() == null) {
                allocation.setIsActive(true);
            }
            return teacherSubjectRepository.save(allocation);
        }
    }

    @Transactional
    public void deleteTeacherSubject(UUID allocationId) {
        teacherSubjectRepository.deleteById(allocationId);
    }

    @Transactional
    public Map<String, Object> toggleTeacherSubject(UUID teacherId, UUID subjectId) {
        Optional<TeacherSubject> existing = teacherSubjectRepository
                .findByTeacherIdAndSubjectId(teacherId, subjectId);
        Map<String, Object> res = new HashMap<>();
        if (existing.isPresent()) {
            teacherSubjectRepository.delete(existing.get());
            res.put("assigned", false);
            res.put("message", "Subject unassigned from teacher");
        } else {
            TeacherSubject newAlloc = TeacherSubject.builder()
                    .teacherId(teacherId)
                    .subjectId(subjectId)
                    .isActive(true)
                    .build();
            TeacherSubject saved = teacherSubjectRepository.save(newAlloc);
            res.put("assigned", true);
            res.put("allocation", saved);
            res.put("message", "Subject assigned to teacher successfully");
        }
        return res;
    }

    @Transactional
    public Map<String, Object> changeTeacherPassword(String emailOrId, String currentPassword, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        if (newPassword == null || newPassword.trim().length() < 4) {
            response.put("success", false);
            response.put("message", "New password must be at least 4 characters long.");
            return response;
        }

        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(emailOrId);
        if (!teacherOpt.isPresent()) {
            try {
                UUID id = UUID.fromString(emailOrId);
                teacherOpt = teacherRepository.findById(id);
            } catch (Exception e) {
                // Ignore
            }
        }

        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            String storedHash = teacher.getPassword();

            boolean currentMatches = false;
            if (storedHash != null && (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$"))) {
                currentMatches = currentPassword != null && passwordEncoder.matches(currentPassword.trim(), storedHash);
            } else {
                String defaultPass = (storedHash != null && !storedHash.trim().isEmpty()) ? storedHash.trim() : "teacher123";
                currentMatches = currentPassword != null && currentPassword.trim().equals(defaultPass);
            }

            if (currentMatches) {
                teacher.setPassword(passwordEncoder.encode(newPassword.trim()));
                teacher.setUpdatedAt(java.time.LocalDateTime.now());
                teacherRepository.save(teacher);

                response.put("success", true);
                response.put("message", "Password changed successfully! Please use your new password for future logins.");
                return response;
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect. Please enter your valid current password.");
                return response;
            }
        }

        response.put("success", false);
        response.put("message", "Teacher account not found.");
        return response;
    }



    private Map<String, Object> convertTeacherToMap(Teacher t) {
        Map<String, Object> map = new HashMap<>();
        map.put("teacher_id", t.getTeacherId() != null ? t.getTeacherId().toString() : "");
        map.put("employee_id", t.getEmployeeId() != null ? t.getEmployeeId() : "");
        map.put("first_name", t.getFirstName() != null ? t.getFirstName() : "");
        map.put("last_name", t.getLastName() != null ? t.getLastName() : "");
        map.put("surname", t.getSurname() != null ? t.getSurname() : "");
        map.put("email", t.getEmail() != null ? t.getEmail() : "");
        map.put("mobile", t.getMobile() != null ? t.getMobile() : "");
        map.put("gender", t.getGender() != null ? t.getGender() : "");
        map.put("designation", t.getDesignation() != null ? t.getDesignation() : "");
        map.put("qualification", t.getQualification() != null ? t.getQualification() : "");
        map.put("experience", t.getExperience() != null ? t.getExperience() : 0);
        map.put("joining_date", t.getJoiningDate() != null ? t.getJoiningDate().toString() : "");
        map.put("date_of_birth", t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : "");
        map.put("address", t.getAddress() != null ? t.getAddress() : "");
        map.put("profile_photo", t.getProfilePhoto() != null ? t.getProfilePhoto() : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
        map.put("is_active", t.getIsActive() != null ? t.getIsActive() : true);
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssignmentSubmissions(UUID assignmentId, String teacherIdentifier) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found for ID: " + assignmentId));

        String cleanIdentifier = teacherIdentifier;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        if (assignment.getTeacherSubjectId() != null) {
            TeacherSubject alloc = teacherSubjectRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
            if (alloc != null && !Objects.equals(alloc.getTeacherId(), teacher.getTeacherId())) {
                throw new AccessDeniedException("Access denied: You are not authorized to view submissions for this assignment.");
            }
        }

        List<Student> cohortStudents = getStudentsForAllocation(assignment.getTeacherSubjectId());
        List<AssignmentSubmission> dbSubmissions = submissionRepository.findByAssignmentId(assignmentId);
        Map<UUID, AssignmentSubmission> studentSubMap = new HashMap<>();
        for (AssignmentSubmission sub : dbSubmissions) {
            if (sub.getStudentId() != null) {
                studentSubMap.put(sub.getStudentId(), sub);
            }
        }

        LocalDate now = LocalDate.now();
        LocalDate dueDate = assignment.getDueDate();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Student stu : cohortStudents) {
            Map<String, Object> map = new HashMap<>();
            map.put("assignment_id", assignmentId.toString());
            map.put("student_id", stu.getStudentId().toString());
            map.put("student_name", ((stu.getFirstName() != null ? stu.getFirstName() : "") + " " + (stu.getLastName() != null ? stu.getLastName() : "")).trim());
            map.put("enrollment_no", stu.getEnrollmentNo() != null ? stu.getEnrollmentNo() : "");
            map.put("email", stu.getEmail() != null ? stu.getEmail() : "");

            AssignmentSubmission sub = studentSubMap.get(stu.getStudentId());
            if (sub != null) {
                map.put("submission_id", sub.getSubmissionId() != null ? sub.getSubmissionId().toString() : "");
                map.put("submission_date", sub.getSubmissionDate() != null ? sub.getSubmissionDate().toString() : "");
                map.put("attachment", sub.getAttachment() != null ? sub.getAttachment() : "");
                map.put("file_name", sub.getFileName() != null ? sub.getFileName() : "");
                map.put("file_path", sub.getFilePath() != null ? sub.getFilePath() : "");
                map.put("file_type", sub.getFileType() != null ? sub.getFileType() : "");
                map.put("file_size", sub.getFileSize() != null ? sub.getFileSize() : 0L);
                map.put("obtained_marks", sub.getObtainedMarks());
                map.put("feedback", sub.getFeedback() != null ? sub.getFeedback() : "");
                
                String subStatus = sub.getSubmissionStatus();
                if (subStatus == null || "Submitted".equalsIgnoreCase(subStatus) || "Graded".equalsIgnoreCase(subStatus)) {
                    if (dueDate != null && sub.getSubmissionDate() != null && sub.getSubmissionDate().toLocalDate().isAfter(dueDate)) {
                        subStatus = "Late";
                    } else {
                        subStatus = "Timely";
                    }
                }
                map.put("submission_status", subStatus);
                map.put("submitted", true);
            } else {
                map.put("submission_id", null);
                map.put("submission_date", "-");
                map.put("attachment", null);
                map.put("file_name", null);
                map.put("obtained_marks", null);
                map.put("feedback", null);
                String unsubmittedStatus = (dueDate != null && now.isAfter(dueDate)) ? "Missed" : "Not Submitted";
                map.put("submission_status", unsubmittedStatus);
                map.put("submitted", false);
            }
            result.add(map);
        }
        return result;
    }

    @Transactional
    public AssignmentSubmission gradeSubmission(UUID submissionId, Map<String, Object> reqData, String teacherIdentifier) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found with id: " + submissionId));

        Assignment assignment = assignmentRepository.findById(sub.getAssignmentId())
                .orElseThrow(() -> new NoSuchElementException("Assignment not found with id: " + sub.getAssignmentId()));

        String cleanIdentifier = teacherIdentifier;
        if (cleanIdentifier == null || cleanIdentifier.trim().isEmpty()) {
            cleanIdentifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanIdentifier)
                .orElseThrow(() -> new AccessDeniedException("Authenticated teacher identity not found."));

        if (assignment.getTeacherSubjectId() != null) {
            TeacherSubject alloc = teacherSubjectRepository.findById(assignment.getTeacherSubjectId()).orElse(null);
            if (alloc != null && !Objects.equals(alloc.getTeacherId(), teacher.getTeacherId())) {
                throw new AccessDeniedException("Access denied: You are not authorized to grade submissions for this assignment.");
            }
        }

        if (reqData.get("obtained_marks") != null) {
            Object marksObj = reqData.get("obtained_marks");
            Integer marks = null;
            if (marksObj instanceof Number) marks = ((Number) marksObj).intValue();
            else if (marksObj instanceof String) {
                try { marks = Integer.parseInt((String) marksObj); } catch (Exception ignored) {}
            }
            if (marks == null) {
                throw new IllegalArgumentException("Invalid obtained_marks value.");
            }
            int maxMarks = assignment.getTotalMarks() != null ? assignment.getTotalMarks() : 100;
            if (marks < 0 || marks > maxMarks) {
                throw new IllegalArgumentException("Obtained marks must be between 0 and maximum assignment marks (" + maxMarks + ").");
            }
            sub.setObtainedMarks(marks);
        }

        if (reqData.containsKey("feedback")) {
            sub.setFeedback((String) reqData.get("feedback"));
        }
        
        if (sub.getSubmissionStatus() == null || "Submitted".equalsIgnoreCase(sub.getSubmissionStatus()) || "Graded".equalsIgnoreCase(sub.getSubmissionStatus())) {
            if (assignment.getDueDate() != null && sub.getSubmissionDate() != null) {
                if (sub.getSubmissionDate().toLocalDate().isAfter(assignment.getDueDate())) {
                    sub.setSubmissionStatus("Late");
                } else {
                    sub.setSubmissionStatus("Timely");
                }
            } else {
                sub.setSubmissionStatus("Timely");
            }
        }
        sub.setUpdatedAt(java.time.LocalDateTime.now());

        return submissionRepository.save(sub);
    }

    @Transactional
    public AssignmentSubmission gradeSubmission(UUID submissionId, Map<String, Object> reqData) {
        return gradeSubmission(submissionId, reqData, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllWeeklyTests(String identifier) {
        List<Subject> assignedSubjects = getAssignedSubjectsForTeacher(identifier);
        if (assignedSubjects.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> assignedSubjectIds = assignedSubjects.stream()
                .map(Subject::getSubjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<WeeklyTest> tests = weeklyTestRepository.findAll().stream()
                .filter(wt -> wt.getSubjectId() != null && assignedSubjectIds.contains(wt.getSubjectId()))
                .toList();

        List<Map<String, Object>> list = new ArrayList<>();
        for (WeeklyTest wt : tests) {
            Map<String, Object> map = new HashMap<>();
            String testIdStr = wt.getWeeklyTestId() != null ? wt.getWeeklyTestId().toString() : "";
            String testDateStr = wt.getTestDate() != null ? wt.getTestDate().toString() : "";
            map.put("weekly_test_id", testIdStr);
            map.put("weekly_exam_id", testIdStr);
            map.put("teacher_subject_id", wt.getTeacherSubjectId() != null ? wt.getTeacherSubjectId().toString() : "");
            map.put("subject_id", wt.getSubjectId() != null ? wt.getSubjectId().toString() : "");
            map.put("title", wt.getTitle() != null ? wt.getTitle() : "");
            map.put("description", wt.getDescription() != null ? wt.getDescription() : "");
            map.put("test_date", testDateStr);
            map.put("exam_date", testDateStr);
            map.put("start_time", wt.getStartTime() != null ? wt.getStartTime().toString() : "10:00:00");
            map.put("end_time", wt.getEndTime() != null ? wt.getEndTime().toString() : "11:00:00");
            map.put("total_marks", wt.getTotalMarks() != null ? wt.getTotalMarks() : 25);
            map.put("is_published", wt.getIsPublished() != null ? wt.getIsPublished() : false);
            map.put("created_at", wt.getCreatedAt() != null ? wt.getCreatedAt().toString() : "");
            if (wt.getSubjectId() != null) {
                subjectRepository.findById(wt.getSubjectId()).ifPresent(sub -> {
                    map.put("subject_code", sub.getSubjectCode());
                    map.put("subject_name", sub.getSubjectName());
                });
            }
            list.add(map);
        }
        return list;
    }

    @Transactional
    public WeeklyTest createWeeklyTest(Map<String, Object> reqData, String identifier) {
        String title = (String) reqData.get("title");
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Test title is required.");
        }

        WeeklyTest test = new WeeklyTest();
        test.setTitle(title.trim());
        test.setDescription(reqData.get("description") != null ? ((String) reqData.get("description")).trim() : "");
        test.setIsPublished(false);

        Object dateObj = reqData.get("test_date") != null ? reqData.get("test_date") : reqData.get("exam_date");
        if (dateObj == null || ((String) dateObj).trim().isEmpty()) {
            throw new IllegalArgumentException("Test date is required.");
        }
        LocalDate testDate;
        try {
            testDate = LocalDate.parse(((String) dateObj).trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid test date format.");
        }
        if (testDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Past dates cannot be selected for weekly tests.");
        }
        test.setTestDate(testDate);

        LocalTime startTime = LocalTime.of(10, 0);
        if (reqData.get("start_time") != null) {
            try {
                String st = ((String) reqData.get("start_time")).trim();
                if (st.length() == 5) st = st + ":00";
                startTime = LocalTime.parse(st);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid start time format.");
            }
        }
        test.setStartTime(startTime);

        LocalTime endTime = LocalTime.of(11, 0);
        if (reqData.get("end_time") != null) {
            try {
                String et = ((String) reqData.get("end_time")).trim();
                if (et.length() == 5) et = et + ":00";
                endTime = LocalTime.parse(et);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid end time format.");
            }
        }
        test.setEndTime(endTime);

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be strictly before end time.");
        }

        int totalMarks = 25;
        if (reqData.get("total_marks") != null) {
            Object marksObj = reqData.get("total_marks");
            if (marksObj instanceof Number) totalMarks = ((Number) marksObj).intValue();
            else if (marksObj instanceof String) {
                try { totalMarks = Integer.parseInt(((String) marksObj).trim()); } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid total marks.");
                }
            }
        }
        if (totalMarks <= 0) {
            throw new IllegalArgumentException("Total marks must be greater than zero.");
        }
        test.setTotalMarks(totalMarks);

        // Resolve subject & allocation under authenticated teacher scope
        Teacher teacher = resolveTeacherByIdentifier(identifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        if (allocations.isEmpty()) {
            throw new IllegalStateException("Teacher has no active subject allocations.");
        }

        UUID teacherSubjectId = null;
        UUID subjectId = null;

        if (reqData.get("teacher_subject_id") != null && !((String) reqData.get("teacher_subject_id")).trim().isEmpty()) {
            try { teacherSubjectId = UUID.fromString(((String) reqData.get("teacher_subject_id")).trim()); } catch (Exception ignored) {}
        }
        if (reqData.get("subject_id") != null && !((String) reqData.get("subject_id")).trim().isEmpty()) {
            try { subjectId = UUID.fromString(((String) reqData.get("subject_id")).trim()); } catch (Exception ignored) {}
        }

        TeacherSubject matchedAlloc = null;
        if (teacherSubjectId != null) {
            final UUID allocIdSearch = teacherSubjectId;
            matchedAlloc = allocations.stream()
                    .filter(a -> Objects.equals(a.getAllocationId(), allocIdSearch))
                    .findFirst()
                    .orElseThrow(() -> new SecurityException("Access denied: Unowned allocation specified."));
        } else if (subjectId != null) {
            final UUID subjIdSearch = subjectId;
            matchedAlloc = allocations.stream()
                    .filter(a -> Objects.equals(a.getSubjectId(), subjIdSearch))
                    .findFirst()
                    .orElseThrow(() -> new SecurityException("Access denied: Unowned subject specified."));
        } else {
            matchedAlloc = allocations.get(0);
        }

        test.setTeacherSubjectId(matchedAlloc.getAllocationId());
        test.setSubjectId(matchedAlloc.getSubjectId());

        return weeklyTestRepository.save(test);
    }

    @Transactional
    public WeeklyTest createWeeklyTest(Map<String, Object> reqData) {
        String identifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        return createWeeklyTest(reqData, identifier);
    }

    @Transactional
    public WeeklyTest updateWeeklyTest(UUID id, Map<String, Object> reqData, String identifier) {
        WeeklyTest test = weeklyTestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Weekly test not found."));

        // Verify teacher ownership
        Teacher teacher = resolveTeacherByIdentifier(identifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> ownedSubjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> ownedAllocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());

        boolean owned = (test.getTeacherSubjectId() != null && ownedAllocIds.contains(test.getTeacherSubjectId())) ||
                (test.getSubjectId() != null && ownedSubjectIds.contains(test.getSubjectId()));
        if (!owned) {
            throw new SecurityException("Access denied: You do not own this weekly test.");
        }

        if (reqData.containsKey("title")) {
            String t = (String) reqData.get("title");
            if (t == null || t.trim().isEmpty()) throw new IllegalArgumentException("Title cannot be empty.");
            test.setTitle(t.trim());
        }
        if (reqData.containsKey("description")) {
            test.setDescription(reqData.get("description") != null ? ((String) reqData.get("description")).trim() : "");
        }

        Object dateObj = reqData.get("test_date") != null ? reqData.get("test_date") : reqData.get("exam_date");
        if (dateObj != null) {
            try {
                LocalDate d = LocalDate.parse(((String) dateObj).trim());
                if (d.isBefore(LocalDate.now())) throw new IllegalArgumentException("Past dates cannot be selected for weekly tests.");
                test.setTestDate(d);
            } catch (IllegalArgumentException iae) {
                throw iae;
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid test date format.");
            }
        }

        LocalTime newStart = test.getStartTime();
        if (reqData.get("start_time") != null) {
            try {
                String st = ((String) reqData.get("start_time")).trim();
                if (st.length() == 5) st = st + ":00";
                newStart = LocalTime.parse(st);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid start time format.");
            }
        }

        LocalTime newEnd = test.getEndTime();
        if (reqData.get("end_time") != null) {
            try {
                String et = ((String) reqData.get("end_time")).trim();
                if (et.length() == 5) et = et + ":00";
                newEnd = LocalTime.parse(et);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid end time format.");
            }
        }

        if (newStart != null && newEnd != null && !newStart.isBefore(newEnd)) {
            throw new IllegalArgumentException("Start time must be strictly before end time.");
        }
        test.setStartTime(newStart);
        test.setEndTime(newEnd);

        if (reqData.get("total_marks") != null) {
            int newMarks;
            Object marksObj = reqData.get("total_marks");
            if (marksObj instanceof Number) newMarks = ((Number) marksObj).intValue();
            else {
                try { newMarks = Integer.parseInt(((String) marksObj).trim()); } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid total marks value.");
                }
            }
            if (newMarks <= 0) {
                throw new IllegalArgumentException("Total marks must be greater than zero.");
            }

            // Check if lowering total marks below existing recorded scores
            List<WeeklyTestResult> existingResults = weeklyTestResultRepository.findByWeeklyTestId(id);
            int maxScore = existingResults.stream()
                    .map(WeeklyTestResult::getObtainedMarks)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);

            if (newMarks < maxScore) {
                throw new IllegalArgumentException("Cannot reduce total marks below existing recorded student score of " + maxScore + ".");
            }
            test.setTotalMarks(newMarks);
        }

        if (reqData.containsKey("is_published")) {
            Object pubObj = reqData.get("is_published");
            if (pubObj instanceof Boolean) test.setIsPublished((Boolean) pubObj);
            else if (pubObj instanceof String) test.setIsPublished(Boolean.parseBoolean((String) pubObj));
        }

        return weeklyTestRepository.save(test);
    }

    @Transactional
    public WeeklyTest updateWeeklyTest(UUID id, Map<String, Object> reqData) {
        String identifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        return updateWeeklyTest(id, reqData, identifier);
    }

    @Transactional
    public void deleteWeeklyTest(UUID id, String identifier) {
        WeeklyTest test = weeklyTestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Weekly test not found."));

        Teacher teacher = resolveTeacherByIdentifier(identifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> ownedSubjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> ownedAllocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());

        boolean owned = (test.getTeacherSubjectId() != null && ownedAllocIds.contains(test.getTeacherSubjectId())) ||
                (test.getSubjectId() != null && ownedSubjectIds.contains(test.getSubjectId()));
        if (!owned) {
            throw new SecurityException("Access denied: You do not own this weekly test.");
        }

        weeklyTestRepository.deleteById(id);
    }

    @Transactional
    public void deleteWeeklyTest(UUID id) {
        String identifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        deleteWeeklyTest(id, identifier);
    }

    @Transactional
    public WeeklyTest publishWeeklyTest(UUID id, String identifier) {
        WeeklyTest test = weeklyTestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Weekly test not found."));

        Teacher teacher = resolveTeacherByIdentifier(identifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> ownedSubjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> ownedAllocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());

        boolean owned = (test.getTeacherSubjectId() != null && ownedAllocIds.contains(test.getTeacherSubjectId())) ||
                (test.getSubjectId() != null && ownedSubjectIds.contains(test.getSubjectId()));
        if (!owned) {
            throw new SecurityException("Access denied: You do not own this weekly test.");
        }

        test.setIsPublished(true);
        return weeklyTestRepository.save(test);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWeeklyTestResults(UUID testId, String teacherIdentifier) {
        WeeklyTest test = weeklyTestRepository.findById(testId)
                .orElseThrow(() -> new NoSuchElementException("Weekly test not found."));

        // Verify teacher ownership
        Teacher teacher = resolveTeacherByIdentifier(teacherIdentifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + teacherIdentifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> ownedSubjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> ownedAllocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());

        boolean owned = (test.getTeacherSubjectId() != null && ownedAllocIds.contains(test.getTeacherSubjectId())) ||
                (test.getSubjectId() != null && ownedSubjectIds.contains(test.getSubjectId()));
        if (!owned) {
            throw new SecurityException("Access denied: You do not own this weekly test.");
        }

        // Fetch roster students for the test's cohort
        List<Student> cohortStudents = Collections.emptyList();
        if (test.getTeacherSubjectId() != null) {
            cohortStudents = getStudentsForAllocation(test.getTeacherSubjectId());
        }
        if (cohortStudents.isEmpty() && test.getSubjectId() != null) {
            Subject subj = subjectRepository.findById(test.getSubjectId()).orElse(null);
            if (subj != null) {
                UUID deptId = subj.getDepartmentId();
                UUID semId = subj.getSemesterId();
                cohortStudents = studentRepository.findAll().stream()
                        .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                        .filter(s -> deptId == null || Objects.equals(s.getDepartmentId(), deptId))
                        .filter(s -> semId == null || Objects.equals(s.getSemesterId(), semId))
                        .toList();
            }
        }
        if (cohortStudents.isEmpty()) {
            List<Map<String, Object>> generalList = getStudentsForTeacher(teacherIdentifier);
            cohortStudents = generalList.stream()
                    .map(m -> (String) m.get("student_id"))
                    .filter(Objects::nonNull)
                    .map(UUID::fromString)
                    .map(studentRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .toList();
        }

        List<WeeklyTestResult> dbResults = weeklyTestResultRepository.findByWeeklyTestId(testId);
        Map<UUID, WeeklyTestResult> resultMap = new HashMap<>();
        for (WeeklyTestResult r : dbResults) {
            if (r.getStudentId() != null) resultMap.put(r.getStudentId(), r);
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Student s : cohortStudents) {
            UUID sId = s.getStudentId();
            if (sId == null) continue;

            Map<String, Object> map = new HashMap<>();
            map.put("weekly_test_id", testId.toString());
            map.put("weekly_exam_id", testId.toString());
            map.put("student_id", sId.toString());
            map.put("student_name", (s.getFirstName() + " " + s.getLastName()).trim());
            map.put("enrollment_no", s.getEnrollmentNo() != null ? s.getEnrollmentNo() : "");

            WeeklyTestResult res = resultMap.get(sId);
            if (res != null) {
                String resIdStr = res.getWeeklyTestResultId() != null ? res.getWeeklyTestResultId().toString() : "";
                map.put("weekly_test_result_id", resIdStr);
                map.put("weekly_exam_result_id", resIdStr);
                map.put("obtained_marks", res.getObtainedMarks());
                map.put("grade", res.getGrade() != null ? res.getGrade() : "-");
                map.put("remarks", res.getRemarks() != null ? res.getRemarks() : "");
            } else {
                map.put("weekly_test_result_id", null);
                map.put("weekly_exam_result_id", null);
                map.put("obtained_marks", null);
                map.put("grade", "-");
                map.put("remarks", "");
            }
            list.add(map);
        }
        return list;
    }

    @Transactional
    public List<WeeklyTestResult> saveWeeklyTestResults(UUID testId, List<Map<String, Object>> resultsList, String teacherIdentifier) {
        WeeklyTest test = weeklyTestRepository.findById(testId)
                .orElseThrow(() -> new NoSuchElementException("Weekly test not found."));

        Teacher teacher = resolveTeacherByIdentifier(teacherIdentifier)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + teacherIdentifier));
        List<TeacherSubject> allocations = teacherSubjectRepository.findByTeacherIdAndIsActiveTrue(teacher.getTeacherId());
        Set<UUID> ownedSubjectIds = allocations.stream().map(TeacherSubject::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> ownedAllocIds = allocations.stream().map(TeacherSubject::getAllocationId).filter(Objects::nonNull).collect(Collectors.toSet());

        boolean owned = (test.getTeacherSubjectId() != null && ownedAllocIds.contains(test.getTeacherSubjectId())) ||
                (test.getSubjectId() != null && ownedSubjectIds.contains(test.getSubjectId()));
        if (!owned) {
            throw new SecurityException("Access denied: You do not own this weekly test.");
        }

        int totalMarks = test.getTotalMarks() != null ? test.getTotalMarks() : 25;

        // Check for duplicate student IDs in payload
        Set<UUID> seenStudentIds = new HashSet<>();
        for (Map<String, Object> item : resultsList) {
            String studentIdStr = (String) item.get("student_id");
            if (studentIdStr != null && !studentIdStr.trim().isEmpty()) {
                UUID sId = UUID.fromString(studentIdStr.trim());
                if (!seenStudentIds.add(sId)) {
                    throw new IllegalArgumentException("Duplicate student entry found in payload for student ID: " + sId);
                }
            }
        }

        List<WeeklyTestResult> savedList = new ArrayList<>();
        for (Map<String, Object> item : resultsList) {
            String studentIdStr = (String) item.get("student_id");
            if (studentIdStr == null || studentIdStr.trim().isEmpty()) continue;

            UUID studentId = UUID.fromString(studentIdStr.trim());

            Integer obtainedMarks = null;
            if (item.get("obtained_marks") != null) {
                Object omObj = item.get("obtained_marks");
                if (omObj instanceof Number) obtainedMarks = ((Number) omObj).intValue();
                else if (omObj instanceof String && !((String) omObj).trim().isEmpty()) {
                    try { obtainedMarks = Integer.parseInt(((String) omObj).trim()); } catch (Exception e) {
                        throw new IllegalArgumentException("Invalid obtained marks format for student.");
                    }
                }
            }

            if (obtainedMarks != null) {
                if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
                    throw new IllegalArgumentException("Obtained marks (" + obtainedMarks + ") must be between 0 and total marks (" + totalMarks + ").");
                }
            }

            String remarks = (String) item.get("remarks");

            String grade = "-";
            if (obtainedMarks != null) {
                double pct = ((double) obtainedMarks / totalMarks) * 100.0;
                if (pct >= 90) grade = "A+";
                else if (pct >= 80) grade = "A";
                else if (pct >= 70) grade = "B+";
                else if (pct >= 60) grade = "B";
                else if (pct >= 50) grade = "C";
                else if (pct >= 40) grade = "D";
                else grade = "F";
            }

            List<WeeklyTestResult> existingList = weeklyTestResultRepository.findByWeeklyTestIdAndStudentId(testId, studentId);
            WeeklyTestResult resRecord;
            if (!existingList.isEmpty()) {
                resRecord = existingList.get(0);
                resRecord.setObtainedMarks(obtainedMarks);
                resRecord.setGrade(grade);
                resRecord.setRemarks(remarks);
                resRecord.setUpdatedAt(LocalDateTime.now());
                if (existingList.size() > 1) {
                    weeklyTestResultRepository.deleteAll(existingList.subList(1, existingList.size()));
                }
            } else {
                resRecord = WeeklyTestResult.builder()
                        .weeklyTestId(testId)
                        .studentId(studentId)
                        .obtainedMarks(obtainedMarks)
                        .grade(grade)
                        .remarks(remarks)
                        .build();
            }
            savedList.add(weeklyTestResultRepository.save(resRecord));
        }
        return savedList;
    }

    @Transactional
    public List<WeeklyTestResult> saveWeeklyTestResults(UUID testId, List<Map<String, Object>> resultsList) {
        String identifier = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        return saveWeeklyTestResults(testId, resultsList, identifier);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherProfile(String identifier) {
        String cleanId = identifier;
        if (cleanId == null || cleanId.trim().isEmpty()) {
            cleanId = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        }

        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for: " + identifier));

        Map<String, Object> map = new HashMap<>();
        map.put("teacher_id", teacher.getTeacherId() != null ? teacher.getTeacherId().toString() : "");
        map.put("employee_id", teacher.getEmployeeId() != null ? teacher.getEmployeeId() : "");
        map.put("first_name", teacher.getFirstName() != null ? teacher.getFirstName() : "");
        map.put("last_name", teacher.getLastName() != null ? teacher.getLastName() : "");
        map.put("surname", teacher.getSurname() != null ? teacher.getSurname() : "");
        map.put("email", teacher.getEmail() != null ? teacher.getEmail() : "");
        map.put("mobile", teacher.getMobile() != null ? teacher.getMobile() : "");
        map.put("gender", teacher.getGender() != null ? teacher.getGender() : "");
        map.put("designation", teacher.getDesignation() != null ? teacher.getDesignation() : "");
        map.put("profile_photo", teacher.getProfilePhoto() != null ? teacher.getProfilePhoto() : "");
        map.put("joining_date", teacher.getJoiningDate() != null ? teacher.getJoiningDate().toString() : "");
        map.put("address", teacher.getAddress() != null ? teacher.getAddress() : "");
        map.put("is_active", teacher.getIsActive() != null ? teacher.getIsActive() : true);
        return map;
    }

    @Transactional
    public Map<String, Object> updateTeacherProfile(Map<String, Object> reqData) {
        String cleanId = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for authenticated user."));

        if (reqData != null) {
            if (reqData.containsKey("first_name")) teacher.setFirstName((String) reqData.get("first_name"));
            else if (reqData.containsKey("firstName")) teacher.setFirstName((String) reqData.get("firstName"));

            if (reqData.containsKey("last_name")) teacher.setLastName((String) reqData.get("last_name"));
            else if (reqData.containsKey("lastName")) teacher.setLastName((String) reqData.get("lastName"));

            if (reqData.containsKey("surname")) teacher.setSurname((String) reqData.get("surname"));
            if (reqData.containsKey("mobile")) teacher.setMobile((String) reqData.get("mobile"));
            if (reqData.containsKey("gender")) teacher.setGender((String) reqData.get("gender"));
            if (reqData.containsKey("designation")) teacher.setDesignation((String) reqData.get("designation"));
            if (reqData.containsKey("address")) teacher.setAddress((String) reqData.get("address"));

            if (reqData.containsKey("profile_photo")) teacher.setProfilePhoto((String) reqData.get("profile_photo"));
            else if (reqData.containsKey("profilePhoto")) teacher.setProfilePhoto((String) reqData.get("profilePhoto"));

            teacherRepository.save(teacher);
        }

        return getTeacherProfile(teacher.getEmail());
    }

    @Transactional
    public Map<String, Object> changeTeacherPassword(Map<String, Object> reqData) {
        String currentPassword = reqData != null && reqData.get("current_password") != null
                ? (String) reqData.get("current_password")
                : (reqData != null && reqData.get("currentPassword") != null ? (String) reqData.get("currentPassword") : null);

        String newPassword = reqData != null && reqData.get("new_password") != null
                ? (String) reqData.get("new_password")
                : (reqData != null && reqData.get("newPassword") != null ? (String) reqData.get("newPassword") : null);

        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Current password is required.");
        }
        if (newPassword == null || newPassword.trim().length() < 4) {
            throw new IllegalArgumentException("New password must be at least 4 characters long.");
        }

        String cleanId = com.educonnect.backend.security.SecurityUtils.getCurrentUserIdentifier();
        Teacher teacher = resolveTeacherByIdentifier(cleanId)
                .orElseThrow(() -> new NoSuchElementException("Teacher record not found for authenticated user."));

        if (!passwordEncoder.matches(currentPassword.trim(), teacher.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        teacher.setPassword(passwordEncoder.encode(newPassword.trim()));
        teacherRepository.save(teacher);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Teacher password updated successfully.");
        return response;
    }
}
