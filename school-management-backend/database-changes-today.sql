-- Database Changes for Teacher Weekly Sessions Enhancement
-- Date: 2025-01-14
-- Description: Add session completion tracking with media uploads

-- 1. Add session completion tracking to weekly_session_plans table
ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS session_status VARCHAR(20) DEFAULT 'pending' CHECK (session_status IN ('pending', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS completion_description TEXT;

ALTER TABLE weekly_session_plans
ADD COLUMN IF NOT EXISTS completed_by UUID;

ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- 2. Create session_media table for storing uploaded photos and videos
CREATE TABLE IF NOT EXISTS session_media (
    id SERIAL PRIMARY KEY,
    session_plan_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('photo', 'video')),
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_plan_id) REFERENCES weekly_session_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_status ON weekly_session_plans(session_status);
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_completed_by ON weekly_session_plans(completed_by);
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_completed_at ON weekly_session_plans(completed_at);
CREATE INDEX IF NOT EXISTS idx_session_media_session_plan_id ON session_media(session_plan_id);
CREATE INDEX IF NOT EXISTS idx_session_media_file_type ON session_media(file_type);
CREATE INDEX IF NOT EXISTS idx_session_media_uploaded_by ON session_media(uploaded_by);

-- 4. Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_weekly_session_plans_completed_by'
    ) THEN
        ALTER TABLE weekly_session_plans 
        ADD CONSTRAINT fk_weekly_session_plans_completed_by 
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Update existing records to have default status
UPDATE weekly_session_plans 
SET session_status = CASE 
    WHEN is_completed = true THEN 'completed'
    ELSE 'pending'
END
WHERE session_status IS NULL;

-- 6. Create sample data for testing (optional - remove in production)
-- INSERT INTO weekly_session_plans (id, schedule_id, week_start_date, week_end_date, task_title, task_description, session_status, completion_description, created_by)
-- VALUES 
-- ('test-session-1', 'schedule-id-1', '2025-01-13', '2025-01-19', 'تعلم الحروف', 'درس تفاعلي لتعلم الحروف العربية', 'completed', 'تم تدريس الحروف أ، ب، ت بنجاح. الأطفال تفاعلوا بشكل ممتاز.', 'teacher-id-1'),
-- ('test-session-2', 'schedule-id-2', '2025-01-13', '2025-01-19', 'الأرقام الأساسية', 'تعلم الأرقام من 1 إلى 10', 'in_progress', NULL, 'teacher-id-1');

-- 7. Grant permissions (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON session_media TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE session_media_id_seq TO your_app_user;
