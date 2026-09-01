-- =========================================================
-- EduConnect Departments Table Schema
-- Order of fields:
-- 1. department_id {PK}
-- 2. department_code
-- 3. department_name
-- 4. institute_id {FK}
-- 5. duration_years
-- 6. description
-- 7. is_active
-- 8. created_at
-- 9. updated_at
-- =========================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id VARCHAR(36) PRIMARY KEY,
    department_code VARCHAR(30) UNIQUE NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    institute_id VARCHAR(36),
    duration_years INT NOT NULL DEFAULT 2,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_institute FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE CASCADE
);
