"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const user_entity_1 = require("./entities/user.entity");
const school_entity_1 = require("./entities/school.entity");
const room_entity_1 = require("./entities/room.entity");
const student_entity_1 = require("./entities/student.entity");
const staff_entity_1 = require("./entities/staff.entity");
const parent_entity_1 = require("./entities/parent.entity");
const activity_entity_1 = require("./entities/activity.entity");
const reminder_entity_1 = require("./entities/reminder.entity");
const group_entity_1 = require("./entities/group.entity");
const course_entity_1 = require("./entities/course.entity");
const phase_entity_1 = require("./entities/phase.entity");
const milestone_entity_1 = require("./entities/milestone.entity");
const schedule_entity_1 = require("./entities/schedule.entity");
const attendance_entity_1 = require("./entities/attendance.entity");
const student_progress_entity_1 = require("./entities/student-progress.entity");
const class_settings_entity_1 = require("./entities/class-settings.entity");
const academic_year_entity_1 = require("./entities/academic-year.entity");
const semester_entity_1 = require("./entities/semester.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'school_admin',
    password: process.env.DATABASE_PASSWORD || 'school_password_2024',
    database: process.env.DATABASE_NAME || 'school_management',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
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
    migrations: ['src/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
});
//# sourceMappingURL=data-source.js.map