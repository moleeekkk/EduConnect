-- V4__study_materials_resource_type.sql
-- Ensure resource_type column exists on study_materials table

ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100) DEFAULT 'Study Material';
