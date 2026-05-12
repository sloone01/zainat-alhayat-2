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
const enrollment_entity_1 = require("./entities/enrollment.entity");
const grade_entity_1 = require("./entities/grade.entity");
const online_video_session_entity_1 = require("./entities/online-video-session.entity");
const online_session_presence_entity_1 = require("./entities/online-session-presence.entity");
const graded_assessment_scheme_entity_1 = require("./entities/graded-assessment-scheme.entity");
const graded_semester_config_entity_1 = require("./entities/graded-semester-config.entity");
const graded_criterion_entity_1 = require("./entities/graded-criterion.entity");
const graded_criterion_teacher_task_entity_1 = require("./entities/graded-criterion-teacher-task.entity");
const graded_criterion_task_student_mark_entity_1 = require("./entities/graded-criterion-task-student-mark.entity");
const bus_entity_1 = require("./entities/bus.entity");
const bus_movement_log_entity_1 = require("./entities/bus-movement-log.entity");
const meeting_room_entity_1 = require("./entities/meeting-room.entity");
const meeting_room_invitee_entity_1 = require("./entities/meeting-room-invitee.entity");
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
const enrollment_service_1 = require("./services/enrollment.service");
const document_generator_service_1 = require("./services/document-generator.service");
const grade_service_1 = require("./services/grade.service");
const activity_service_1 = require("./services/activity.service");
const online_session_service_1 = require("./services/online-session.service");
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
const enrollment_controller_1 = require("./controllers/enrollment.controller");
const grade_controller_1 = require("./controllers/grade.controller");
const activity_controller_1 = require("./controllers/activity.controller");
const online_session_controller_1 = require("./controllers/online-session.controller");
const graded_assessment_controller_1 = require("./controllers/graded-assessment.controller");
const graded_criterion_task_controller_1 = require("./controllers/graded-criterion-task.controller");
const bus_controller_1 = require("./controllers/bus.controller");
const meeting_room_controller_1 = require("./controllers/meeting-room.controller");
const online_session_student_attendance_entity_1 = require("./entities/online-session-student-attendance.entity");
const online_session_student_attendance_service_1 = require("./services/online-session-student-attendance.service");
const graded_assessment_service_1 = require("./services/graded-assessment.service");
const graded_criterion_task_service_1 = require("./services/graded-criterion-task.service");
const bus_service_1 = require("./services/bus.service");
const bus_movement_service_1 = require("./services/bus-movement.service");
const meeting_room_service_1 = require("./services/meeting-room.service");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const public_subscription_module_1 = require("./public-subscription.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            public_subscription_module_1.PublicSubscriptionModule,
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
                enrollment_entity_1.Enrollment,
                grade_entity_1.Grade,
                online_video_session_entity_1.OnlineVideoSession,
                online_session_presence_entity_1.OnlineSessionPresence,
                online_session_student_attendance_entity_1.OnlineSessionStudentAttendance,
                graded_assessment_scheme_entity_1.GradedAssessmentScheme,
                graded_semester_config_entity_1.GradedSemesterConfig,
                graded_criterion_entity_1.GradedCriterion,
                graded_criterion_teacher_task_entity_1.GradedCriterionTeacherTask,
                graded_criterion_task_student_mark_entity_1.GradedCriterionTaskStudentMark,
                bus_entity_1.Bus,
                bus_movement_log_entity_1.BusMovementLog,
                meeting_room_entity_1.MeetingRoom,
                meeting_room_invitee_entity_1.MeetingRoomInvitee,
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
            enrollment_controller_1.EnrollmentController,
            grade_controller_1.GradeController,
            activity_controller_1.ActivityController,
            online_session_controller_1.OnlineSessionController,
            graded_assessment_controller_1.GradedAssessmentController,
            graded_criterion_task_controller_1.GradedCriterionTaskController,
            bus_controller_1.BusController,
            meeting_room_controller_1.MeetingRoomController,
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
            enrollment_service_1.EnrollmentService,
            document_generator_service_1.DocumentGeneratorService,
            grade_service_1.GradeService,
            activity_service_1.ActivityService,
            online_session_service_1.OnlineSessionService,
            online_session_student_attendance_service_1.OnlineSessionStudentAttendanceService,
            graded_assessment_service_1.GradedAssessmentService,
            graded_criterion_task_service_1.GradedCriterionTaskService,
            bus_service_1.BusService,
            bus_movement_service_1.BusMovementService,
            meeting_room_service_1.MeetingRoomService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map