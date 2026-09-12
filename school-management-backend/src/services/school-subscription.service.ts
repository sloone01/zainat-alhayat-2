import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import {
  SchoolSubscriptionInquiryDto,
  SchoolSubscriptionRegisterDto,
  CustomPlanRequestDto,
} from '../dto/school-subscription.dto';
import { PlatformBillingService } from '../platform-billing/platform-billing.service';
import { PlatformCustomPlanRequest } from '../platform-billing/entities/platform-custom-plan-request.entity';
import { PlatformModule } from '../platform-billing/entities/platform-module.entity';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { SignupEmailOtpService } from './signup-email-otp.service';
import {
  ensureStaffMembership,
  isLinkableStaffAccount,
} from '../common/identity/staff-membership';
import type { NotifyRecipient } from '../notifications/notification.types';

export type SchoolSubscriptionResult = {
  school_id: string;
  status: 'pending';
  plan_code: string;
  billing_period: string;
  owner_email: string;
};

@Injectable()
export class SchoolSubscriptionService {
  private readonly logger = new Logger(SchoolSubscriptionService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PlatformCustomPlanRequest)
    private readonly customRequestRepo: Repository<PlatformCustomPlanRequest>,
    @InjectRepository(PlatformModule)
    private readonly moduleRepo: Repository<PlatformModule>,
    private readonly platformBilling: PlatformBillingService,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
    private readonly signupEmailOtp: SignupEmailOtpService,
    private readonly config: ConfigService,
  ) {}

  async submitInquiry(dto: SchoolSubscriptionInquiryDto): Promise<{ received: true }> {
    const schoolName = dto.school_name.trim();
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.trim();
    const schoolSize = this.scopeLabel(dto.scope);
    const locale = dto.locale === 'en' ? 'en' : 'ar';
    const variables = {
      schoolName,
      email,
      phone,
      schoolSize,
      recipientName: schoolName,
    };

    const adminRecipients = this.inquiryAdminRecipients(
      await this.audience.platformOperators(),
    );
    this.logger.log(
      `Landing inquiry from ${email} (${schoolName}, ${phone}); admin inboxes: ${
        adminRecipients.map((r) => r.email).join(', ') || 'none'
      }`,
    );

    this.dispatchMail('Landing inquiry admin', {
      schoolId: null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_INQUIRY,
      locale: 'en',
      variables,
      recipients: adminRecipients,
    });
    this.dispatchMail('Landing inquiry visitor', {
      schoolId: null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_INQUIRY_RECEIVED,
      locale,
      variables,
      recipients: [{ email, name: schoolName }],
    });

    return { received: true };
  }

  async submitCustomPlanRequest(
    dto: CustomPlanRequestDto,
  ): Promise<{ received: true; id: string }> {
    const nameAr = dto.school_name_ar.trim();
    const nameEn = dto.school_name_en.trim();
    const schoolName = dto.school_name?.trim() || nameAr || nameEn;
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone.trim();
    const notes = dto.notes?.trim() || null;
    const locale = dto.locale === 'en' ? 'en' : 'ar';
    const codes = [...new Set((dto.module_codes || []).map((c) => c.trim()).filter(Boolean))];

    let moduleLabels: Array<{ code: string; name_en: string; name_ar: string }> = [];
    if (codes.length) {
      const modules = await this.moduleRepo.find({
        where: { code: In(codes), is_active: true },
      });
      if (modules.length !== codes.length) {
        const found = new Set(modules.map((m) => m.code));
        const missing = codes.filter((c) => !found.has(c));
        throw new BadRequestException(`Unknown module code(s): ${missing.join(', ')}`);
      }
      moduleLabels = modules
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => ({
          code: m.code,
          name_en: m.name_en,
          name_ar: m.name_ar,
        }));
    }

    const row = await this.customRequestRepo.save(
      this.customRequestRepo.create({
        school_name: schoolName,
        school_name_ar: nameAr,
        school_name_en: nameEn,
        email,
        phone,
        scope: dto.scope,
        locale,
        notes,
        module_codes: moduleLabels.map((m) => m.code),
        module_labels: moduleLabels,
        status: 'new',
      }),
    );

    const schoolSize = this.scopeLabel(dto.scope);
    const selectedModules =
      moduleLabels.length > 0
        ? moduleLabels.map((m) => `${m.name_en} / ${m.name_ar} (${m.code})`).join('; ')
        : 'None selected';
    const variables = {
      schoolName,
      email,
      phone,
      schoolSize,
      selectedModules,
      notes: notes || '—',
      recipientName: schoolName,
    };

    const adminRecipients = this.inquiryAdminRecipients(
      await this.audience.platformOperators(),
    );
    this.logger.log(
      `Custom plan request from ${email} (${schoolName}); modules=${row.module_codes.join(',') || 'none'}`,
    );

    this.dispatchMail('Custom plan request admin', {
      schoolId: null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_INQUIRY,
      locale: 'en',
      variables,
      recipients: adminRecipients,
    });
    this.dispatchMail('Custom plan request visitor', {
      schoolId: null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_INQUIRY_RECEIVED,
      locale,
      variables,
      recipients: [{ email, name: schoolName }],
    });

    return { received: true, id: row.id };
  }

  /** Gmail send is 5–13s here; never block the public SPA on it. */
  private dispatchMail(
    label: string,
    request: Parameters<NotificationDispatcherService['notifySafe']>[0],
  ): void {
    if (!request.recipients.length) {
      this.logger.warn(`${label}: no recipients`);
      return;
    }
    void this.notifications.notifySafe(request).then((result) => {
      if (result.errors.length || result.emailSent < 1) {
        this.logger.error(
          `${label} failed: ${(result.errors || []).join('; ') || 'no email sent'}`,
        );
      }
    });
  }

  private inquiryAdminRecipients(operators: NotifyRecipient[]): NotifyRecipient[] {
    const extra = this.parseEmailList(
      this.config.get<string>('PLATFORM_INQUIRY_EMAIL') ||
        this.config.get<string>('ERROR_ALERT_EMAIL') ||
        '',
    );
    const out: NotifyRecipient[] = [];
    const seen = new Set<string>();
    const add = (raw?: string | null, name?: string | null) => {
      const e = raw?.trim().toLowerCase();
      if (!e || seen.has(e) || !this.isRoutableMailbox(e)) return;
      seen.add(e);
      out.push({ email: e, name: name?.trim() || 'team' });
    };
    for (const op of operators) add(op.email, op.name);
    for (const e of extra) add(e, 'team');
    return out;
  }

  /** Seed logins like superadmin@zinat.platform are not real mailboxes. */
  private isRoutableMailbox(email: string): boolean {
    return !email.endsWith('.platform');
  }

  private parseEmailList(raw: string): string[] {
    return raw
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private scopeLabel(scope: SchoolSubscriptionInquiryDto['scope']): string {
    if (scope === 'mid') return '1,000 – 10,000 students';
    if (scope === 'large') return '10,000+ students';
    return 'Under 1,000 students';
  }

  async registerWithDocuments(
    dto: SchoolSubscriptionRegisterDto,
    crRelativeUrl: string,
    idRelativeUrl: string,
  ): Promise<SchoolSubscriptionResult> {
    const email = dto.owner_email.trim().toLowerCase();
    await this.signupEmailOtp.assertVerificationToken(email, dto.email_verification_token);
    const existing = await this.userRepo.findOne({ where: { email: ILike(email) } });
    if (existing && !isLinkableStaffAccount(existing)) {
      throw new ConflictException('An account with this email already exists. Sign in instead.');
    }
    await this.signupEmailOtp.consumeVerificationToken(email, dto.email_verification_token);

    if (!dto.plan_code?.trim()) {
      throw new BadRequestException('plan_code is required');
    }

    const ownerLegal =
      dto.owner_legal_name?.trim() ||
      `${dto.owner_first_name.trim()} ${dto.owner_last_name.trim()}`.trim();

    const saltRounds = 12;
    // Placeholder only — real login password is generated on platform approval and emailed.
    const hashedPassword = existing
      ? null
      : await bcrypt.hash(randomBytes(32).toString('base64url'), saltRounds);

    const { schoolId, ownerUserId, ownerPhone, ownerFirstName } = await this.dataSource.transaction(
      async (manager) => {
        const schoolRepo = manager.getRepository(School);
        const userRepo = manager.getRepository(User);

        const nameAr = dto.school_name_ar.trim();
        const nameEn = dto.school_name_en.trim();
        const schoolName =
          dto.school_name?.trim() || nameAr || nameEn;

        const school = schoolRepo.create({
          name: schoolName,
          name_ar: nameAr,
          name_en: nameEn,
          address: dto.school_address?.trim(),
          phone: dto.school_phone.trim(),
          email: dto.school_email.trim().toLowerCase(),
          cr_document_url: crRelativeUrl,
          owner_id_document_url: idRelativeUrl,
          owner_legal_name: ownerLegal,
          status: 'pending',
        });
        await schoolRepo.save(school);

        if (existing) {
          this.logger.log(
            `Linking existing ${existing.user_type || existing.role} login ${email} to new school ${school.id}`,
          );
          await ensureStaffMembership(manager, existing.id, school.id);
          return {
            schoolId: school.id,
            ownerUserId: existing.id,
            ownerPhone: existing.phone,
            ownerFirstName: existing.firstName,
          };
        }

        const user = userRepo.create({
          email,
          password: hashedPassword!,
          firstName: dto.owner_first_name.trim(),
          lastName: dto.owner_last_name.trim(),
          role: 'admin',
          user_type: 'staff',
          phone: dto.owner_phone.trim(),
          school_id: school.id,
          isActive: false,
        });
        await userRepo.save(user);
        await ensureStaffMembership(manager, user.id, school.id);

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

    const schoolName =
      dto.school_name?.trim() ||
      dto.school_name_ar.trim() ||
      dto.school_name_en.trim();
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
