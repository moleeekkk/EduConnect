-- V12__notices_schema.sql
-- Create notices table for in-app board announcements and cohort notices

CREATE TABLE IF NOT EXISTS notices (
    notice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    author_id UUID NOT NULL,
    author_role VARCHAR(30) NOT NULL, -- 'ADMIN', 'TEACHER'
    author_name VARCHAR(150),
    target_role VARCHAR(30) NOT NULL DEFAULT 'ALL', -- 'ALL', 'STUDENT', 'TEACHER', 'COHORT'
    department_id UUID NULL,
    batch_id UUID NULL,
    teacher_subject_id UUID NULL,
    publish_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notices_author ON notices(author_id);
CREATE INDEX IF NOT EXISTS idx_notices_target ON notices(target_role, department_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active, is_archived, publish_date, expiry_date);
