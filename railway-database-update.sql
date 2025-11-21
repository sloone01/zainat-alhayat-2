-- 🚀 Railway Database Update Script
-- Date: 2025-11-15
-- Description: Session Media Upload Functionality + Weekly Session Plans Enhancement

-- ============================================================================
-- 1. ADD SESSION COMPLETION TRACKING TO WEEKLY_SESSION_PLANS TABLE
-- ============================================================================

-- Add session status column with check constraint
ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS session_status VARCHAR(20) DEFAULT 'pending' 
CHECK (session_status IN ('pending', 'in_progress', 'completed', 'cancelled'));

-- Add completion tracking columns
ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS completion_description TEXT;

ALTER TABLE weekly_session_plans
ADD COLUMN IF NOT EXISTS completed_by UUID;

ALTER TABLE weekly_session_plans 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- ============================================================================
-- 2. CREATE SESSION_MEDIA TABLE FOR FILE UPLOADS
-- ============================================================================

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

-- ============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for weekly_session_plans
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_status ON weekly_session_plans(session_status);
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_completed_by ON weekly_session_plans(completed_by);
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_completed_at ON weekly_session_plans(completed_at);

-- Indexes for session_media
CREATE INDEX IF NOT EXISTS idx_session_media_session_plan_id ON session_media(session_plan_id);
CREATE INDEX IF NOT EXISTS idx_session_media_file_type ON session_media(file_type);
CREATE INDEX IF NOT EXISTS idx_session_media_uploaded_by ON session_media(uploaded_by);

-- ============================================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
    -- Add foreign key for completed_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_weekly_session_plans_completed_by'
    ) THEN
        ALTER TABLE weekly_session_plans 
        ADD CONSTRAINT fk_weekly_session_plans_completed_by 
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 5. UPDATE EXISTING RECORDS
-- ============================================================================

-- Update existing weekly session plans to have default status based on is_completed
UPDATE weekly_session_plans 
SET session_status = CASE 
    WHEN is_completed = true THEN 'completed'
    ELSE 'pending'
END
WHERE session_status IS NULL;

-- ============================================================================
-- 6. VERIFY INSTALLATION
-- ============================================================================

-- Check if tables exist and have correct structure
SELECT 
    'weekly_session_plans' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN session_status IS NOT NULL THEN 1 END) as records_with_status
FROM weekly_session_plans
UNION ALL
SELECT 
    'session_media' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN file_type IN ('photo', 'video') THEN 1 END) as valid_file_types
FROM session_media;

-- Show table structure
\d+ session_media;
\d+ weekly_session_plans;

-- ============================================================================
-- 7. IMPORTANT: CLEAN SAMPLE DATA SEPARATELY
-- ============================================================================

-- ⚠️  To clean sample/seed data, run the separate script:
-- production-database-cleanup.sql
--
-- This ensures session media functionality is added first,
-- then sample data is cleaned safely.

-- ============================================================================
-- 8. VERIFY CLEAN DATABASE
-- ============================================================================

-- Show remaining data counts
SELECT
    'courses' as table_name,
    COUNT(*) as record_count
FROM courses
UNION ALL
SELECT
    'users' as table_name,
    COUNT(*) as record_count
FROM users
UNION ALL
SELECT
    'schools' as table_name,
    COUNT(*) as record_count
FROM schools
UNION ALL
SELECT
    'academic_years' as table_name,
    COUNT(*) as record_count
FROM academic_years
UNION ALL
SELECT
    'semesters' as table_name,
    COUNT(*) as record_count
FROM semesters;

-- ============================================================================
-- INSTALLATION COMPLETE ✅
-- ============================================================================
