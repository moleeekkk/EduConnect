-- =========================================================
-- EduConnect Semesters Table Schema & Initial Seed Data
-- DB Fields: semester_id {PK}, department_id {FK}, semester_name, semester_number, is_active, created_at, updated_at
-- =========================================================

CREATE TABLE IF NOT EXISTS semesters (
    semester_id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    semester_number INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_semester_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- Initial seed semesters
INSERT INTO semesters (semester_id, department_id, semester_name, semester_number, is_active, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Semester 1', 1, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Semester 2', 2, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Semester 3', 3, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Semester 4', 4, true, NOW(), NOW())
ON CONFLICT (semester_id) DO NOTHING;
