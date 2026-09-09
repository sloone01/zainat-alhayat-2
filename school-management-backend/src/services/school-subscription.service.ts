import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { SchoolSubscriptionRegisterDto } from '../dto/school-subscription.dto';
import { PlatformBillingService } from '../platform-billing/platform-billing.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { SignupEmailOtpService } from './signup-email-otp.service';

export type SchoolSubscriptionResult = {
  school_id: string;
  status: 'pending';
  plan_code: string;
  billing_period: string;
  owner_email: string;
};

@Injectable()
export class SchoolSubscriptionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly platformBilling: PlatformBillingService,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
    private readonly signupEmailOtp: SignupEmailOtpService,
  ) {}

  async registerWithDocuments(
    dto: SchoolSubscriptionRegisterDto,
    crRelativeUrl: string,
    idRelativeUrl: string,
  ): Promise<SchoolSubscriptionResult> {
    const email = dto.owner_email.trim().toLowerCase();
    this.signupEmailOtp.assertVerificationToken(email, dto.email_verification_token);
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists. Sign in instead.');
    }
    this.signupEmailOtp.consumeVerificationToken(email, dto.email_verification_token);

    if (!dto.plan_code?.trim()) {
      throw new BadRequestException('plan_code is required');
    }

    const ownerLegal =
      dto.owner_legal_name?.trim() ||
      `${dto.owner_first_name.trim()} ${dto.owner_last_name.trim()}`.trim();

    const saltRounds = 12;
    // Placeholder only — real login password is generated on platform approval and emailed.
    const placeholder = randomBytes(32).toString('base64url');
    const hashedPassword = await bcrypt.hash(placeholder, saltRounds);

    const { schoolId, ownerUserId, ownerPhone, ownerFirstName } = await this.dataSource.transaction(
      async (manager) => {
        const schoolRepo = manager.getRepository(School);
        const userRepo = manager.getRepository(User);

        const school = schoolRepo.create({
          name: dto.school_name.trim(),
          address: dto.school_address?.trim(),
          phone: dto.school_phone.trim(),
          email: dto.school_email.trim().toLowerCase(),
          cr_document_url: crRelativeUrl,
          owner_id_document_url: idRelativeUrl,
          owner_legal_name: ownerLegal,
          status: 'pending',
        });
        await schoolRepo.save(school);

        const user = userRepo.create({
          email,
          password: hashedPassword,
          firstName: dto.owner_first_name.trim(),
          lastName: dto.owner_last_name.trim(),
          role: 'admin',
          user_type: 'staff',
          phone: dto.owner_phone.trim(),
          school_id: school.id,
          isActive: false,
        });
        await userRepo.save(user);

        return {
          schoolId: school.id,
          ownerUserId: user.id,
          ownerPhone: user.phone,
          ownerFirstName: user.firstName,
        };
      },
    );

    const planCode = dto.plan_code.trim().toLowerCase();
    await this.platformBilling.createDraftSubscriptionForSchool(
      schoolId,
      planCode,
      dto.billing_period,
    );

    const schoolName = dto.school_name.trim();
    void this.notifyApplicantOfRegistration({
      schoolId,
      schoolName,
      ownerName: ownerLegal,
      email,
      phone: ownerPhone,
      userId: ownerUserId,
      firstName: ownerFirstName,
      planName: planCode,
    });
    void this.notifyPlatformOfRegistration(schoolId, schoolName, ownerLegal, email);

    return {
      school_id: schoolId,
      status: 'pending',
      plan_code: planCode,
      billing_period: dto.billing_period,
      owner_email: email,
    };
  }

  private async notifyApplicantOfRegistration(input: {
    schoolId: string;
    schoolName: string;
    ownerName: string;
    email: string;
    phone: string | null;
    userId: string;
    firstName: string;
    planName: string;
  }): Promise<void> {
    await this.notifications.notifySafe({
      schoolId: input.schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_REGISTRATION_RECEIVED,
      locale: 'ar',
      variables: {
        recipientName: input.ownerName,
        email: input.email,
        planName: input.planName,
        schoolName: input.schoolName,
      },
      recipients: [
        {
          email: input.email,
          phone: input.phone,
          userId: input.userId,
          name: input.firstName,
        },
      ],
    });
  }

  private async notifyPlatformOfRegistration(
    schoolId: string,
    schoolName: string,
    ownerName: string,
    email: string,
  ): Promise<void> {
    const recipients = await this.audience.platformOperators();
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_REGISTERED,
      locale: 'en',
      variables: {
        recipientName: ownerName,
        email,
        schoolName,
      },
      recipients,
    });
  }
}
