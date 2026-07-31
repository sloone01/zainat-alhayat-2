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
import { NotificationTemplateDefinition } from './entities/notification-template-definition.entity';
import { SchoolNotificationTemplate } from './entities/school-notification-template.entity';
import { SchoolPaymentLevel } from './entities/school-payment-level.entity';
import { PaymentChargeType } from './entities/payment-charge-type.entity';
import { PaymentDiscountType } from './entities/payment-discount-type.entity';
import { LevelPaymentProfile } from './entities/level-payment-profile.entity';
import { LevelPaymentChargeLine } from './entities/level-payment-charge-line.entity';
import { LevelPaymentInstallment } from './entities/level-payment-installment.entity';
import { LevelPaymentProfileDiscount } from './entities/level-payment-profile-discount.entity';
import { CoursePaymentProfile } from './entities/course-payment-profile.entity';
import { CoursePaymentChargeLine } from './entities/course-payment-charge-line.entity';
import { FeePackage } from './entities/fee-package.entity';
import { FeePackageChargeType } from './entities/fee-package-charge-type.entity';
import { FeePackageDiscountType } from './entities/fee-package-discount-type.entity';
import { FeePackageInstallment } from './entities/fee-package-installment.entity';
import { FeePackageLevelAmount } from './entities/fee-package-level-amount.entity';
import { FeePackageCourseAmount } from './entities/fee-package-course-amount.entity';
import { FeePackageLevelPeriodSetting } from './entities/fee-package-level-period-setting.entity';
import { StudentPayment } from './entities/student-payment.entity';
import { StudentPaymentDiscountLine } from './entities/student-payment-discount-line.entity';
import { StudentPaymentInstallmentReceipt } from './entities/student-payment-installment-receipt.entity';
import { StudentFeeCharge } from './entities/student-fee-charge.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentTransactionAllocation } from './entities/payment-transaction-allocation.entity';
import { SchoolSystemSetting } from './entities/school-system-setting.entity';
import { SchoolMessageLetter } from './entities/school-message-letter.entity';
import { DirectChatMessage } from './entities/direct-chat-message.entity';
import { SchoolLandingPage } from './entities/school-landing-page.entity';

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
import { PaymentConfigController } from './controllers/payment-config.controller';
import { FeePackageController } from './controllers/fee-package.controller';
import { StudentPaymentController } from './controllers/student-payment.controller';
import { SchoolSystemSettingController } from './controllers/school-system-setting.controller';
import { NotificationTemplateController } from './controllers/notification-template.controller';
import { MessageLetterController } from './controllers/message-letter.controller';
import { StudentCourseEnrollmentController } from './controllers/student-course-enrollment.controller';
import { PlatformSchoolController } from './controllers/platform-school.controller';
import { PlatformSchoolService } from './services/platform-school.service';
import { SchoolLandingPageController } from './controllers/school-landing-page.controller';
import { PublicSchoolLandingController } from './controllers/public-school-landing.controller';
import { SchoolLandingPageService } from './services/school-landing-page.service';
import { OnlineSessionStudentAttendance } from './entities/online-session-student-attendance.entity';
import { OnlineSessionStudentAttendanceService } from './services/online-session-student-attendance.service';
import { GradedAssessmentService } from './services/graded-assessment.service';
import { GradedCriterionTaskService } from './services/graded-criterion-task.service';
import { BusService } from './services/bus.service';
import { BusMovementService } from './services/bus-movement.service';
import { MeetingRoomService } from './services/meeting-room.service';
import { PaymentConfigService } from './services/payment-config.service';
import { FeePackageService } from './services/fee-package.service';
import { StudentPaymentService } from './services/student-payment.service';
import { StudentPaymentLedgerService } from './services/student-payment-ledger.service';
import { MailService } from './services/mail.service';
import { MailController } from './controllers/mail.controller';
import { SchoolSystemSettingService } from './services/school-system-setting.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { MessageLetterService } from './services/message-letter.service';
import { MessageLetterRenderService } from './services/message-letter-render.service';
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { StudentCourseEnrollmentService } from './services/student-course-enrollment.service';

// Auth Module
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PublicSubscriptionModule } from './public-subscription.module';
import { RbacModule } from './rbac/rbac.module';
import { PlatformBillingModule } from './platform-billing/platform-billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load `.env` then `.env.local` so local secrets (e.g. DAILY_API_KEY) can live in `.env.local`.
      // Railway sets vars in the process environment; missing files are ignored.
      envFilePath: ['.env', '.env.local'],
    }),
    AuthModule,
    RbacModule,
    ChatModule,
    PublicSubscriptionModule,
    PlatformBillingModule,
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
      NotificationTemplateDefinition,
      SchoolNotificationTemplate,
      SchoolPaymentLevel,
      PaymentChargeType,
      PaymentDiscountType,
      LevelPaymentProfile,
      LevelPaymentChargeLine,
      LevelPaymentInstallment,
      LevelPaymentProfileDiscount,
      CoursePaymentProfile,
      CoursePaymentChargeLine,
      FeePackage,
      FeePackageChargeType,
      FeePackageDiscountType,
      FeePackageInstallment,
      FeePackageLevelAmount,
      FeePackageCourseAmount,
      FeePackageLevelPeriodSetting,
      StudentPayment,
      StudentPaymentDiscountLine,
      StudentPaymentInstallmentReceipt,
      StudentFeeCharge,
      PaymentTransaction,
      PaymentTransactionAllocation,
      SchoolSystemSetting,
      SchoolMessageLetter,
      DirectChatMessage,
      StudentCourseEnrollment,
      SchoolLandingPage,
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
    PaymentConfigController,
    FeePackageController,
    StudentPaymentController,
    SchoolSystemSettingController,
    NotificationTemplateController,
    MessageLetterController,
    MailController,
    StudentCourseEnrollmentController,
    PlatformSchoolController,
    SchoolLandingPageController,
    PublicSchoolLandingController,
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
    PaymentConfigService,
    FeePackageService,
    StudentPaymentService,
    StudentPaymentLedgerService,
    MailService,
    SchoolSystemSettingService,
    NotificationTemplateService,
    MessageLetterService,
    MessageLetterRenderService,
    StudentCourseEnrollmentService,
    PlatformSchoolService,
    SchoolLandingPageService,
  ],
})
export class AppModule {}
