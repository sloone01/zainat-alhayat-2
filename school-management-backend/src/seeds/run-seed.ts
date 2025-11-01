import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeeder } from './seed';

// Import all entities
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Room } from '../entities/room.entity';
import { Student } from '../entities/student.entity';
import { Staff } from '../entities/staff.entity';
import { Parent } from '../entities/parent.entity';
import { Activity } from '../entities/activity.entity';
import { Reminder } from '../entities/reminder.entity';
import { Group } from '../entities/group.entity';
import { Course } from '../entities/course.entity';
import { Phase } from '../entities/phase.entity';
import { Milestone } from '../entities/milestone.entity';
import { Schedule } from '../entities/schedule.entity';
import { Attendance } from '../entities/attendance.entity';
import { StudentProgress } from '../entities/student-progress.entity';
import { ClassSettings } from '../entities/class-settings.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { Semester } from '../entities/semester.entity';

async function runSeed() {
  // Load environment variables
  ConfigModule.forRoot({
    isGlobal: true,
  });

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'school_admin',
    password: process.env.DATABASE_PASSWORD || 'school_password_2024',
    database: process.env.DATABASE_NAME || 'school_management',
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
    ],
    synchronize: false, // Don't modify schema during seeding
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection initialized');

    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();

    await dataSource.destroy();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();