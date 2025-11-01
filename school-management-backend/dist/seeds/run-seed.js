"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const seed_1 = require("./seed");
const user_entity_1 = require("../entities/user.entity");
const school_entity_1 = require("../entities/school.entity");
const room_entity_1 = require("../entities/room.entity");
const student_entity_1 = require("../entities/student.entity");
const staff_entity_1 = require("../entities/staff.entity");
const parent_entity_1 = require("../entities/parent.entity");
const activity_entity_1 = require("../entities/activity.entity");
const reminder_entity_1 = require("../entities/reminder.entity");
const group_entity_1 = require("../entities/group.entity");
const course_entity_1 = require("../entities/course.entity");
const phase_entity_1 = require("../entities/phase.entity");
const milestone_entity_1 = require("../entities/milestone.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const attendance_entity_1 = require("../entities/attendance.entity");
const student_progress_entity_1 = require("../entities/student-progress.entity");
const class_settings_entity_1 = require("../entities/class-settings.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
const semester_entity_1 = require("../entities/semester.entity");
async function runSeed() {
    config_1.ConfigModule.forRoot({
        isGlobal: true,
    });
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'school_admin',
        password: process.env.DATABASE_PASSWORD || 'school_password_2024',
        database: process.env.DATABASE_NAME || 'school_management',
        entities: [
            user_entity_1.User,
            school_entity_1.School,
            room_entity_1.Room,
            student_entity_1.Student,
            staff_entity_1.Staff,
            parent_entity_1.Parent,
            activity_entity_1.Activity,
            reminder_entity_1.Reminder,
            group_entity_1.Group,
            course_entity_1.Course,
            phase_entity_1.Phase,
            milestone_entity_1.Milestone,
            schedule_entity_1.Schedule,
            attendance_entity_1.Attendance,
            student_progress_entity_1.StudentProgress,
            class_settings_entity_1.ClassSettings,
            academic_year_entity_1.AcademicYear,
            semester_entity_1.Semester,
        ],
        synchronize: false,
        logging: false,
    });
    try {
        await dataSource.initialize();
        console.log('Database connection initialized');
        const seeder = new seed_1.DatabaseSeeder(dataSource);
        await seeder.run();
        await dataSource.destroy();
        console.log('Seeding completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}
runSeed();
//# sourceMappingURL=run-seed.js.map