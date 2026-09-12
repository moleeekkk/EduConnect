-- V14: Backup Logs Schema for Tracking Administrator Database & Uploads Snapshots

CREATE TABLE IF NOT EXISTS backup_logs (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- DB_DUMP, UPLOADS_ZIP
    file_size BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, UNAVAILABLE
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at DESC);
