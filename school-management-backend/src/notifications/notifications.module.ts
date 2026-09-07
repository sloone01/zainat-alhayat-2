import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateDefinition } from '../entities/notification-template-definition.entity';
import { SchoolNotificationTemplate } from '../entities/school-notification-template.entity';
import { School } from '../entities/school.entity';
import { SchoolLandingPage } from '../entities/school-landing-page.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { StudentChargeSheetInstallment } from '../entities/student-charge-sheet-installment.entity';
import { NotificationSendLog } from '../entities/notification-send-log.entity';
import { Schedule } from '../entities/schedule.entity';
import { Course } from '../entities/course.entity';
import { MailService } from '../services/mail.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { NotificationAudienceService } from './notification-audience.service';
import { NotificationJobsService } from './notification-jobs.service';

@Global()
@Module({
  // Enrollment / schedule / course repos are required by NotificationAudienceService.
  imports: [
    TypeOrmModule.forFeature([
      NotificationTemplateDefinition,
      SchoolNotificationTemplate,
      School,
      SchoolLandingPage,
      Student,
      User,
      StudentCourseEnrollment,
      StudentChargeSheetInstallment,
      NotificationSendLog,
      Schedule,
      Course,
    ]),
  ],
  providers: [
    MailService,
    SmsService,
    PushService,
    NotificationTemplateService,
    NotificationDispatcherService,
    NotificationAudienceService,
    NotificationJobsService,
  ],
  exports: [
    MailService,
    SmsService,
    PushService,
    NotificationTemplateService,
    NotificationDispatcherService,
    NotificationAudienceService,
  ],
})
export class NotificationsModule {}

