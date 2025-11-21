-- Fix for session media upload user constraint
-- This script ensures there's a valid user for file uploads

-- Check if the mock user exists
DO $$
BEGIN
    -- Insert a system user if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'bd306529-6a0f-4e42-9dce-3928af367e94') THEN
        INSERT INTO users (
            id,
            email,
            password,
            "firstName",
            "lastName",
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            'bd306529-6a0f-4e42-9dce-3928af367e94',
            'admin@zinatalhaykindergarten.com',
            '$2b$10$dummy.hash.for.system.user.only.for.development',
            'System',
            'Administrator',
            'admin',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'System user created for file uploads';
    ELSE
        RAISE NOTICE 'System user already exists';
    END IF;
    
    -- Also create a fallback user with simple UUID
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        INSERT INTO users (
            id,
            email,
            password,
            "firstName",
            "lastName",
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            'system@zinatalhaykindergarten.com',
            '$2b$10$dummy.hash.for.fallback.user.only.for.development',
            'System',
            'Fallback',
            'admin',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Fallback user created for file uploads';
    ELSE
        RAISE NOTICE 'Fallback user already exists';
    END IF;
END $$;

-- Verify the users exist
SELECT
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive"
FROM users
WHERE id IN (
    'bd306529-6a0f-4e42-9dce-3928af367e94',
    '00000000-0000-0000-0000-000000000001'
)
ORDER BY email;
