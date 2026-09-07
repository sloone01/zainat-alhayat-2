import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { SchoolSubscriptionRegisterDto } from '../dto/school-subscription.dto';
import { PlatformBillingService } from '../platform-billing/platform-billing.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

export type SchoolSubscriptionResult = {
  school_id: number;
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
  ) {}

  async registerWithDocuments(
    dto: SchoolSubscriptionRegisterDto,
    crRelativeUrl: string,
    idRelativeUrl: string,
  ): Promise<SchoolSubscriptionResult> {
    const email = dto.owner_email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists. Sign in instead.');
    }

    if (!dto.plan_code?.trim()) {
      throw new BadRequestException('plan_code is required');
    }

    const ownerLegal =
      dto.owner_legal_name?.trim() ||
      `${dto.owner_first_name.trim()} ${dto.owner_last_name.trim()}`.trim();

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const { schoolId } = await this.dataSource.transaction(async (manager) => {
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

      // Pre-create owner account; activated as school admin only after platform approval.
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

      return { schoolId: school.id };
    });

    const planCode = dto.plan_code.trim().toLowerCase();
    await this.platformBilling.createDraftSubscriptionForSchool(
      schoolId,
      planCode,
      dto.billing_period,
    );

    void this.notifyPlatformOfRegistration(schoolId, dto.school_name.trim(), ownerLegal, email);

    return {
      school_id: schoolId,
      status: 'pending',
      plan_code: planCode,
      billing_period: dto.billing_period,
      owner_email: email,
    };
  }

  private async notifyPlatformOfRegistration(
    schoolId: number,
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
      },
      recipients,
    });
  }
}
