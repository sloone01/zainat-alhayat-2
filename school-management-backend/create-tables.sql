-- Create essential tables for school management system

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    logo_url VARCHAR(500),
    established_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    roles TEXT,
    phone VARCHAR(20),
    address TEXT,
    dateOfBirth DATE,
    isActive BOOLEAN DEFAULT true,
    lastLogin TIMESTAMP,
    school_id INTEGER REFERENCES schools(id),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Academic Years table
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    school_id INTEGER REFERENCES schools(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    title VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'published', 'inactive', 'archived')),
    description TEXT,
    age_group_min INTEGER,
    age_group_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    color_code VARCHAR(50),
    icon VARCHAR(100),
    send_notifications BOOLEAN DEFAULT true,
    estimated_duration_weeks INTEGER,
    learning_objectives TEXT,
    prerequisites TEXT,
    materials_needed TEXT,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    academic_year_id UUID REFERENCES academic_years(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    totalDuration INTEGER,
    createdDate DATE,
    lastModified DATE,
    targetAgeGroup VARCHAR(50),
    difficultyLevel VARCHAR(50),
    maxStudents INTEGER
);

-- Phases table
CREATE TABLE IF NOT EXISTS phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    points INTEGER,
    phase_id UUID REFERENCES phases(id),
    title VARCHAR(255),
    type VARCHAR(50),
    target_week INTEGER,
    weight NUMERIC(5,2),
    difficulty_level VARCHAR(50),
    estimated_duration_minutes INTEGER,
    required_resources TEXT,
    allow_late_submission BOOLEAN DEFAULT false,
    enable_peer_review BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert a default school
INSERT INTO schools (name, description) VALUES ('Zinat Al-Haya Kindergarten', 'Bilingual kindergarten school management system')
ON CONFLICT DO NOTHING;