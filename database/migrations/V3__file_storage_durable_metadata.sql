-- V3__file_storage_durable_metadata.sql
-- Reconcile and ensure durable file metadata columns across entity tables

-- 1. Ensure durable file columns on assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255);

-- 2. Ensure durable file columns on assignment_submissions
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS storage_key VARCHAR(255);

-- 3. Ensure durable file columns on study_materials (if table exists)
CREATE TABLE IF NOT EXISTS study_materials (
    material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    batch_id UUID REFERENCES batches(batch_id) ON DELETE SET NULL,
    attachment TEXT,
    file_name TEXT,
    file_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    storage_key VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create performance indexes on file_path columns
CREATE INDEX IF NOT EXISTS idx_assignments_file_path ON assignments(file_path);
CREATE INDEX IF NOT EXISTS idx_submissions_file_path ON assignment_submissions(file_path);
CREATE INDEX IF NOT EXISTS idx_study_materials_file_path ON study_materials(file_path);
