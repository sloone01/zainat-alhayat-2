import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { existsSync } from 'fs';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Student } from '../entities/student.entity';
import { PlatformBillingService } from '../platform-billing/platform-billing.service';
import { RbacGroupService } from '../rbac/rbac-group.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import type { NotifyRequest } from '../notifications/notification.types';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { UpdatePlatformSchoolDto } from '../dto/update-platform-school.dto';
import { RejectPlatformSchoolDto } from '../dto/reject-platform-school.dto';
import { CreatePlatformSchoolDto } from '../dto/create-platform-school.dto';

export interface RegisteredSchoolRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  owner_legal_name: string | null;
  cr_document_url: string | null;
  owner_id_document_url: string | null;
  status: 'pending' | 'pending_payment' | 'active' | 'suspended' | 'rejected';
  created_at: Date;
  updated_at: Date;
  studentCount: number;
  groupCount: number;
  planCode: string | null;
  billingPeriod: string | null;
  subscriptionStatus: string | null;
  invoiceStatus: string | null;
  /** Last active (or latest) membership period start/end. */
  membershipFrom: string | null;
  membershipTo: string | null;
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isActive: boolean;
  } | null;
}

@Injectable()
export class PlatformSchoolService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly platformBilling: PlatformBillingService,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
    private readonly notifications: NotificationDispatcherService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(PlatformSchoolService.name);

  private publicAppBase(): string {
    return (
      this.config.get<string>('PUBLIC_APP_URL')?.trim() ||
      this.config.get<string>('CORS_ORIGIN')?.split(',')[0]?.trim() ||
      ''
    );
  }

  private loginUrl(): string {
    const base = this.publicAppBase().replace(/\/$/, '');
    return base ? `${base}/login` : '';
  }

  private assertPlatformAccess(actor: User) {
    if (actor.isSuperAdmin || actor.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  private async ownerForSchool(schoolId: string) {
    const [user] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      isActive: !!user.isActive,
    };
  }

  async listRegisteredSchools(actor: User): Promise<RegisteredSchoolRow[]> {
    this.assertPlatformAccess(actor);

    const schools = await this.schoolRepo.find({
      order: { created_at: 'DESC' },
    });

    const billingMap = await this.platformBilling.getSubscriptionSummaryBySchoolIds(
      schools.map((s) => s.id),
    );

    const rows: RegisteredSchoolRow[] = [];
    for (const school of schools) {
      const [studentCount, groupCount, owner] = await Promise.all([
        this.studentRepo.count({ where: { school_id: school.id } }),
        this.groupRepo.count({ where: { school_id: school.id } }),
        this.ownerForSchool(school.id),
      ]);

      const status = (school.status || 'active') as RegisteredSchoolRow['status'];
      const billing = billingMap.get(school.id);

      rows.push({
        id: school.id,
        name: school.name,
        email: school.email ?? null,
        phone: school.phone ?? null,
        address: school.address ?? null,
        website: school.website ?? null,
        description: school.description ?? null,
        logo_url: school.logo_url ?? null,
        owner_legal_name: school.owner_legal_name ?? null,
        cr_document_url: school.cr_document_url ?? null,
        owner_id_document_url: school.owner_id_document_url ?? null,
        status,
        created_at: school.created_at,
        updated_at: school.updated_at,
        studentCount,
        groupCount,
        planCode: billing?.planCode ?? null,
        billingPeriod: billing?.billingPeriod ?? null,
        subscriptionStatus: billing?.subscriptionStatus ?? null,
        invoiceStatus: billing?.invoiceStatus ?? null,
        membershipFrom: billing?.membershipFrom ?? null,
        membershipTo: billing?.membershipTo ?? null,
        owner,
      });
    }

    return rows;
  }

  async getRegisteredSchool(actor: User, id: string): Promise<RegisteredSchoolRow> {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school) throw new NotFoundException('School not found');
    const list = await this.listRegisteredSchools(actor);
    const row = list.find((s) => s.id === id);
    if (!row) throw new NotFoundException('School not found');
    return row;
  }

  /**
   * Platform admin registers a school (skips public OTP).
   * - save_as_draft: leave pending (no emails).
   * - submit (default): require paid_amount (+ optional receipt), activate immediately,
   *   record paid invoice, email owner registration + credentials + payment receipt.
   */
  async createSchool(
    actor: User,
    dto: CreatePlatformSchoolDto,
    docs: {
      crRelativeUrl?: string | null;
      idRelativeUrl?: string | null;
      paidReceiptUrl?: string | null;
    } = {},
  ): Promise<RegisteredSchoolRow> {
    this.assertPlatformAccess(actor);

    const email = dto.owner_email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (!dto.plan_code?.trim()) {
      throw new BadRequestException('plan_code is required');
    }

    const saveAsDraft = dto.save_as_draft === true;
    if (!saveAsDraft) {
      if (dto.paid_amount == null || !Number.isFinite(Number(dto.paid_amount)) || Number(dto.paid_amount) < 0) {
        throw new BadRequestException('paid_amount is required when submitting (not draft)');
      }
    }

    const ownerLegal =
      dto.owner_legal_name?.trim() ||
      `${dto.owner_first_name.trim()} ${dto.owner_last_name.trim()}`.trim();

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const placeholder = randomBytes(32).toString('base64url');
    const hashedPassword = await bcrypt.hash(placeholder, saltRounds);

    const schoolId = await this.dataSource.transaction(async (manager) => {
      const schoolRepo = manager.getRepository(School);
      const userRepo = manager.getRepository(User);

      const school = schoolRepo.create({
        name: dto.school_name.trim(),
        address: dto.school_address?.trim() || null,
        phone: dto.school_phone.trim(),
        email: dto.school_email.trim().toLowerCase(),
        cr_document_url: docs.crRelativeUrl || null,
        owner_id_document_url: docs.idRelativeUrl || null,
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

      return school.id;
    });

    const planCode = dto.plan_code.trim().toLowerCase();
    await this.platformBilling.createDraftSubscriptionForSchool(
      schoolId,
      planCode,
      dto.billing_period,
    );

    if (saveAsDraft) {
      return this.getRegisteredSchool(actor, schoolId);
    }

    return this.submitPlatformSchoolRegistration(actor, schoolId, {
      paidAmount: Number(dto.paid_amount),
      paidNote: dto.paid_note?.trim() || undefined,
      paidReceiptUrl: docs.paidReceiptUrl || undefined,
    });
  }

  /**
   * Activate a newly registered school immediately: modules, temp password,
   * paid invoice + receipt, combined owner email (registration + creds + receipt).
   */
  private async submitPlatformSchoolRegistration(
    actor: User,
    schoolId: string,
    payment: {
      paidAmount: number;
      paidNote?: string;
      paidReceiptUrl?: string;
    },
  ): Promise<RegisteredSchoolRow> {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    let [admin] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (!admin) {
      throw new BadRequestException('No owner account found for this school.');
    }

    const tempPassword = randomBytes(9).toString('base64url').slice(0, 12);
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    admin.role = 'admin';
    admin.user_type = 'staff';
    admin.isActive = true;
    admin.password = await bcrypt.hash(tempPassword, saltRounds);
    admin = await this.userRepo.save(admin);

    await this.platformBilling.syncSchoolModulesForSchool(schoolId);
    await this.rbacGroupService.ensureSchoolStaffDefaults(schoolId, admin.id);

    const billing = await this.platformBilling.ensureIssuedInvoiceForSchool(actor, schoolId);
    if (!billing.invoice?.id) {
      throw new BadRequestException('Could not issue platform invoice for this school');
    }

    const paidInvoice = await this.platformBilling.markInvoicePaid(
      actor,
      String(billing.invoice.id),
      {
        paid_amount: payment.paidAmount,
        paid_note: payment.paidNote,
        activate_school: true,
      },
      payment.paidReceiptUrl,
      { notify: false },
    );

    const planName =
      billing.planNameAr?.trim() || billing.planNameEn?.trim() || '—';
    const attachments: NonNullable<NotifyRequest['attachments']> = [];
    const receiptUrl = paidInvoice.paid_receipt_url || payment.paidReceiptUrl;
    if (receiptUrl) {
      const filename = String(receiptUrl).split('/').pop();
      if (filename && !filename.includes('..')) {
        const path = `./uploads/platform-invoice-receipts/${filename}`;
        if (existsSync(path)) {
          attachments.push({ filename, path });
        }
      }
    }

    const recipientName = `${admin.firstName} ${admin.lastName}`.trim() || admin.email;
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_APPROVED,
      locale: 'ar',
      variables: {
        recipientName,
        schoolName: school.name,
        email: admin.email || '',
        password: tempPassword,
        tempPassword,
        planName,
        amount: String(payment.paidAmount),
        invoiceTotal: String(paidInvoice.total_amount ?? billing.invoice.total_amount ?? ''),
        currency: 'OMR',
        loginUrl: this.loginUrl(),
        paidNote: payment.paidNote || '',
      },
      recipients: [
        { email: admin.email, phone: admin.phone, userId: admin.id, name: admin.firstName },
      ],
      attachments: attachments.length ? attachments : undefined,
    });

    return this.getRegisteredSchool(actor, schoolId);
  }

  /** Correct the details a school submitted at registration. */
  async updateSchool(
    actor: User,
    id: string,
    dto: UpdatePlatformSchoolDto,
  ): Promise<RegisteredSchoolRow> {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school) throw new NotFoundException('School not found');

    if (dto.name != null) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException('School name cannot be empty');
      school.name = name;
    }
    if (dto.email !== undefined) school.email = dto.email?.trim() || null;
    if (dto.phone !== undefined) school.phone = dto.phone?.trim() || null;
    if (dto.address !== undefined) school.address = dto.address?.trim() || null;
    if (dto.website !== undefined) school.website = dto.website?.trim() || null;
    if (dto.description !== undefined) school.description = dto.description?.trim() || null;
    if (dto.owner_legal_name !== undefined) {
      school.owner_legal_name = dto.owner_legal_name?.trim() || null;
    }

    await this.schoolRepo.save(school);
    return this.getRegisteredSchool(actor, id);
  }

  async approveSchool(
    actor: User,
    schoolId: string,
  ): Promise<{ school: RegisteredSchoolRow; admin_user_id: string; email_sent: boolean }> {
    this.assertPlatformAccess(actor);

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');
    if (school.status === 'active') {
      throw new BadRequestException('School is already active');
    }
    if (school.status === 'rejected') {
      throw new BadRequestException('Rejected schools cannot be approved. Contact support to reopen.');
    }

    let [admin] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });

    if (!admin) {
      throw new BadRequestException(
        'No owner account found for this school. Cannot activate without an admin user.',
      );
    }

    const tempPassword = randomBytes(9).toString('base64url').slice(0, 12);
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

    admin.role = 'admin';
    admin.user_type = 'staff';
    admin.isActive = true;
    admin = await this.userRepo.save(admin);
    await this.userRepo.update(admin.id, { password: hashedPassword });

    await this.platformBilling.syncSchoolModulesForSchool(schoolId);
    await this.rbacGroupService.ensureSchoolStaffDefaults(schoolId, admin.id);

    let planName = '—';
    let amount = '0.000';
    const currency = 'OMR';
    let invoiceTotal = 0;
    try {
      const billing = await this.platformBilling.ensureIssuedInvoiceForSchool(actor, schoolId);
      const localePlan =
        billing.planNameAr?.trim() || billing.planNameEn?.trim() || '';
      if (localePlan) planName = localePlan;
      if (billing.invoice) {
        invoiceTotal = Number(billing.invoice.total_amount) || 0;
        amount = invoiceTotal.toFixed(3);
      }
    } catch (err) {
      this.logger.warn(
        `Approval invoice skipped for school ${schoolId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    // Flip the status only once provisioning has succeeded. Activating first left a
    // failed approval stuck as "already active" with no roles and no way to retry.
    school.status = invoiceTotal > 0 ? 'pending_payment' : 'active';
    await this.schoolRepo.save(school);

    const recipientName = `${admin.firstName} ${admin.lastName}`.trim() || admin.email;
    const loginUrl = this.loginUrl();
    const notifyResult = await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_APPROVED,
      locale: 'ar',
      variables: {
        recipientName,
        schoolName: school.name,
        email: admin.email || '',
        password: tempPassword,
        tempPassword,
        planName,
        amount,
        currency,
        loginUrl,
      },
      recipients: [
        { email: admin.email, phone: admin.phone, userId: admin.id, name: admin.firstName },
      ],
    });

    const row = await this.getRegisteredSchool(actor, schoolId);
    return {
      school: row,
      admin_user_id: admin.id,
      email_sent: notifyResult.emailSent > 0,
    };
  }

  /** Reject a pending school registration and notify the owner. */
  async rejectSchool(
    actor: User,
    schoolId: string,
    dto: RejectPlatformSchoolDto = {},
  ): Promise<RegisteredSchoolRow> {
    this.assertPlatformAccess(actor);

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');
    if (school.status === 'rejected') {
      throw new BadRequestException('School is already rejected');
    }
    if (school.status === 'active') {
      throw new BadRequestException('Active schools cannot be rejected here. Suspend from billing instead.');
    }

    const notes = dto.notes?.trim() || '';
    school.status = 'rejected';
    await this.schoolRepo.save(school);

    const [owner] = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (owner) {
      owner.isActive = false;
      await this.userRepo.save(owner);
      void this.notifications.notifySafe({
        schoolId,
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_REJECTED,
        locale: 'ar',
        variables: {
          recipientName: `${owner.firstName} ${owner.lastName}`.trim() || owner.email,
          schoolName: school.name,
          notes: notes || '—',
          email: owner.email,
        },
        recipients: [
          { email: owner.email, phone: owner.phone, userId: owner.id, name: owner.firstName },
        ],
      });
    }

    return this.getRegisteredSchool(actor, schoolId);
  }
}
