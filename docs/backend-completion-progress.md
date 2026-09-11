# EduConnect Backend Completion Progress & Baseline Tracker

## Project Overview
- **Repository Branch**: `manish-leatest`
- **Git Status**: Clean working tree baseline
- **Stack**: React (Vite + Vanilla CSS / Tailwind), Java 21 + Spring Boot 3.x, PostgreSQL
- **API Base URL**: `http://localhost:8080/api/v1`

---

## Step 00 — Safe Baseline Verification

### Safety Controls Implemented
1. **Disabled-by-Default Seeding**:
   - `app.seed.enabled=${APP_SEED_ENABLED:false}` added to `application.properties`.
   - `DataInitializer.java` explicitly checks `app.seed.enabled` on startup and skips data initialization unless set to `true`.
2. **Removed Automatic Student Deletion**:
   - Removed legacy hardcoded deletion logic targeting `Alex Johnson` in `DataInitializer.java`.
3. **Removed Silent Demo Account Recreation**:
   - `AuthService.java` (`teacherLogin` and `adminLogin`) modified to perform strict database lookup against PostgreSQL without recreating default accounts if missing.
4. **Secrets Externalized**:
   - DataSource URL, credentials, SMTP mail credentials, and JWT Secret externalized with environment variable placeholders while retaining local fallback defaults.
5. **Database Script Safety Warning**:
   - `database/seed_data.sql` recorded as **UNSAFE** for populated environments because it executes destructive `DELETE FROM students;` and `DELETE FROM teachers;`.

---

## Step 01 — Database Schema & Migration Foundation

### Accomplishments & DDL Versioning
1. **Created Versioned PostgreSQL DDL Migration Scripts**:
   - `database/migrations/V1__initial_schema_reconciliation.sql`
   - `backend/src/main/resources/db/migration/V1__initial_schema_reconciliation.sql`
2. **Reconciled Discrepancies**:
   - **`teacher_subjects`**: Primary key set to `allocation_id` with `@JsonProperty("teacher_subject_id")` alias getter in `TeacherSubject.java` for full backward JSON compatibility.
   - **`weekly_tests` & `weekly_test_results`**: Canonical schema established reconciling legacy `weekly_exams` naming.
   - **Foreign Keys**: Cascading deletion / nullification behavior configured across `departments`, `semesters`, `subjects`, `teacher_subjects`, `assignments`, `assignment_submissions`, `weekly_tests`, `weekly_test_results`, `quizzes`, `quiz_mcqs`.
   - **Uniqueness & Query Indexing**: Added unique constraints (`enrollment_no`, `email`, `subject_code`, `department_code`, `program_code`, `institute_code`, `setting_key`, `(teacher_id, subject_id)`, `(assignment_id, student_id)`, `(session_id, student_id)`, `(weekly_test_id, student_id)`) and performance B-Tree query indexes.
3. **Created Formal Schema Documentation**:
   - `docs/schema-contract.md` created with complete column data types, constraints, entity matrix, JSON mapping rules, read-only audit SQL queries, and rollback/recovery steps.

---

## Application Inventory & Gap Analysis

### 1. Database Entity Tables (PostgreSQL Schema)
- `admins` (`admin_id`, `first_name`, `last_name`, `email`, `password`, `mobile`, `gender`, `date_of_birth`, `address`, `is_active`, `created_at`, `updated_at`)
- `teachers` (`teacher_id`, `first_name`, `last_name`, `surname`, `email`, `password`, `mobile`, `gender`, `designation`, `profile_photo`, `institute_id`, `department_id`, `joining_date`, `address`, `is_active`, `created_at`, `updated_at`)
- `students` (`student_id`, `enrollment_no`, `first_name`, `last_name`, `surname`, `email`, `mobile`, `gender`, `date_of_birth`, `address`, `profile_photo`, `institute_id`, `department_id`, `semester_id`, `batch_id`, `parent_name`, `parent_mobile`, `parent_email`, `blood_group`, `admission_date`, `is_active`, `created_at`, `updated_at`)
- `institutes` (`institute_id`, `institute_code`, `institute_name`, `campus_location`, `contact_email`, `contact_mobile`, `description`, `is_active`, `created_at`, `updated_at`)
- `departments` (`department_id`, `department_code`, `department_name`, `institute_id`, `duration_years`, `description`, `is_active`, `created_at`, `updated_at`)
- `programs` (`program_id`, `program_code`, `program_name`, `department_id`, `institute_id`, `degree_type`, `total_semesters`, `duration_years`, `description`, `is_active`, `created_at`, `updated_at`)
- `semesters` (`semester_id`, `semester_number`, `semester_name`, `department_id`, `is_active`, `created_at`, `updated_at`)
- `batches` (`batch_id`, `batch_name`, `start_year`, `end_year`, `is_active`, `created_at`, `updated_at`)
- `subjects` (`subject_id`, `subject_code`, `subject_name`, `department_id`, `semester_id`, `credits`, `subject_type`, `description`, `is_active`, `created_at`, `updated_at`)
- `teacher_subjects` (`allocation_id`, `teacher_id`, `subject_id`, `is_active`, `created_at`, `updated_at`)
- `assignments` (`assignment_id`, `title`, `description`, `due_date`, `total_marks`, `subject_id`, `file_name`, `attachment`, `created_at`)
- `assignment_submissions` (`submission_id`, `assignment_id`, `student_id`, `submission_date`, `file_name`, `attachment`, `obtained_marks`, `feedback`, `submission_status`)
- `attendance_sessions` (`session_id`, `teacher_id`, `subject_id`, `semester_id`, `batch_id`, `session_date`, `topic`, `created_at`)
- `attendance_records` (`record_id`, `session_id`, `student_id`, `status`, `remarks`, `created_at`)
- `weekly_tests` (`weekly_test_id`, `teacher_subject_id`, `subject_id`, `title`, `description`, `test_date`, `start_time`, `end_time`, `total_marks`, `created_at`, `updated_at`)
- `weekly_test_results` (`weekly_test_result_id`, `weekly_test_id`, `student_id`, `obtained_marks`, `grade`, `remarks`, `created_at`, `updated_at`)
- `system_settings` (`setting_id`, `setting_key`, `setting_value`, `description`, `updated_at`)
- `quizzes` (`quiz_id`, `subject_id`, `teacher_id`, `title`, `description`, `learner_type`, `total_questions`, `created_at`, `updated_at`)
- `quiz_mcqs` (`mcq_id`, `quiz_id`, `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`, `created_at`)

### 2. Frontend Routes & Page Status
| Portal | Route Path | Component File | Status | Notes / Identified Gaps |
|---|---|---|---|---|
| Auth | `/` | `LoginSelection.jsx` | Fully Implemented | User type portal selection |
| Auth | `/student-login` | `StudentLogin.jsx` | Fully Implemented | OTP request trigger |
| Auth | `/verify-otp` | `OTPVerification.jsx` | Fully Implemented | OTP code verification & JWT store |
| Auth | `/teacher-login` | `TeacherLogin.jsx` | Fully Implemented | Email/password verification |
| Auth | `/admin-login` | `AdminLogin.jsx` | Fully Implemented | Email/password verification |
| Auth | `/forgot-password` | `ForgotPassword.jsx` | Fully Implemented | Reset code request & update |
| Student | `/student/dashboard` | `student/Dashboard.jsx` | Partial | Summary widgets & attendance stats |
| Student | `/student/profile` | `student/Profile.jsx` | Fully Implemented | Student profile view |
| Student | `/student/attendance` | `student/Attendance.jsx` | Partial | Attendance progress visualization |
| Student | `/student/marksheet` | `student/Marksheet.jsx` | Partial | Academic performance & grades |
| Student | `/student/timetable` | `student/Timetable.jsx` | Partial | Schedule view |
| Student | `/student/assignments` | `student/Assignments.jsx` | Partial | Submission upload using fallback/API |
| Student | `/student/weekly-tests` | `student/WeeklyTests.jsx` | Partial | Test marks and status |
| Student | `/student/quiz-practice` | `student/QuizPractice.jsx` | Partial | Interactive quiz practice with localStorage fallbacks |
| Student | `/student/study-material` | `student/StudyMaterial.jsx` | Partial | Material downloads |
| Student | `/student/digital-id` | `student/DigitalID.jsx` | Fully Implemented | Digital student ID card |
| Student | `/student/leave-request` | `student/LeaveRequest.jsx` | Partial | Leave application submit |
| Student | `/student/doubts` | `student/AskDoubts.jsx` | Partial | Ask doubt form |
| Teacher | `/teacher/dashboard` | `teacher/Dashboard.jsx` | Partial | Summary stats & widgets |
| Teacher | `/teacher/profile` | `teacher/Profile.jsx` | Partial | Gaps: `teacherApi.changePassword` endpoint missing |
| Teacher | `/teacher/students` | `teacher/ManageStudents.jsx` | Fully Implemented | Student roster view |
| Teacher | `/teacher/attendance` | `teacher/AttendanceMarker.jsx` | Partial | Gaps: Attendance DTO mismatch |
| Teacher | `/teacher/assignments` | `teacher/UploadAssignment.jsx` | Partial | Gaps: `localStorage` submission fallbacks |
| Teacher | `/teacher/weekly-tests` | `teacher/WeeklyTests.jsx` | Fully Implemented | Weekly test creation & past date validation |
| Teacher | `/teacher/quiz-practice` | `teacher/QuizPractice.jsx` | Partial | Gaps: `localStorage` fallback for quiz persistence |
| Teacher | `/teacher/study-material` | `teacher/StudyMaterial.jsx` | Partial | Material upload form |
| Teacher | `/teacher/reply-doubts` | `teacher/ReplyDoubts.jsx` | Partial | Doubt reply interface |
| Teacher | `/teacher/leave-management` | `teacher/LeaveManagement.jsx` | Partial | Leave request review |
| Teacher | `/teacher/parent-email` | `teacher/ParentEmail.jsx` | Partial | Gaps: ParentEmail mock / test mail dispatch |
| Admin | `/admin/dashboard` | `admin/Dashboard.jsx` | Fully Implemented | Dashboard metrics & counts |
| Admin | `/admin/batches` | `admin/BatchManagement.jsx` | Fully Implemented | Batch CRUD |
| Admin | `/admin/profile` | `admin/Profile.jsx` | Partial | Gaps: Admin Profile Save missing backend endpoint |
| Admin | `/admin/students` | `admin/StudentManagement.jsx` | Fully Implemented | Student CRUD & institute/department filter |
| Admin | `/admin/teachers` | `admin/FacultyManagement.jsx` | Fully Implemented | Faculty CRUD |
| Admin | `/admin/institutes` | `admin/InstituteManagement.jsx` | Fully Implemented | Institute CRUD |
| Admin | `/admin/departments` | `admin/DepartmentManagement.jsx` | Fully Implemented | Department CRUD |
| Admin | `/admin/semesters` | `admin/SemesterManagement.jsx` | Fully Implemented | Semester CRUD & status toggle |
| Admin | `/admin/subjects` | `admin/SubjectManagement.jsx` | Fully Implemented | Subject CRUD |
| Admin | `/admin/teacher-subjects` | `admin/TeacherSubjectAllocation.jsx` | Fully Implemented | Faculty subject allocation toggle |
| Admin | `/admin/reports` | `admin/Reports.jsx` | Partial | Gaps: Fake/mock report metrics in `AdminService.getReports()` |

---

## Baseline Evidence & Test Outcomes

### 1. Backend Compilation (`mvn clean compile -DskipTests`)
- **Status**: `PASS`
- **Result**: `BUILD SUCCESS` (0 errors across 62 source files)

### 2. Frontend Production Build (`npm run build`)
- **Status**: `PASS`
- **Result**: `built in 1.38s` (0 Vite build errors)

### 3. Execution Controls
- **DataInitializer Seeding**: Disabled (`app.seed.enabled=false`)
- **Demo Account Recreation**: Removed from `AuthService.java`
- **Secrets Externalization**: Environment variable placeholders configured in `application.properties`

---

## Step 02 — Honest API Errors, Authentication & Role Sessions

### Implementation Details
1. **Frontend Error Handling & 401 Interceptor (`api.js`)**:
   - Removed default error swallowing fallback (`fallbackValue`) from `handleRequest`. Read query helpers now propagate errors so component promise rejections trigger proper loading/error/retry UI states.
   - Added Axios response interceptor for 401 Unauthorized status. When 401 occurs, role-specific session storage keys (`educonnect_token_student`, `educonnect_user_teacher`, `educonnect_user_admin`, etc.) are cleared and users are redirected to their matching login route (`/student-login`, `/teacher-login`, `/admin-login`).

2. **Global Exception Mapping (`GlobalExceptionHandler.java`)**:
   - Implemented mapping of exception classes to HTTP response status codes:
     - **400 Bad Request**: `IllegalArgumentException`, `MethodArgumentNotValidException`, `HttpMessageNotReadableException`, `BindException`.
     - **401 Unauthorized**: `BadCredentialsException`, `AuthenticationException`, `JwtException`.
     - **403 Forbidden**: `AccessDeniedException`, `SecurityException`.
     - **404 Not Found**: `NoSuchElementException`, `FileNotFoundException`.
     - **409 Conflict**: `IllegalStateException`, `DataIntegrityViolationException`.
     - **413 Payload Too Large**: `MaxUploadSizeExceededException`.

3. **Active Account Validation (`JwtAuthenticationFilter.java` & `AuthService.java`)**:
   - `JwtAuthenticationFilter` resolves user existence and validates `is_active` status in PostgreSQL before placing `Authentication` in `SecurityContextHolder`. Disabled accounts (`is_active = false`) are denied access.
   - `AuthService` checks `is_active` status during student OTP dispatch/verification and teacher/admin logins.

4. **OTP & Password Reset Isolation (`AuthService.java` & `AuthController.java`)**:
   - Removed default demo password bypasses (`teacher123`/`admin123`) from `AuthService`.
   - Student OTP email dispatch validates SMTP delivery (`emailService.sendOtpEmail`). If email delivery fails, `success: false` is returned without saving active OTP. Corrected success message to remove false claims of SMS delivery.
   - Password reset code store changed key format from `email` to `ROLE:email` (`ROLE_TEACHER:user@domain`, `ROLE_ADMIN:user@domain`), ensuring shared email addresses between teacher and admin roles reset only the requested role's credentials. Reset codes expire in 10 minutes, enforce a maximum of 5 attempts, and clear after single use.

5. **Reusable Security & Ownership Helper (`SecurityUtils.java` & Controllers)**:
   - Created `SecurityUtils.java` to extract current user principal identifier, authority roles, and validate ownership/admin permissions.
   - Updated `StudentController` and `TeacherController` profile and submission mutation endpoints to validate body identity parameters against authenticated user identity, rejecting body identity mismatches.

---

## Step 03 — Academic Scope and Teacher Manage Students

### Implementation Details
1. **PostgreSQL Migration V2 (`V2__academic_allocation_cohort_scoping.sql`)**:
   - Created versioned database migration scripts in `backend/src/main/resources/db/migration/V2__academic_allocation_cohort_scoping.sql` and `database/migrations/V2__academic_allocation_cohort_scoping.sql`.
   - Added `batch_id` (foreign key to `batches`) and `semester_id` (foreign key to `semesters`) columns to `teacher_subjects`.
   - Added index `idx_teacher_subjects_cohort` on `(teacher_id, subject_id, batch_id, semester_id)` for high-performance cohort scoping.

2. **Entity & Repository Scoping**:
   - `TeacherSubject.java`: Added `batchId` and `semesterId` fields with `@Column(name = "batch_id")` and `@Column(name = "semester_id")`.
   - `TeacherSubjectRepository.java`: Added repository queries for active teacher allocations (`findByTeacherIdAndIsActiveTrue`), teacher subject matching (`findByTeacherIdAndSubjectIdAndIsActiveTrue`), and cohort matching (`findByTeacherIdAndSubjectIdAndBatchId`).

3. **Backend Service & Controller Cohort Scoping**:
   - **`TeacherService.java`**:
     - Updated `getAssignedSubjectsForTeacher` to return `Collections.emptyList()` (`[]`) when a teacher has no allocations, eliminating legacy fallback leakage of all system subjects.
     - Scoped `getStudentsForTeacher` to fetch only students belonging to the teacher's permitted department, semester, and batch cohort allocations. Excluded password hashes and sensitive authentication fields from returned student records.
     - Enforced cohort validation in `getAssignmentsForTeacher` and `getWeeklyTestsForTeacher`.
     - Implemented `getBatchesForTeacher` to retrieve distinct active batches allocated to the teacher.
   - **`StudentService.java`**:
     - Updated `getStudentAssignments` and `getWeeklyTestsForStudent` to filter assignments and tests by student's department, semester, and batch enrollment scope.
     - Implemented `getSubjectsForStudent` and `getBatchesForStudent` endpoints.
   - **`TeacherController.java` & `StudentController.java`**:
     - Bound controller endpoints to active `SecurityContextHolder` authentication context.
     - Added `/teacher/batches`, `/teacher/subjects`, `/student/subjects`, and `/student/batches` lookup endpoints.

4. **Frontend API & Component Scoping**:
   - **`api.js`**: Added `getSubjects` and `getBatches` helpers to `studentApi` and `teacherApi`. Updated `adminApi.toggleTeacherSubject` to accept and pass `batch_id` and `semester_id`.
   - **`BatchContext.jsx`**: Updated batch provider to dynamically call `adminApi.getBatches()`, `teacherApi.getBatches()`, or `studentApi.getBatches()` based on the authenticated user role (`ADMIN`, `TEACHER`, `STUDENT`).
   - **`ManageStudents.jsx`**: Refactored teacher student directory with honest loading and error handling, field fallbacks, search/department/semester/status filter controls, and read-only student profile modal.
   - **`TeacherSubjectAllocation.jsx`**: Added batch cohort selector and enabled batch and semester parameter passing when creating or toggling teacher-subject allocations.

---

## Step 04 — Real File Upload, Preview and Download

### Implementation Details
1. **PostgreSQL Migration V3 (`V3__file_storage_durable_metadata.sql`)**:
   - Created versioned database migration scripts in `backend/src/main/resources/db/migration/V3__file_storage_durable_metadata.sql` and `database/migrations/V3__file_storage_durable_metadata.sql`.
   - Added durable file metadata columns (`file_name`, `file_path`, `file_type`, `file_size`, `storage_key`) to `assignments`, `assignment_submissions`, and `study_materials`.
   - Created B-Tree performance indexes on `file_path` columns.

2. **Durable File Storage & Security Traversal Protection (`FileStorageService.java`)**:
   - Implemented physical storage handling under configured `app.upload.directory` (`uploads/`).
   - Added server-managed unique storage key generation (`UUID_filename.ext`), allowed file extensions/MIME filtering, and maximum size enforcement (25MB).
   - Replaced insecure path check with strict canonical real path verification (`realTarget.startsWith(realRoot)`), preventing path traversal and symlink escape attacks.

3. **Multipart Upload & Assignment File Serving (`FileUploadController.java`, `AssignmentFileService.java`)**:
   - Created `FileUploadController` for `POST /api/v1/files/upload` accepting `MultipartFile` and returning persisted metadata JSON.
   - Refactored `AssignmentFileService`:
     - Added cohort and ownership authorization for assignment and submission file endpoints.
     - Added byte stream rendering for valid base64 Data URLs (`data:...`).
     - Throwing `FileNotFoundException` (HTTP 404) for missing physical files instead of returning fabricated sample text documents.

4. **Frontend Authenticated Blob Viewing & Downloading (`api.js`, `fileViewer.js`, `DocumentViewerModal.jsx`)**:
   - Added `fileApi.uploadFile` and `fileApi.getFileBlob` in `api.js`.
   - Updated `downloadFile` and `openFileInNewTab` in `fileViewer.js` to fetch protected files with Bearer authentication and render via short-lived blob URLs (`URL.createObjectURL`), revoking blob URLs when completed.
   - Updated `DocumentViewerModal.jsx` to load and display authenticated binary blobs in full-screen iframe and image viewports.

---

## Baseline Evidence & Test Outcomes

### 1. Backend Compilation (`mvn clean compile -DskipTests`)
- **Status**: `PASS`
- **Result**: `BUILD SUCCESS` (0 errors across source files)

### 2. Frontend Production Build (`npm run build`)
- **Status**: `PASS`
- **Result**: `built cleanly` (0 Vite build errors)

---

## Next Step
- **Next Step**: Prompt 05 — Teacher Assignment Workflow & Student Submissions.

