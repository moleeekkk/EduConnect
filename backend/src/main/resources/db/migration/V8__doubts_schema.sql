-- STEP 14: Doubts & Teacher Replies Schema

CREATE TABLE IF NOT EXISTS doubts (
    doubt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reply TEXT,
    replied_at TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doubts_student ON doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_teacher ON doubts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON doubts(subject_id);
CREATE INDEX IF NOT EXISTS idx_doubts_status ON doubts(status);
