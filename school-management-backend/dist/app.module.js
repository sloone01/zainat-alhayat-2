"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const database_config_1 = require("./config/database.config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const simple_health_controller_1 = require("./health/simple-health.controller");
const debug_module_1 = require("./debug/debug.module");
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
const weekly_session_plan_entity_1 = require("./entities/weekly-session-plan.entity");
const session_media_entity_1 = require("./entities/session-media.entity");
const user_service_1 = require("./services/user.service");
const student_service_1 = require("./services/student.service");
const parent_service_1 = require("./services/parent.service");
const group_service_1 = require("./services/group.service");
const course_service_1 = require("./services/course.service");
const phase_service_1 = require("./services/phase.service");
const milestone_service_1 = require("./services/milestone.service");
const schedule_service_1 = require("./services/schedule.service");
const attendance_service_1 = require("./services/attendance.service");
const student_progress_service_1 = require("./services/student-progress.service");
const class_settings_service_1 = require("./services/class-settings.service");
const academic_year_service_1 = require("./services/academic-year.service");
const semester_service_1 = require("./services/semester.service");
const file_upload_service_1 = require("./services/file-upload.service");
const statistics_service_1 = require("./services/statistics.service");
const weekly_session_plan_service_1 = require("./services/weekly-session-plan.service");
const session_media_service_1 = require("./services/session-media.service");
const user_controller_1 = require("./controllers/user.controller");
const student_controller_1 = require("./controllers/student.controller");
const parent_controller_1 = require("./controllers/parent.controller");
const group_controller_1 = require("./controllers/group.controller");
const course_controller_1 = require("./controllers/course.controller");
const phase_controller_1 = require("./controllers/phase.controller");
const milestone_controller_1 = require("./controllers/milestone.controller");
const schedule_controller_1 = require("./controllers/schedule.controller");
const attendance_controller_1 = require("./controllers/attendance.controller");
const student_progress_controller_1 = require("./controllers/student-progress.controller");
const class_settings_controller_1 = require("./controllers/class-settings.controller");
const academic_year_controller_1 = require("./controllers/academic-year.controller");
const semester_controller_1 = require("./controllers/semester.controller");
const file_upload_controller_1 = require("./controllers/file-upload.controller");
const statistics_controller_1 = require("./controllers/statistics.controller");
const weekly_session_plan_controller_1 = require("./controllers/weekly-session-plan.controller");
const session_media_controller_1 = require("./controllers/session-media.controller");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            debug_module_1.DebugModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => (0, database_config_1.getDatabaseConfig)(configService),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
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
                weekly_session_plan_entity_1.WeeklySessionPlan,
                session_media_entity_1.SessionMedia,
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [
            app_controller_1.AppController,
            simple_health_controller_1.SimpleHealthController,
            user_controller_1.UserController,
            student_controller_1.StudentController,
            parent_controller_1.ParentController,
            group_controller_1.GroupController,
            course_controller_1.CourseController,
            phase_controller_1.PhaseController,
            milestone_controller_1.MilestoneController,
            schedule_controller_1.ScheduleController,
            attendance_controller_1.AttendanceController,
            student_progress_controller_1.StudentProgressController,
            class_settings_controller_1.ClassSettingsController,
            academic_year_controller_1.AcademicYearController,
            semester_controller_1.SemesterController,
            file_upload_controller_1.FileUploadController,
            statistics_controller_1.StatisticsController,
            weekly_session_plan_controller_1.WeeklySessionPlanController,
            session_media_controller_1.SessionMediaController,
        ],
        providers: [
            app_service_1.AppService,
            user_service_1.UserService,
            student_service_1.StudentService,
            parent_service_1.ParentService,
            group_service_1.GroupService,
            course_service_1.CourseService,
            phase_service_1.PhaseService,
            milestone_service_1.MilestoneService,
            schedule_service_1.ScheduleService,
            attendance_service_1.AttendanceService,
            student_progress_service_1.StudentProgressService,
            class_settings_service_1.ClassSettingsService,
            academic_year_service_1.AcademicYearService,
            semester_service_1.SemesterService,
            file_upload_service_1.FileUploadService,
            statistics_service_1.StatisticsService,
            weekly_session_plan_service_1.WeeklySessionPlanService,
            session_media_service_1.SessionMediaService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map