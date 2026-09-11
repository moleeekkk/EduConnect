-- V13__email_logs_schema.sql
-- Create email_logs table for parent notification and reminder audit history

CREATE TABLE IF NOT EXISTS email_logs (
    email_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    sender_role VARCHAR(30) NOT NULL,
    recipient_email VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(150),
    student_id UUID NULL,
    assignment_id UUID NULL,
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(250) NOT NULL,
    body_snapshot TEXT NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'SENT', 'FAILED', 'ACCEPTED'
    error_detail TEXT NULL,
    idempotency_key VARCHAR(100) NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sender ON email_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_student ON email_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON email_logs(idempotency_key);
