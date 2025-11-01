-- Initialize the school management database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create initial database user permissions
GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Zinat Al-Haya School Management Database initialized successfully!';
    RAISE NOTICE 'Database: school_management';
    RAISE NOTICE 'User: school_admin';
    RAISE NOTICE 'Ready for TypeORM migrations...';
END $$;
