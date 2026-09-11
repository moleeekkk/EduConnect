-- STEP 15: Leave Requests & Review Schema

CREATE TABLE IF NOT EXISTS leave_requests (
    leave_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'Sick',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    reviewed_by UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    reviewed_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_cohort ON leave_requests(department_id, semester_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
