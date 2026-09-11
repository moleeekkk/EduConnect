-- V5__syllabus_authoring_tables.sql
-- Create syllabi and syllabus_units tables for authored course syllabus data

CREATE TABLE IF NOT EXISTS syllabi (
    syllabus_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(teacher_id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES semesters(semester_id) ON DELETE SET NULL,
    title VARCHAR(200),
    file_name TEXT,
    file_path TEXT,
    file_type TEXT,
    file_size BIGINT,
    storage_key VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_syllabus_subject UNIQUE (subject_id)
);

CREATE TABLE IF NOT EXISTS syllabus_units (
    unit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID NOT NULL REFERENCES syllabi(syllabus_id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    unit_title VARCHAR(250) NOT NULL,
    description TEXT,
    topics TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_syllabi_subject ON syllabi(subject_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_units_syllabus ON syllabus_units(syllabus_id);
