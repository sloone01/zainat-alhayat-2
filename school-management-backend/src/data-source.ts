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
import { SessionMedia } from './entities/session-media.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Grade } from './entities/grade.entity';
import { GroupChatMessage } from './entities/group-chat-message.entity';
import { OnlineVideoSession } from './entities/online-video-session.entity';
import { OnlineSessionPresence } from './entities/online-session-presence.entity';
import { OnlineSessionStudentAttendance } from './entities/online-session-student-attendance.entity';
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
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { RbacAction } from './entities/rbac-action.entity';
import { RbacPage } from './entities/rbac-page.entity';
import { RbacPageAction } from './entities/rbac-page-action.entity';
import { RbacGroup } from './entities/rbac-group.entity';
import { RbacGroupPermission } from './entities/rbac-group-permission.entity';
import { RbacUserGroupMember } from './entities/rbac-user-group-member.entity';
import { RbacUserPermissionOverride } from './entities/rbac-user-permission-override.entity';

const entityList = [
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
  GroupChatMessage,
  OnlineVideoSession,
  OnlineSessionPresence,
  OnlineSessionStudentAttendance,
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
  StudentCourseEnrollment,
  RbacAction,
  RbacPage,
  RbacPageAction,
  RbacGroup,
  RbacGroupPermission,
  RbacUserGroupMember,
  RbacUserPermissionOverride,
];

const databaseUrl = process.env.DATABASE_URL;
/** Hosted Postgres (Railway, Render, etc.) usually needs TLS; set DATABASE_SSL=false to disable. */
const sslForUrl =
  process.env.DATABASE_SSL === 'false'
    ? false
    : databaseUrl
      ? { rejectUnauthorized: false as const }
      : false;

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: sslForUrl,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        entities: entityList,
        migrations: ['src/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'school_admin',
        password: process.env.DATABASE_PASSWORD || 'school_password_2024',
        database: process.env.DATABASE_NAME || 'school_management',
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        entities: entityList,
        migrations: ['src/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
      },
);
