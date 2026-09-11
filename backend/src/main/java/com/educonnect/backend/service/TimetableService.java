package com.educonnect.backend.service;

import com.educonnect.backend.entity.*;
import com.educonnect.backend.repository.*;
import com.educonnect.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final DepartmentRepository departmentRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;

    private static final List<String> ORDERED_DAYS = Arrays.asList(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    );

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentTimetable(String identifier) {
        Student student = resolveStudentByIdentifier(identifier);
        if (student == null) {
            return Collections.emptyList();
        }

        UUID batchId = student.getBatchId();
        UUID semesterId = student.getSemesterId();
        UUID departmentId = student.getDepartmentId();

        List<Timetable> entries = Collections.emptyList();
        if (batchId != null && semesterId != null && departmentId != null) {
            entries = timetableRepository.findByBatchIdAndSemesterIdAndDepartmentIdAndIsActiveTrueOrderByStartTimeAsc(batchId, semesterId, departmentId);
        }
        if (entries.isEmpty() && batchId != null && semesterId != null) {
            entries = timetableRepository.findByBatchIdAndSemesterIdAndIsActiveTrueOrderByStartTimeAsc(batchId, semesterId);
        }
        if (entries.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDate today = LocalDate.now();
        List<Timetable> activeEntries = entries.stream()
                .filter(t -> (t.getEffectiveFrom() == null || !t.getEffectiveFrom().isAfter(today)) &&
                             (t.getEffectiveTo() == null || !t.getEffectiveTo().isBefore(today)))
                .collect(Collectors.toList());

        if (activeEntries.isEmpty()) {
            return Collections.emptyList();
        }

        // Enrich lookup maps
        Set<UUID> subjectIds = activeEntries.stream().map(Timetable::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        Set<UUID> teacherIds = activeEntries.stream().map(Timetable::getTeacherId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Teacher> teacherMap = teacherRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(Teacher::getTeacherId, t -> t));

        // Group slots by Day
        Map<String, List<Map<String, Object>>> daySlotsMap = new LinkedHashMap<>();
        for (String day : ORDERED_DAYS) {
            daySlotsMap.put(day, new ArrayList<>());
        }

        for (Timetable t : activeEntries) {
            String day = formatWeekdayName(t.getWeekday());
            Subject sub = subjectMap.get(t.getSubjectId());
            Teacher teach = teacherMap.get(t.getTeacherId());

            Map<String, Object> slot = new HashMap<>();
            slot.put("timetable_id", t.getTimetableId().toString());
            slot.put("id", t.getTimetableId().toString());
            slot.put("time", formatTimeRange(t.getStartTime(), t.getEndTime()));
            slot.put("start_time", t.getStartTime().toString());
            slot.put("end_time", t.getEndTime().toString());
            slot.put("subject", sub != null ? sub.getSubjectName() : "Academic Subject");
            slot.put("code", sub != null ? sub.getSubjectCode() : "SUB101");
            slot.put("teacher", teach != null ? (teach.getFirstName() + " " + teach.getLastName()).trim() : "Faculty Member");
            slot.put("teacher_id", t.getTeacherId().toString());
            slot.put("room", t.getRoom());
            slot.put("effective_from", t.getEffectiveFrom() != null ? t.getEffectiveFrom().toString() : "");
            slot.put("effective_to", t.getEffectiveTo() != null ? t.getEffectiveTo().toString() : "");

            daySlotsMap.computeIfAbsent(day, k -> new ArrayList<>()).add(slot);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : daySlotsMap.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                Map<String, Object> dayObj = new HashMap<>();
                dayObj.put("day", entry.getKey());
                dayObj.put("slots", entry.getValue());
                result.add(dayObj);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherSchedule(String identifier) {
        Teacher teacher = resolveTeacherByIdentifier(identifier);
        if (teacher == null) {
            return Collections.emptyList();
        }

        List<Timetable> entries = timetableRepository.findByTeacherIdAndIsActiveTrueOrderByStartTimeAsc(teacher.getTeacherId());
        if (entries.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDate today = LocalDate.now();
        List<Timetable> activeEntries = entries.stream()
                .filter(t -> (t.getEffectiveFrom() == null || !t.getEffectiveFrom().isAfter(today)) &&
                             (t.getEffectiveTo() == null || !t.getEffectiveTo().isBefore(today)))
                .collect(Collectors.toList());

        if (activeEntries.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> subjectIds = activeEntries.stream().map(Timetable::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        Set<UUID> batchIds = activeEntries.stream().map(Timetable::getBatchId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Batch> batchMap = batchRepository.findAllById(batchIds).stream()
                .collect(Collectors.toMap(Batch::getBatchId, b -> b));

        Set<UUID> semesterIds = activeEntries.stream().map(Timetable::getSemesterId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Semester> semesterMap = semesterRepository.findAllById(semesterIds).stream()
                .collect(Collectors.toMap(Semester::getSemesterId, sm -> sm));

        Map<String, List<Map<String, Object>>> daySlotsMap = new LinkedHashMap<>();
        for (String day : ORDERED_DAYS) {
            daySlotsMap.put(day, new ArrayList<>());
        }

        for (Timetable t : activeEntries) {
            String day = formatWeekdayName(t.getWeekday());
            Subject sub = subjectMap.get(t.getSubjectId());
            Batch batch = batchMap.get(t.getBatchId());
            Semester sem = semesterMap.get(t.getSemesterId());

            Map<String, Object> slot = new HashMap<>();
            slot.put("timetable_id", t.getTimetableId().toString());
            slot.put("id", t.getTimetableId().toString());
            slot.put("time", formatTimeRange(t.getStartTime(), t.getEndTime()));
            slot.put("start_time", t.getStartTime().toString());
            slot.put("end_time", t.getEndTime().toString());
            slot.put("subject", sub != null ? sub.getSubjectName() : "Academic Subject");
            slot.put("code", sub != null ? sub.getSubjectCode() : "SUB101");
            slot.put("subject_id", t.getSubjectId().toString());
            slot.put("batch", batch != null ? batch.getBatchName() : "Batch");
            slot.put("batch_id", t.getBatchId().toString());
            slot.put("semester", sem != null ? sem.getSemesterName() : "Semester");
            slot.put("semester_id", t.getSemesterId().toString());
            slot.put("teacher", (teacher.getFirstName() + " " + teacher.getLastName()).trim());
            slot.put("room", t.getRoom());

            daySlotsMap.computeIfAbsent(day, k -> new ArrayList<>()).add(slot);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : daySlotsMap.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                Map<String, Object> dayObj = new HashMap<>();
                dayObj.put("day", entry.getKey());
                dayObj.put("slots", entry.getValue());
                result.add(dayObj);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTodaySessionsForStudent(String identifier) {
        String todayWeekday = LocalDate.now().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        List<Map<String, Object>> studentDays = getStudentTimetable(identifier);

        for (Map<String, Object> dayObj : studentDays) {
            if (todayWeekday.equalsIgnoreCase(String.valueOf(dayObj.get("day")))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> slots = (List<Map<String, Object>>) dayObj.get("slots");
                List<Map<String, Object>> sessions = new ArrayList<>();
                int idx = 1;
                for (Map<String, Object> s : slots) {
                    Map<String, Object> sess = new HashMap<>();
                    sess.put("session_id", s.get("timetable_id"));
                    sess.put("lecture_no", idx++);
                    sess.put("topic", s.get("subject"));
                    sess.put("subject_name", s.get("subject"));
                    sess.put("start_time", s.get("start_time"));
                    sess.put("end_time", s.get("end_time"));
                    sess.put("room", s.get("room"));
                    sessions.add(sess);
                }
                return sessions;
            }
        }
        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTodaySessionsForTeacher(String identifier) {
        String todayWeekday = LocalDate.now().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        List<Map<String, Object>> teacherDays = getTeacherSchedule(identifier);

        for (Map<String, Object> dayObj : teacherDays) {
            if (todayWeekday.equalsIgnoreCase(String.valueOf(dayObj.get("day")))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> slots = (List<Map<String, Object>>) dayObj.get("slots");
                List<Map<String, Object>> sessions = new ArrayList<>();
                int idx = 1;
                for (Map<String, Object> s : slots) {
                    Map<String, Object> sess = new HashMap<>();
                    sess.put("session_id", s.get("timetable_id"));
                    sess.put("lecture_no", idx++);
                    sess.put("topic", s.get("subject"));
                    sess.put("subject_name", s.get("subject"));
                    sess.put("start_time", s.get("start_time"));
                    sess.put("end_time", s.get("end_time"));
                    sess.put("room", s.get("room"));
                    sess.put("subject_id", s.get("subject_id"));
                    sess.put("batch_id", s.get("batch_id"));
                    sessions.add(sess);
                }
                return sessions;
            }
        }
        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAdminTimetables() {
        List<Timetable> list = timetableRepository.findAllByOrderByCreatedAtDesc();
        if (list.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> teacherIds = list.stream().map(Timetable::getTeacherId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Teacher> teacherMap = teacherRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(Teacher::getTeacherId, t -> t));

        Set<UUID> subjectIds = list.stream().map(Timetable::getSubjectId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Subject> subjectMap = subjectRepository.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getSubjectId, s -> s));

        Set<UUID> batchIds = list.stream().map(Timetable::getBatchId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Batch> batchMap = batchRepository.findAllById(batchIds).stream()
                .collect(Collectors.toMap(Batch::getBatchId, b -> b));

        Set<UUID> semesterIds = list.stream().map(Timetable::getSemesterId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Semester> semesterMap = semesterRepository.findAllById(semesterIds).stream()
                .collect(Collectors.toMap(Semester::getSemesterId, sm -> sm));

        Set<UUID> deptIds = list.stream().map(Timetable::getDepartmentId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Department> deptMap = departmentRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(Department::getDepartmentId, d -> d));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Timetable t : list) {
            result.add(mapTimetableToAdminMap(t, teacherMap.get(t.getTeacherId()), subjectMap.get(t.getSubjectId()),
                    batchMap.get(t.getBatchId()), semesterMap.get(t.getSemesterId()), deptMap.get(t.getDepartmentId())));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> createTimetable(Map<String, Object> body) {
        return saveOrUpdateTimetable(null, body);
    }

    @Transactional
    public Map<String, Object> updateTimetable(UUID id, Map<String, Object> body) {
        return saveOrUpdateTimetable(id, body);
    }

    @Transactional
    public Map<String, Object> archiveTimetable(UUID id) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Timetable entry not found with id: " + id));
        t.setIsActive(false);
        Timetable saved = timetableRepository.save(t);

        Teacher teacher = teacherRepository.findById(saved.getTeacherId()).orElse(null);
        Subject subject = subjectRepository.findById(saved.getSubjectId()).orElse(null);
        Batch batch = batchRepository.findById(saved.getBatchId()).orElse(null);
        Semester semester = semesterRepository.findById(saved.getSemesterId()).orElse(null);
        Department dept = departmentRepository.findById(saved.getDepartmentId()).orElse(null);

        return mapTimetableToAdminMap(saved, teacher, subject, batch, semester, dept);
    }

    private Map<String, Object> saveOrUpdateTimetable(UUID existingId, Map<String, Object> body) {
        UUID teacherId = parseRequiredUuid(body, "teacher_id", "teacherId", "Faculty / Teacher");
        UUID subjectId = parseRequiredUuid(body, "subject_id", "subjectId", "Subject");
        UUID batchId = parseRequiredUuid(body, "batch_id", "batchId", "Batch / Cohort");
        UUID semesterId = parseRequiredUuid(body, "semester_id", "semesterId", "Semester");

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid teacher ID: " + teacherId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid subject ID: " + subjectId));
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid batch ID: " + batchId));
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid semester ID: " + semesterId));

        UUID departmentId = parseUuid(body.get("department_id"));
        if (departmentId == null) departmentId = parseUuid(body.get("departmentId"));
        if (departmentId == null) departmentId = subject.getDepartmentId();

        Department dept = null;
        if (departmentId != null) {
            dept = departmentRepository.findById(departmentId).orElse(null);
        }
        if (departmentId == null) {
            throw new IllegalArgumentException("Department ID is required.");
        }

        String rawWeekday = parseString(body.get("weekday"));
        if (rawWeekday == null || rawWeekday.trim().isEmpty()) {
            throw new IllegalArgumentException("Weekday is required.");
        }
        String weekday = formatWeekdayName(rawWeekday.trim());

        LocalTime startTime = parseLocalTime(body.get("start_time"));
        if (startTime == null) startTime = parseLocalTime(body.get("startTime"));
        if (startTime == null) throw new IllegalArgumentException("Start time is required (e.g. 09:30).");

        LocalTime endTime = parseLocalTime(body.get("end_time"));
        if (endTime == null) endTime = parseLocalTime(body.get("endTime"));
        if (endTime == null) throw new IllegalArgumentException("End time is required (e.g. 11:00).");

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time (" + startTime + ") must be before end time (" + endTime + ").");
        }

        String room = parseString(body.get("room"));
        if (room == null || room.trim().isEmpty()) {
            throw new IllegalArgumentException("Room / Location is required.");
        }
        room = room.trim();

        LocalDate effectiveFrom = parseLocalDate(body.get("effective_from"));
        if (effectiveFrom == null) effectiveFrom = parseLocalDate(body.get("effectiveFrom"));
        if (effectiveFrom == null) effectiveFrom = LocalDate.now();

        LocalDate effectiveTo = parseLocalDate(body.get("effective_to"));
        if (effectiveTo == null) effectiveTo = parseLocalDate(body.get("effectiveTo"));
        if (effectiveTo == null) effectiveTo = LocalDate.of(2099, 12, 31);

        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new IllegalArgumentException("Effective from date cannot be after effective to date.");
        }

        // Overlap Validations
        List<Timetable> teacherConf = timetableRepository.findTeacherConflicts(
                teacherId, weekday, startTime, endTime, effectiveFrom, effectiveTo, existingId);
        if (!teacherConf.isEmpty()) {
            Timetable conf = teacherConf.get(0);
            throw new IllegalArgumentException("Teacher Conflict: " + teacher.getFirstName() + " " + teacher.getLastName() +
                    " is already scheduled in " + conf.getRoom() + " (" + conf.getStartTime() + "-" + conf.getEndTime() + ") on " + weekday + ".");
        }

        List<Timetable> roomConf = timetableRepository.findRoomConflicts(
                room, weekday, startTime, endTime, effectiveFrom, effectiveTo, existingId);
        if (!roomConf.isEmpty()) {
            Timetable conf = roomConf.get(0);
            throw new IllegalArgumentException("Room Conflict: Room '" + room + "' is already occupied (" +
                    conf.getStartTime() + "-" + conf.getEndTime() + ") on " + weekday + ".");
        }

        List<Timetable> cohortConf = timetableRepository.findCohortConflicts(
                batchId, semesterId, weekday, startTime, endTime, effectiveFrom, effectiveTo, existingId);
        if (!cohortConf.isEmpty()) {
            Timetable conf = cohortConf.get(0);
            throw new IllegalArgumentException("Cohort Conflict: " + batch.getBatchName() + " already has a class scheduled (" +
                    conf.getStartTime() + "-" + conf.getEndTime() + ") on " + weekday + ".");
        }

        Timetable timetable;
        if (existingId != null) {
            timetable = timetableRepository.findById(existingId)
                    .orElseThrow(() -> new NoSuchElementException("Timetable entry not found with id: " + existingId));
        } else {
            timetable = new Timetable();
        }

        timetable.setTeacherId(teacherId);
        timetable.setSubjectId(subjectId);
        timetable.setBatchId(batchId);
        timetable.setSemesterId(semesterId);
        timetable.setDepartmentId(departmentId);
        timetable.setWeekday(weekday);
        timetable.setStartTime(startTime);
        timetable.setEndTime(endTime);
        timetable.setRoom(room);
        timetable.setEffectiveFrom(effectiveFrom);
        timetable.setEffectiveTo(effectiveTo);
        timetable.setIsActive(true);

        Timetable saved = timetableRepository.save(timetable);

        return mapTimetableToAdminMap(saved, teacher, subject, batch, semester, dept);
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

    private Map<String, Object> mapTimetableToAdminMap(Timetable t, Teacher teacher, Subject subject, Batch batch, Semester semester, Department dept) {
        Map<String, Object> map = new HashMap<>();
        String idStr = t.getTimetableId().toString();
        map.put("timetable_id", idStr);
        map.put("id", idStr);
        map.put("teacher_id", t.getTeacherId().toString());
        map.put("subject_id", t.getSubjectId().toString());
        map.put("batch_id", t.getBatchId().toString());
        map.put("semester_id", t.getSemesterId().toString());
        map.put("department_id", t.getDepartmentId().toString());
        map.put("weekday", t.getWeekday());
        map.put("start_time", t.getStartTime().toString());
        map.put("end_time", t.getEndTime().toString());
        map.put("time", formatTimeRange(t.getStartTime(), t.getEndTime()));
        map.put("room", t.getRoom());
        map.put("effective_from", t.getEffectiveFrom() != null ? t.getEffectiveFrom().toString() : "");
        map.put("effective_to", t.getEffectiveTo() != null ? t.getEffectiveTo().toString() : "");
        map.put("is_active", Boolean.TRUE.equals(t.getIsActive()));
        map.put("created_at", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "");

        map.put("teacher_name", teacher != null ? (teacher.getFirstName() + " " + teacher.getLastName()).trim() : "Faculty");
        map.put("subject_name", subject != null ? subject.getSubjectName() : "Subject");
        map.put("subject_code", subject != null ? subject.getSubjectCode() : "");
        map.put("batch_name", batch != null ? batch.getBatchName() : "Batch");
        map.put("semester_name", semester != null ? semester.getSemesterName() : "Semester");
        map.put("department_name", dept != null ? dept.getDepartmentName() : "Department");

        return map;
    }

    private String formatWeekdayName(String raw) {
        if (raw == null) return "Monday";
        String clean = raw.trim();
        for (String day : ORDERED_DAYS) {
            if (day.equalsIgnoreCase(clean)) {
                return day;
            }
        }
        return clean.substring(0, 1).toUpperCase() + clean.substring(1).toLowerCase();
    }

    private String formatTimeRange(LocalTime start, LocalTime end) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
        return start.format(fmt) + " - " + end.format(fmt);
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
        return obj != null ? obj.toString() : null;
    }

    private LocalTime parseLocalTime(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalTime) return (LocalTime) obj;
        String str = obj.toString().trim();
        if (str.isEmpty()) return null;
        try {
            if (str.length() == 5) str += ":00";
            return LocalTime.parse(str);
        } catch (Exception e) {
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);
                return LocalTime.parse(str.toUpperCase(), fmt);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    private LocalDate parseLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalDate) return (LocalDate) obj;
        String str = obj.toString().trim();
        if (str.isEmpty()) return null;
        try {
            return LocalDate.parse(str);
        } catch (Exception e) {
            return null;
        }
    }
}
