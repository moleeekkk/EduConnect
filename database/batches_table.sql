-- =========================================================
-- EduConnect Batches Table Schema & Initial Seed Data
-- =========================================================

-- Create Batches Table
CREATE TABLE IF NOT EXISTS batches (
    batch_id VARCHAR(36) PRIMARY KEY,
    batch_name VARCHAR(100) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Batches Data
INSERT INTO batches (batch_id, batch_name, start_year, end_year, is_active, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'MCA 2023-2025', 2023, 2025, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'MCA 2024-2026', 2024, 2026, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'BCA 2022-2025', 2022, 2025, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', 'BCA 2023-2026', 2023, 2026, true, NOW(), NOW())
ON CONFLICT (batch_id) DO NOTHING;
