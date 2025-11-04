import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Import all entities
import { User } from './entities/user.entity';
import { School } from './entities/school.entity';
import { Room } from './entities/room.entity';
import { Student } from './entities/student.entity';
import { Staff } from './entities/staff.entity';
import { Parent } from './entities/parent.entity';
import { Activity } from './entities/activity.entity';
import { Reminder } from './entities/reminder.entity';
import { Group } from './entities/group.entity';
import { Course } from './entities/course.entity';
import { Phase } from './entities/phase.entity';
import { Milestone } from './entities/milestone.entity';
import { Schedule } from './entities/schedule.entity';
import { Attendance } from './entities/attendance.entity';
import { StudentProgress } from './entities/student-progress.entity';
import { ClassSettings } from './entities/class-settings.entity';
import { AcademicYear } from './entities/academic-year.entity';
import { Semester } from './entities/semester.entity';
import { WeeklySessionPlan } from './entities/weekly-session-plan.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'school_admin',
  password: process.env.DATABASE_PASSWORD || 'school_password_2024',
  database: process.env.DATABASE_NAME || 'school_management',
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    School,
    Room,
    Student,
    Staff,
    Parent,
    Activity,
    Reminder,
    Group,
    Course,
    Phase,
    Milestone,
    Schedule,
    Attendance,
    StudentProgress,
    ClassSettings,
    AcademicYear,
    Semester,
    WeeklySessionPlan,
  ],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});


