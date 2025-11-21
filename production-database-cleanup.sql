-- 🧹 PRODUCTION DATABASE CLEANUP SCRIPT
-- Date: 2025-11-15
-- Description: Remove ALL seed/sample data from production database
-- ⚠️  WARNING: This will delete sample data. Run only on production!

-- ============================================================================
-- 1. BACKUP CURRENT DATA COUNTS (FOR VERIFICATION)
-- ============================================================================

-- Show current data before cleanup
SELECT 'BEFORE CLEANUP - Data Counts:' as status;

SELECT 
    'courses' as table_name,
    COUNT(*) as record_count,
    string_agg(name, ', ') as sample_names
FROM courses
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    string_agg(username, ', ') as sample_names
FROM users
UNION ALL
SELECT 
    'schools' as table_name,
    COUNT(*) as record_count,
    string_agg(name, ', ') as sample_names
FROM schools
UNION ALL
SELECT 
    'schedules' as table_name,
    COUNT(*) as record_count,
    'schedule_data' as sample_names
FROM schedules
UNION ALL
SELECT 
    'groups' as table_name,
    COUNT(*) as record_count,
    string_agg(name, ', ') as sample_names
FROM groups;

-- ============================================================================
-- 2. DELETE SEED/SAMPLE DATA
-- ============================================================================

-- Delete sample schedules first (due to foreign keys)
DELETE FROM schedules WHERE id IN (
    SELECT s.id FROM schedules s
    JOIN courses c ON s.course_id = c.id
    WHERE c.name IN (
        'Language Development',
        'Math Fundamentals', 
        'Creative Arts',
        'Physical Development',
        'Social Skills',
        'Science Exploration',
        'Test Course'
    )
);

-- Delete sample student progress
DELETE FROM student_progress WHERE id IN (
    SELECT sp.id FROM student_progress sp
    JOIN milestones m ON sp.milestone_id = m.id
    JOIN phases p ON m.phase_id = p.id
    JOIN courses c ON p.course_id = c.id
    WHERE c.name IN (
        'Language Development',
        'Math Fundamentals', 
        'Creative Arts',
        'Physical Development',
        'Social Skills',
        'Science Exploration',
        'Test Course'
    )
);

-- Delete sample milestones
DELETE FROM milestones WHERE id IN (
    SELECT m.id FROM milestones m
    JOIN phases p ON m.phase_id = p.id
    JOIN courses c ON p.course_id = c.id
    WHERE c.name IN (
        'Language Development',
        'Math Fundamentals', 
        'Creative Arts',
        'Physical Development',
        'Social Skills',
        'Science Exploration',
        'Test Course'
    )
);

-- Delete sample phases
DELETE FROM phases WHERE course_id IN (
    SELECT id FROM courses WHERE name IN (
        'Language Development',
        'Math Fundamentals', 
        'Creative Arts',
        'Physical Development',
        'Social Skills',
        'Science Exploration',
        'Test Course'
    )
);

-- Delete sample courses
DELETE FROM courses WHERE name IN (
    'Language Development',
    'Math Fundamentals', 
    'Creative Arts',
    'Physical Development',
    'Social Skills',
    'Science Exploration',
    'Test Course'
);

-- Delete sample users (keep only real admin accounts)
DELETE FROM users WHERE (
    username IN ('admin', 'teacher1', 'parent1', 'teacher', 'parent') 
    AND (
        email LIKE '%@zinatalhaykindergarten.com' OR
        email LIKE '%@zinat-alhaya.edu.sa' OR
        email LIKE '%example.com' OR
        email LIKE '%test.com'
    )
) OR (
    first_name IN ('System', 'مدير', 'Teacher', 'Parent', 'Test') AND
    last_name IN ('Administrator', 'النظام', 'User', 'Account')
);

-- Delete sample schools
DELETE FROM schools WHERE (
    name LIKE '%Zinat Al-Haya Kindergarten%' AND
    address LIKE '%Main Street%'
) OR (
    name LIKE '%روضة زينة الحياة%' AND
    phone LIKE '%123%'
);

-- Delete sample groups
DELETE FROM groups WHERE name LIKE '%Sample%' OR name LIKE '%Test%' OR description LIKE '%sample%';

-- Delete sample academic years with generic descriptions
DELETE FROM academic_years WHERE description LIKE '%sample%' OR description LIKE '%test%';

-- Delete sample semesters
DELETE FROM semesters WHERE description LIKE '%sample%' OR description LIKE '%test%';

-- ============================================================================
-- 3. VERIFY CLEANUP RESULTS
-- ============================================================================

SELECT 'AFTER CLEANUP - Data Counts:' as status;

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
    'schedules' as table_name,
    COUNT(*) as record_count
FROM schedules
UNION ALL
SELECT 
    'groups' as table_name,
    COUNT(*) as record_count
FROM groups;

-- ============================================================================
-- CLEANUP COMPLETE ✅
-- ============================================================================

SELECT '✅ Production database cleanup completed!' as status;
