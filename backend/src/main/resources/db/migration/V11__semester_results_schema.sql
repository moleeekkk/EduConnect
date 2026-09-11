-- Flyway migration V11: Create semester_results and semester_result_details schema
CREATE TABLE IF NOT EXISTS semester_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(semester_id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    sgpa NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    cgpa NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_credits INT NOT NULL DEFAULT 0,
    earned_credits INT NOT NULL DEFAULT 0,
    total_marks NUMERIC(7,2) NOT NULL DEFAULT 0.00,
    obtained_marks NUMERIC(7,2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    result_status VARCHAR(20) NOT NULL DEFAULT 'PASS',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITHOUT TIME ZONE,
    published_by UUID REFERENCES admins(admin_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_semester_result UNIQUE (student_id, semester_id)
);

CREATE TABLE IF NOT EXISTS semester_result_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES semester_results(result_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters(semester_id) ON DELETE CASCADE,
    credits INT NOT NULL DEFAULT 4,
    internal_marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    external_marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    obtained_marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_marks NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(10) NOT NULL DEFAULT 'F',
    grade_point NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    result_status VARCHAR(20) NOT NULL DEFAULT 'PASS',
    remarks TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_subject_sem_detail UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX IF NOT EXISTS idx_sem_results_student ON semester_results(student_id);
CREATE INDEX IF NOT EXISTS idx_sem_results_sem ON semester_results(semester_id);
CREATE INDEX IF NOT EXISTS idx_sem_results_published ON semester_results(is_published);
CREATE INDEX IF NOT EXISTS idx_sem_details_result ON semester_result_details(result_id);
CREATE INDEX IF NOT EXISTS idx_sem_details_student ON semester_result_details(student_id);
CREATE INDEX IF NOT EXISTS idx_sem_details_subject ON semester_result_details(subject_id);
