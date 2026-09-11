-- STEP 12: Quiz & MCQ Authoring Schema Enhancements

ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL;

ALTER TABLE quiz_mcqs
ADD COLUMN IF NOT EXISTS mcq_order INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published, is_archived);
CREATE INDEX IF NOT EXISTS idx_quiz_mcqs_quiz ON quiz_mcqs(quiz_id, mcq_order);
