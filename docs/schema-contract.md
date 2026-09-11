# EduConnect PostgreSQL Schema Contract & Reconciliation Specification

## 1. Overview & Architectural Principles
- **Database Engine**: PostgreSQL 14+ (Port 5432, Database: `educonnect_db`)
- **Primary Keys**: UUID (Version 4 generated via `gen_random_uuid()` or `UUID.randomUUID()`)
- **Timestamp Standard**: `TIMESTAMP WITHOUT TIME ZONE` stored in UTC / ISO 8601 (`yyyy-MM-dd'T'HH:mm:ss`)
- **Uniqueness Enforcement**: Case-insensitive or explicit uppercase unique constraints on business identifiers (`enrollment_no`, `email`, `department_code`, `program_code`, `subject_code`, `institute_code`).

---

## 2. Reconciled Schema Contract Matrix

| Database Table Name | JPA Entity Class | Primary Key Column | Key Foreign Keys & Constraints | JSON DTO Compatibility Keys |
|---|---|---|---|---|
| `admins` | `Admin` | `admin_id` | `email` (UNIQUE NOT NULL) | `admin_id`, `email`, `first_name`, `last_name`, `mobile` |
| `institutes` | `Institute` | `institute_id` | `institute_code` (UNIQUE NOT NULL) | `institute_id`, `institute_code`, `institute_name` |
| `departments` | `Department` | `department_id` | `department_code` (UNIQUE NOT NULL), FK `institute_id` | `department_id`, `department_code`, `department_name`, `duration_years` |
| `programs` | `Program` | `program_id` | `program_code` (UNIQUE NOT NULL), FK `department_id`, FK `institute_id` | `program_id`, `program_code`, `program_name`, `total_semesters` |
| `semesters` | `Semester` | `semester_id` | FK `department_id` | `semester_id`, `semester_number`, `semester_name`, `department_id` |
| `batches` | `Batch` | `batch_id` | — | `batch_id`, `batch_name`, `start_year`, `end_year` |
| `teachers` | `Teacher` | `teacher_id` | `email` (UNIQUE NOT NULL), FK `institute_id`, FK `department_id` | `teacher_id`, `email`, `first_name`, `last_name`, `designation` |
| `students` | `Student` | `student_id` | `enrollment_no` (UNIQUE NOT NULL), FK `department_id`, FK `semester_id`, FK `batch_id` | `student_id`, `enrollment_no`, `first_name`, `last_name`, `email` |
| `subjects` | `Subject` | `subject_id` | `subject_code` (UNIQUE NOT NULL), FK `department_id`, FK `semester_id` | `subject_id`, `subject_code`, `subject_name`, `credits`, `subject_type` |
| `teacher_subjects` | `TeacherSubject` | `allocation_id` | UNIQUE(`teacher_id`, `subject_id`), FK `teacher_id`, FK `subject_id` | `allocation_id`, `teacher_subject_id` (JSON Alias), `teacher_id`, `subject_id` |
| `assignments` | `Assignment` | `assignment_id` | FK `subject_id` | `assignment_id`, `title`, `description`, `due_date`, `total_marks` |
| `assignment_submissions` | `AssignmentSubmission` | `submission_id` | UNIQUE(`assignment_id`, `student_id`), FK `assignment_id`, FK `student_id` | `submission_id`, `assignment_id`, `student_id`, `obtained_marks`, `submission_status` |
| `attendance_sessions` | `AttendanceSession` | `session_id` | FK `teacher_id`, FK `subject_id`, FK `semester_id`, FK `batch_id` | `session_id`, `teacher_id`, `subject_id`, `session_date` |
| `attendance_records` | `AttendanceRecord` | `record_id` | UNIQUE(`session_id`, `student_id`), FK `session_id`, FK `student_id` | `record_id`, `session_id`, `student_id`, `status` |
| `weekly_tests` | `WeeklyTest` | `weekly_test_id` | FK `teacher_subject_id`, FK `subject_id` | `weekly_test_id`, `weekly_exam_id` (JSON Alias), `title`, `test_date`, `total_marks` |
| `weekly_test_results` | `WeeklyTestResult` | `weekly_test_result_id` | UNIQUE(`weekly_test_id`, `student_id`), FK `weekly_test_id`, FK `student_id` | `weekly_test_result_id`, `weekly_test_id`, `student_id`, `obtained_marks`, `grade` |
| `system_settings` | `SystemSetting` | `setting_id` | `setting_key` (UNIQUE NOT NULL) | `setting_id`, `setting_key`, `setting_value` |
| `quizzes` | `Quiz` (In-Memory / Entity) | `quiz_id` | FK `subject_id`, FK `teacher_id` | `quiz_id`, `title`, `description`, `learner_type`, `total_questions` |
| `quiz_mcqs` | `QuizMcq` (In-Memory / Entity) | `mcq_id` | FK `quiz_id` | `mcq_id`, `quiz_id`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer` |

---

## 3. Discrepancy Resolution & Mapping Contracts

1. **`teacher_subjects` Primary Key**:
   - JPA Entity primary key: `@Column(name = "allocation_id") private UUID allocationId;`
   - Legacy API JSON compatibility: Serializes both `allocation_id` and `teacher_subject_id` via `@JsonProperty("teacher_subject_id")`.

2. **Weekly Exam vs Weekly Test Reconciliation**:
   - Canonical table: `weekly_tests` (`weekly_test_id`).
   - Legacy references to `weekly_exams` map directly to `weekly_tests` without duplicate schema creation.

3. **Academic Hierarchies**:
   - `semesters.department_id` references `departments.department_id`.
   - `programs.department_id` references `departments.department_id`.
   - `students` link to `department_id`, `semester_id`, and `batch_id`.

4. **Profile Photo Storage**:
   - `teachers.profile_photo` and `students.profile_photo` use `TEXT` data type to support standard image URLs as well as Base64 encoded avatars up to 10MB.

---

## 4. Read-Only Schema Verification Queries

```sql
-- 1. Check for Orphaned Student Department References
SELECT s.student_id, s.enrollment_no, s.department_id
FROM students s
LEFT JOIN departments d ON s.department_id = d.department_id
WHERE s.department_id IS NOT NULL AND d.department_id IS NULL;

-- 2. Check for Duplicate Enrollment Numbers
SELECT UPPER(enrollment_no), COUNT(*)
FROM students
GROUP BY UPPER(enrollment_no)
HAVING COUNT(*) > 1;

-- 3. Check for Duplicate Teacher Emails
SELECT LOWER(email), COUNT(*)
FROM teachers
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- 4. Check for Orphaned Attendance Records
SELECT ar.record_id, ar.session_id
FROM attendance_records ar
LEFT JOIN attendance_sessions s ON ar.session_id = s.session_id
WHERE s.session_id IS NULL;

-- 5. Check for Null Required Column Violations in Students
SELECT student_id, enrollment_no, first_name, email
FROM students
WHERE enrollment_no IS NULL OR first_name IS NULL OR email IS NULL;
```

---

## 5. Rollback & Disaster Recovery
- **Backup Verification**: Always execute `pg_dump -Fc -f backup_before_migration.dump educonnect_db` before applying DDL updates.
- **Rollback SQL Script**: To revert V1 migration tables in an isolated testing environment:
  ```sql
  DROP TABLE IF EXISTS quiz_mcqs, quizzes, system_settings, weekly_test_results, weekly_tests, attendance_records, attendance_sessions, assignment_submissions, assignments, teacher_subjects, subjects, students, teachers, batches, semesters, programs, departments, institutes, admins CASCADE;
  ```
