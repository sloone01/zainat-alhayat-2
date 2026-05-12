import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimpleHealthController } from './health/simple-health.controller';
import { DebugModule } from './debug/debug.module';

// Entities
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
import { SessionMedia } from './entities/session-media.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Grade } from './entities/grade.entity';
import { OnlineVideoSession } from './entities/online-video-session.entity';
import { OnlineSessionPresence } from './entities/online-session-presence.entity';
import { GradedAssessmentScheme } from './entities/graded-assessment-scheme.entity';
import { GradedSemesterConfig } from './entities/graded-semester-config.entity';
import { GradedCriterion } from './entities/graded-criterion.entity';
import { GradedCriterionTeacherTask } from './entities/graded-criterion-teacher-task.entity';
import { GradedCriterionTaskStudentMark } from './entities/graded-criterion-task-student-mark.entity';
import { Bus } from './entities/bus.entity';
import { BusMovementLog } from './entities/bus-movement-log.entity';
import { MeetingRoom } from './entities/meeting-room.entity';
import { MeetingRoomInvitee } from './entities/meeting-room-invitee.entity';

// Services
import { UserService } from './services/user.service';
import { StudentService } from './services/student.service';
import { ParentService } from './services/parent.service';
import { GroupService } from './services/group.service';
import { CourseService } from './services/course.service';
import { PhaseService } from './services/phase.service';
import { MilestoneService } from './services/milestone.service';
import { ScheduleService } from './services/schedule.service';
import { AttendanceService } from './services/attendance.service';
import { StudentProgressService } from './services/student-progress.service';
import { ClassSettingsService } from './services/class-settings.service';
import { AcademicYearService } from './services/academic-year.service';
import { SemesterService } from './services/semester.service';
import { FileUploadService } from './services/file-upload.service';
import { StatisticsService } from './services/statistics.service';
import { WeeklySessionPlanService } from './services/weekly-session-plan.service';
import { SessionMediaService } from './services/session-media.service';
import { EnrollmentService } from './services/enrollment.service';
import { DocumentGeneratorService } from './services/document-generator.service';
import { GradeService } from './services/grade.service';
import { ActivityService } from './services/activity.service';
import { OnlineSessionService } from './services/online-session.service';

// Controllers
import { UserController } from './controllers/user.controller';
import { StudentController } from './controllers/student.controller';
import { ParentController } from './controllers/parent.controller';
import { GroupController } from './controllers/group.controller';
import { CourseController } from './controllers/course.controller';
import { PhaseController } from './controllers/phase.controller';
import { MilestoneController } from './controllers/milestone.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { StudentProgressController } from './controllers/student-progress.controller';
import { ClassSettingsController } from './controllers/class-settings.controller';
import { AcademicYearController } from './controllers/academic-year.controller';
import { SemesterController } from './controllers/semester.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { StatisticsController } from './controllers/statistics.controller';
import { WeeklySessionPlanController } from './controllers/weekly-session-plan.controller';
import { SessionMediaController } from './controllers/session-media.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { GradeController } from './controllers/grade.controller';
import { ActivityController } from './controllers/activity.controller';
import { OnlineSessionController } from './controllers/online-session.controller';
import { GradedAssessmentController } from './controllers/graded-assessment.controller';
import { GradedCriterionTaskController } from './controllers/graded-criterion-task.controller';
import { BusController } from './controllers/bus.controller';
import { MeetingRoomController } from './controllers/meeting-room.controller';
import { OnlineSessionStudentAttendance } from './entities/online-session-student-attendance.entity';
import { OnlineSessionStudentAttendanceService } from './services/online-session-student-attendance.service';
import { GradedAssessmentService } from './services/graded-assessment.service';
import { GradedCriterionTaskService } from './services/graded-criterion-task.service';
import { BusService } from './services/bus.service';
import { BusMovementService } from './services/bus-movement.service';
import { MeetingRoomService } from './services/meeting-room.service';

// Auth Module
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PublicSubscriptionModule } from './public-subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load `.env` then `.env.local` so local secrets (e.g. DAILY_API_KEY) can live in `.env.local`.
      // Railway sets vars in the process environment; missing files are ignored.
      envFilePath: ['.env', '.env.local'],
    }),
    AuthModule,
    ChatModule,
    PublicSubscriptionModule,
    DebugModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
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
      SessionMedia,
      Enrollment,
      Grade,
      OnlineVideoSession,
      OnlineSessionPresence,
      OnlineSessionStudentAttendance,
      GradedAssessmentScheme,
      GradedSemesterConfig,
      GradedCriterion,
      GradedCriterionTeacherTask,
      GradedCriterionTaskStudentMark,
      Bus,
      BusMovementLog,
      MeetingRoom,
      MeetingRoomInvitee,
    ]),
    AuthModule,
  ],
  controllers: [
    AppController,
    SimpleHealthController,
    UserController,
    StudentController,
    ParentController,
    GroupController,
    CourseController,
    PhaseController,
    MilestoneController,
    ScheduleController,
    AttendanceController,
    StudentProgressController,
    ClassSettingsController,
    AcademicYearController,
    SemesterController,
    FileUploadController,
    StatisticsController,
    WeeklySessionPlanController,
    SessionMediaController,
    EnrollmentController,
    GradeController,
    ActivityController,
    OnlineSessionController,
    GradedAssessmentController,
    GradedCriterionTaskController,
    BusController,
    MeetingRoomController,
  ],
  providers: [
    AppService,
    UserService,
    StudentService,
    ParentService,
    GroupService,
    CourseService,
    PhaseService,
    MilestoneService,
    ScheduleService,
    AttendanceService,
    StudentProgressService,
    ClassSettingsService,
    AcademicYearService,
    SemesterService,
    FileUploadService,
    StatisticsService,
    WeeklySessionPlanService,
    SessionMediaService,
    EnrollmentService,
    DocumentGeneratorService,
    GradeService,
    ActivityService,
    OnlineSessionService,
    OnlineSessionStudentAttendanceService,
    GradedAssessmentService,
    GradedCriterionTaskService,
    BusService,
    BusMovementService,
    MeetingRoomService,
  ],
})
export class AppModule {}
