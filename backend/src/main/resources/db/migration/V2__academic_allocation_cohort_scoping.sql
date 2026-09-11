-- =========================================================
-- EduConnect PostgreSQL Migration V2: Academic Allocation Cohort Scoping
-- Adds batch_id and semester_id columns to teacher_subjects
-- =========================================================

ALTER TABLE teacher_subjects ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL;
ALTER TABLE teacher_subjects ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_teacher_subjects_cohort ON teacher_subjects(teacher_id, subject_id, batch_id);
