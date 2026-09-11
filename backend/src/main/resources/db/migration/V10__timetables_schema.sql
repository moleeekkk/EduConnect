-- Flyway migration V10: Create timetables schema for EduConnect
CREATE TABLE IF NOT EXISTS timetables (
    timetable_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id UUID,
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    semester_id UUID NOT NULL,
    department_id UUID NOT NULL,
    weekday VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50) NOT NULL,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE NOT NULL DEFAULT '2099-12-31',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timetables_teacher_id ON timetables(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetables_batch_sem ON timetables(batch_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_timetables_dept ON timetables(department_id);
CREATE INDEX IF NOT EXISTS idx_timetables_weekday ON timetables(weekday);
CREATE INDEX IF NOT EXISTS idx_timetables_is_active ON timetables(is_active);
