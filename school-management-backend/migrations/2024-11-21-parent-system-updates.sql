-- Migration: Parent System Updates
-- Date: 2024-11-21
-- Description: Updates to support the parent dashboard system

-- Update parent entity user_id field to support UUID
ALTER TABLE parents 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Add comment for clarity
COMMENT ON COLUMN parents.user_id IS 'UUID reference to users table for parent login';

-- Ensure proper foreign key constraint exists
ALTER TABLE parents 
DROP CONSTRAINT IF EXISTS fk_parents_user_id;

ALTER TABLE parents 
ADD CONSTRAINT fk_parents_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance on parent dashboard queries
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_student_id ON student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent_id ON student_parents(parent_id);

-- Add any missing indexes for parent dashboard performance
CREATE INDEX IF NOT EXISTS idx_schedules_group_id ON schedules(group_id);
CREATE INDEX IF NOT EXISTS idx_weekly_session_plans_schedule_id ON weekly_session_plans(schedule_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);

-- Link existing parent records with their corresponding user accounts
-- This matches parents with users based on email addresses
UPDATE parents
SET user_id = u.id
FROM users u
WHERE parents.email = u.email
AND u.role = 'parent'
AND parents.user_id IS NULL;

-- Update any existing parent records to ensure data consistency
-- This will set user_id to NULL for any invalid references
UPDATE parents
SET user_id = NULL
WHERE user_id IS NOT NULL
AND user_id NOT IN (SELECT id FROM users WHERE role = 'parent');

-- Ensure all parent users have proper role
UPDATE users
SET role = 'parent'
WHERE id IN (SELECT user_id FROM parents WHERE user_id IS NOT NULL)
AND role != 'parent';

-- Add sample parent user if none exists (for testing)
-- This will be skipped if a parent user already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'parent' LIMIT 1) THEN
        INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, "isActive", school_id, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'parent.test@zinat.local',
            '$2b$10$example.hash.for.testing.purposes.only',
            'أحمد',
            'المحمدي', 
            'parent',
            '+968 9123 4567',
            true,
            1,
            NOW(),
            NOW()
        );
        
        -- Create corresponding parent record
        INSERT INTO parents (id, "firstName", "lastName", email, phone, user_id, "createdAt", "updatedAt")
        SELECT 
            gen_random_uuid(),
            'أحمد',
            'المحمدي',
            'parent.test@zinat.local',
            '+968 9123 4567',
            id,
            NOW(),
            NOW()
        FROM users 
        WHERE email = 'parent.test@zinat.local' 
        AND role = 'parent';
    END IF;
END $$;

-- Verify the changes
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_parents,
    COUNT(user_id) as parents_with_user_accounts
FROM parents;

-- Show sample of parent-user relationships
SELECT 
    p.id as parent_id,
    p."firstName" || ' ' || p."lastName" as parent_name,
    u.email as user_email,
    u.role as user_role,
    u."isActive" as is_active
FROM parents p
LEFT JOIN users u ON p.user_id = u.id
LIMIT 5;
