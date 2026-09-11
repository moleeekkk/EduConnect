-- =========================================================
-- EduConnect PostgreSQL Migration V1: Initial Schema Reconciliation
-- Reconciles all entities, foreign keys, uniqueness constraints & query indexes
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS
CREATE TABLE IF NOT EXISTS admins (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    gender VARCHAR(10),
    date_of_birth DATE,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. INSTITUTES
CREATE TABLE IF NOT EXISTS institutes (
    institute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_code VARCHAR(30) UNIQUE NOT NULL,
    institute_name VARCHAR(150) NOT NULL,
    campus_location VARCHAR(150),
    contact_email VARCHAR(100),
    contact_mobile VARCHAR(15),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_code VARCHAR(30) UNIQUE NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    institute_id UUID REFERENCES institutes(institute_id) ON DELETE SET NULL,
    duration_years INT NOT NULL DEFAULT 2,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROGRAMS
CREATE TABLE IF NOT EXISTS programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(30) UNIQUE NOT NULL,
    program_name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    institute_id UUID REFERENCES institutes(institute_id) ON DELETE SET NULL,
    degree_type VARCHAR(50),
    total_semesters INT NOT NULL DEFAULT 4,
    duration_years INT NOT NULL DEFAULT 2,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. SEMESTERS
CREATE TABLE IF NOT EXISTS semesters (
    semester_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_number INT NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. BATCHES
CREATE TABLE IF NOT EXISTS batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(100) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),
    gender VARCHAR(10),
    designation VARCHAR(100),
    profile_photo TEXT,
    institute_id UUID REFERENCES institutes(institute_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    joining_date DATE,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_no VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(15),
    gender VARCHAR(10),
    date_of_birth DATE,
    address TEXT,
    profile_photo TEXT,
    institute_id UUID REFERENCES institutes(institute_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL,
    parent_name VARCHAR(100),
    parent_mobile VARCHAR(15),
    parent_email VARCHAR(100),
    blood_group VARCHAR(10),
    admission_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code VARCHAR(30) UNIQUE NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE CASCADE,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    credits INT DEFAULT 4,
    subject_type VARCHAR(50) DEFAULT 'Core Theory',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. TEACHER SUBJECT ALLOCATIONS
CREATE TABLE IF NOT EXISTS teacher_subjects (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_subject UNIQUE (teacher_id, subject_id)
);

-- 11. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    total_marks INT NOT NULL DEFAULT 50,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    file_name VARCHAR(255),
    attachment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(255),
    attachment TEXT,
    obtained_marks INT,
    feedback TEXT,
    submission_status VARCHAR(20) DEFAULT 'Timely',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

-- 13. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    topic TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS attendance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

-- 15. WEEKLY TESTS
CREATE TABLE IF NOT EXISTS weekly_tests (
    weekly_test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_subject_id UUID REFERENCES teacher_subjects(allocation_id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    test_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_marks INT NOT NULL DEFAULT 25,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. WEEKLY TEST RESULTS
CREATE TABLE IF NOT EXISTS weekly_test_results (
    weekly_test_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_test_id UUID NOT NULL REFERENCES weekly_tests(weekly_test_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    obtained_marks INT NOT NULL DEFAULT 0,
    grade VARCHAR(10),
    remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_test_student UNIQUE (weekly_test_id, student_id)
);

-- 17. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. QUIZZES
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learner_type VARCHAR(20) NOT NULL DEFAULT 'Fast',
    total_questions INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. QUIZ MCQS
CREATE TABLE IF NOT EXISTS quiz_mcqs (
    mcq_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer VARCHAR(5) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- QUERY OPTIMIZATION INDEXES
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_sem ON students(semester_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_subjects_dept ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_weekly_tests_date ON weekly_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
