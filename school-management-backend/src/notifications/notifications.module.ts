import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateDefinition } from '../entities/notification-template-definition.entity';
import { SchoolNotificationTemplate } from '../entities/school-notification-template.entity';
import { SchoolNotificationLayout } from '../entities/school-notification-layout.entity';
import { PlatformNotificationLayout } from '../entities/platform-notification-layout.entity';
import { School } from '../entities/school.entity';
import { SchoolLandingPage } from '../entities/school-landing-page.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { StudentChargeSheetInstallment } from '../entities/student-charge-sheet-installment.entity';
import { NotificationSendLog } from '../entities/notification-send-log.entity';
import { OutboundMessageTransaction } from '../entities/outbound-message-transaction.entity';
import { Schedule } from '../entities/schedule.entity';
import { Course } from '../entities/course.entity';
import { UserPushToken } from '../entities/user-push-token.entity';
import { MailService } from '../services/mail.service';
import { InfobipClient } from './infobip.client';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationLayoutService } from '../services/notification-layout.service';
import { PlatformNotificationLayoutService } from '../services/platform-notification-layout.service';
import { OutboundMessageTransactionService } from '../services/outbound-message-transaction.service';
import { PushService } from './push.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { NotificationAudienceService } from './notification-audience.service';
import { NotificationJobsService } from './notification-jobs.service';
import { PushController } from '../controllers/push.controller';

@Global()
@Module({
  // Enrollment / schedule / course repos are required by NotificationAudienceService.
  imports: [
    TypeOrmModule.forFeature([
      NotificationTemplateDefinition,
      SchoolNotificationTemplate,
      SchoolNotificationLayout,
      PlatformNotificationLayout,
      School,
      SchoolLandingPage,
      Student,
      User,
      StudentCourseEnrollment,
      StudentChargeSheetInstallment,
      NotificationSendLog,
      OutboundMessageTransaction,
      Schedule,
      Course,
      UserPushToken,
    ]),
  ],
  controllers: [PushController],
  providers: [
    InfobipClient,
    MailService,
    SmsService,
    WhatsAppService,
    PushService,
    NotificationTemplateService,
    NotificationLayoutService,
    PlatformNotificationLayoutService,
    NotificationDispatcherService,
    NotificationAudienceService,
    NotificationJobsService,
    OutboundMessageTransactionService,
  ],
  exports: [
    MailService,
    SmsService,
    WhatsAppService,
    PushService,
    NotificationTemplateService,
    NotificationLayoutService,
    PlatformNotificationLayoutService,
    NotificationDispatcherService,
    NotificationAudienceService,
    OutboundMessageTransactionService,
  ],
})
export class NotificationsModule {}

