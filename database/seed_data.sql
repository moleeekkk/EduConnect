-- =========================================================
-- EduConnect PostgreSQL Database Seed Script
-- Database: educonnect_db
-- =========================================================

-- Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS SEED DATA (Only 1 Admin Account)
INSERT INTO admins (admin_id, first_name, last_name, email, password, mobile, gender, date_of_birth, address, is_active, created_at, updated_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Super', 'Administrator', 'admin@educonnect.ac.in', 'admin123', '+91 9876543210', 'Male', '1985-01-01', 'EduConnect Headquarters, Main Campus', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Clean up any legacy demo teachers and students
DELETE FROM students;
DELETE FROM teachers;

-- VERIFY SEED COUNTS
SELECT 'Admins Count: ' || COUNT(*) FROM admins;
SELECT 'Teachers Count: ' || COUNT(*) FROM teachers;
SELECT 'Students Count: ' || COUNT(*) FROM students;
