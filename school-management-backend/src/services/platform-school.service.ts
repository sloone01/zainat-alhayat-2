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
import { DataSource, ILike, Repository } from 'typeorm';
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
import { Staff } from '../entities/staff.entity';
import {
  ensureStaffMembership,
  findSchoolOwnerUser,
  isLinkableStaffAccount,
} from '../common/identity/staff-membership';

export interface RegisteredSchoolRow {
  id: string;
  name: string;
  name_ar: string | null;
  name_en: string | null;
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

  private async findOwnerUser(schoolId: string): Promise<User | null> {
    return findSchoolOwnerUser(this.userRepo.manager, schoolId);
  }

  private ownerCreatedForSchool(owner: User, schoolId: string): boolean {
    return owner.school_id === schoolId;
  }

  private async ownerForSchool(schoolId: string) {
    const user = await this.findOwnerUser(schoolId);
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

  /** New-school owners get a temp password; linked staff keep their existing login. */
  private async provisionOwnerOnApprove(
    admin: User,
    schoolId: string,
  ): Promise<{ admin: User; tempPassword: string }> {
    if (!this.ownerCreatedForSchool(admin, schoolId)) {
      if (
        admin.user_type === 'parent' ||
        admin.user_type === 'student' ||
        admin.role === 'parent' ||
        admin.role === 'student'
      ) {
        admin.role = 'admin';
        admin.user_type = 'staff';
        admin = await this.userRepo.save(admin);
      }
      return { admin, tempPassword: '' };
    }
    const tempPassword = randomBytes(9).toString('base64url').slice(0, 12);
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    admin.role = 'admin';
    admin.user_type = 'staff';
    admin.isActive = true;
    admin.password = await bcrypt.hash(tempPassword, saltRounds);
    admin = await this.userRepo.save(admin);
    return { admin, tempPassword };
  }

  /**
   * Gmail send is often 5–13s — queue and return so approve/register does not hit the SPA
   * axios timeout after the school status has already been saved.
   */
  private queueOwnerApprovalEmail(
    admin: User,
    school: School,
    opts: {
      tempPassword: string;
      planName: string;
      amount: string;
      currency?: string;
      paidNote?: string;
      invoiceTotal?: string;
      attachments?: NotifyRequest['attachments'];
    },
  ): void {
    const linked = !this.ownerCreatedForSchool(admin, school.id);
    const recipientName = `${admin.firstName} ${admin.lastName}`.trim() || admin.email;
    const variables: Record<string, string> = {
      recipientName,
      schoolName: school.name,
      email: admin.email || '',
      planName: opts.planName,
      amount: opts.amount,
      currency: opts.currency || 'OMR',
      loginUrl: this.loginUrl(),
      paidNote: opts.paidNote || '',
      invoiceTotal: opts.invoiceTotal || '',
    };
    if (!linked && opts.tempPassword) {
      variables.password = opts.tempPassword;
      variables.tempPassword = opts.tempPassword;
    }
    const label = linked ? 'school_approved_existing' : 'school_approved';
    void this.notifications
      .notifySafe({
        schoolId: school.id,
        templateKey: linked
          ? NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_APPROVED_EXISTING
          : NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_APPROVED,
        locale: 'ar',
        variables,
        recipients: [
          { email: admin.email, phone: admin.phone, userId: admin.id, name: admin.firstName },
        ],
        attachments: opts.attachments?.length ? opts.attachments : undefined,
      })
      .then((result) => {
        if (result.errors.length || result.emailSent < 1) {
          this.logger.error(
            `${label} email failed for school ${school.id}: ${
              (result.errors || []).join('; ') || 'no email sent'
            }`,
          );
        }
      });
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
        name_ar: school.name_ar ?? null,
        name_en: school.name_en ?? null,
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
    const existing = await this.userRepo.findOne({ where: { email: ILike(email) } });
    if (existing && !isLinkableStaffAccount(existing)) {
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
    const hashedPassword = existing
      ? null
      : await bcrypt.hash(randomBytes(32).toString('base64url'), saltRounds);

    const schoolId = await this.dataSource.transaction(async (manager) => {
      const schoolRepo = manager.getRepository(School);
      const userRepo = manager.getRepository(User);

      const nameAr = dto.school_name_ar.trim();
      const nameEn = dto.school_name_en.trim();
      const schoolName = dto.school_name?.trim() || nameAr || nameEn;

      const school = schoolRepo.create({
        name: schoolName,
        name_ar: nameAr,
        name_en: nameEn,
        address: dto.school_address?.trim() || null,
        phone: dto.school_phone.trim(),
        email: dto.school_email.trim().toLowerCase(),
        cr_document_url: docs.crRelativeUrl || null,
        owner_id_document_url: docs.idRelativeUrl || null,
        owner_legal_name: ownerLegal,
        status: 'pending',
      });
      await schoolRepo.save(school);

      if (existing) {
        await ensureStaffMembership(manager, existing.id, school.id);
        return school.id;
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

    let admin = await this.findOwnerUser(schoolId);
    if (!admin) {
      throw new BadRequestException('No owner account found for this school.');
    }

    const provisioned = await this.provisionOwnerOnApprove(admin, schoolId);
    admin = provisioned.admin;
    const tempPassword = provisioned.tempPassword;

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

    this.queueOwnerApprovalEmail(admin, school, {
      tempPassword,
      planName,
      amount: String(payment.paidAmount),
      invoiceTotal: String(paidInvoice.total_amount ?? billing.invoice.total_amount ?? ''),
      paidNote: payment.paidNote || '',
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

    if (dto.name_ar !== undefined) {
      school.name_ar = dto.name_ar?.trim() || null;
    }
    if (dto.name_en !== undefined) {
      school.name_en = dto.name_en?.trim() || null;
    }
    if (dto.name != null) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException('School name cannot be empty');
      school.name = name;
    } else if (dto.name_ar !== undefined || dto.name_en !== undefined) {
      const display =
        (school.name_ar || '').trim() ||
        (school.name_en || '').trim() ||
        school.name;
      if (!display) throw new BadRequestException('School name cannot be empty');
      school.name = display;
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

    let admin = await this.findOwnerUser(schoolId);

    if (!admin) {
      throw new BadRequestException(
        'No owner account found for this school. Cannot activate without an admin user.',
      );
    }

    const provisioned = await this.provisionOwnerOnApprove(admin, schoolId);
    admin = provisioned.admin;
    const tempPassword = provisioned.tempPassword;

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

    // Status is committed before mail — do not await SMTP (client would timeout and look like a failed approve).
    this.queueOwnerApprovalEmail(admin, school, {
      tempPassword,
      planName,
      amount,
      currency,
    });

    const row = await this.getRegisteredSchool(actor, schoolId);
    return {
      school: row,
      admin_user_id: admin.id,
      email_sent: true,
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

    const owner = await this.findOwnerUser(schoolId);
    if (owner) {
      if (this.ownerCreatedForSchool(owner, schoolId)) {
        owner.isActive = false;
        await this.userRepo.save(owner);
      } else {
        await this.dataSource.getRepository(Staff).delete({
          user_id: owner.id,
          school_id: schoolId,
        });
      }
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
