import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Student } from '../entities/student.entity';
import { PlatformPlan } from './entities/platform-plan.entity';
import { PlatformPlanPrice } from './entities/platform-plan-price.entity';
import { PlatformAddon } from './entities/platform-addon.entity';
import { SchoolPlatformSubscription } from './entities/school-platform-subscription.entity';
import { SchoolPlatformSubscriptionAddon } from './entities/school-platform-subscription-addon.entity';
import { PlatformInvoice } from './entities/platform-invoice.entity';
import {
  computePeriodEnd,
  PLATFORM_BILLING_PERIODS,
  type PlatformBillingPeriod,
} from './platform-billing.types';
import {
  IssueInvoiceDto,
  MarkInvoicePaidDto,
  UpsertSchoolSubscriptionDto,
} from './dto/platform-billing.dto';

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === 'number' ? v : parseFloat(v) || 0;
}

function money(n: number): string {
  return n.toFixed(3);
}

@Injectable()
export class PlatformBillingService {
  constructor(
    @InjectRepository(PlatformPlan)
    private readonly planRepo: Repository<PlatformPlan>,
    @InjectRepository(PlatformPlanPrice)
    private readonly priceRepo: Repository<PlatformPlanPrice>,
    @InjectRepository(PlatformAddon)
    private readonly addonRepo: Repository<PlatformAddon>,
    @InjectRepository(SchoolPlatformSubscription)
    private readonly subRepo: Repository<SchoolPlatformSubscription>,
    @InjectRepository(SchoolPlatformSubscriptionAddon)
    private readonly subAddonRepo: Repository<SchoolPlatformSubscriptionAddon>,
    @InjectRepository(PlatformInvoice)
    private readonly invoiceRepo: Repository<PlatformInvoice>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private assertPlatformAccess(actor: User) {
    if (actor.isSuperAdmin || actor.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  /** Enable school owner admin accounts when the school becomes active. */
  private async activateSchoolAdmins(schoolId: number) {
    const admins = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
    });
    for (const admin of admins) {
      if (!admin.isActive) {
        admin.isActive = true;
        await this.userRepo.save(admin);
      }
    }
  }

  private assertBillingPeriod(period: string): asserts period is PlatformBillingPeriod {
    if (!(PLATFORM_BILLING_PERIODS as readonly string[]).includes(period)) {
      throw new BadRequestException(`Invalid billing_period: ${period}`);
    }
  }

  async listPublicPlans() {
    const plans = await this.planRepo.find({
      where: { is_active: true },
      relations: ['prices', 'features'],
      order: { sort_order: 'ASC' },
    });
    const addons = await this.addonRepo.find({
      where: { is_active: true },
      order: { id: 'ASC' },
    });
    return {
      plans: plans.map((p) => this.serializePlan(p)),
      addons: addons.map((a) => this.serializeAddon(a)),
      billing_periods: [...PLATFORM_BILLING_PERIODS],
    };
  }

  async listPlansForAdmin(actor: User) {
    this.assertPlatformAccess(actor);
    return this.listPublicPlans();
  }

  serializePlan(p: PlatformPlan) {
    return {
      id: p.id,
      code: p.code,
      name_en: p.name_en,
      name_ar: p.name_ar,
      description_en: p.description_en,
      description_ar: p.description_ar,
      included_student_seats: p.included_student_seats,
      overage_per_student_omr: num(p.overage_per_student_omr),
      sort_order: p.sort_order,
      is_active: p.is_active,
      prices: (p.prices || []).map((pr) => ({
        billing_period: pr.billing_period,
        amount_omr: num(pr.amount_omr),
      })),
      features: (p.features || []).map((f) => f.feature_key),
    };
  }

  serializeAddon(a: PlatformAddon) {
    return {
      id: a.id,
      code: a.code,
      name_en: a.name_en,
      name_ar: a.name_ar,
      amount_omr: num(a.amount_omr),
      feature_key: a.feature_key,
      is_active: a.is_active,
    };
  }

  async getSchoolSubscription(actor: User, schoolId: number) {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const sub = await this.subRepo.findOne({
      where: { school_id: schoolId },
      relations: ['plan', 'plan.prices', 'plan.features', 'addonLinks', 'addonLinks.addon'],
    });

    const invoices = await this.invoiceRepo.find({
      where: { school_id: schoolId },
      order: { created_at: 'DESC' },
      take: 20,
    });

    const studentCount = await this.studentRepo.count({
      where: { school_id: schoolId },
    });

    return {
      school: {
        id: school.id,
        name: school.name,
        status: school.status,
      },
      studentCount,
      subscription: sub ? this.serializeSubscription(sub) : null,
      invoices: invoices.map((i) => this.serializeInvoice(i)),
    };
  }

  serializeSubscription(sub: SchoolPlatformSubscription) {
    return {
      id: sub.id,
      school_id: sub.school_id,
      plan_id: sub.plan_id,
      plan_code: sub.plan?.code ?? null,
      plan_name_en: sub.plan?.name_en ?? null,
      plan_name_ar: sub.plan?.name_ar ?? null,
      billing_period: sub.billing_period,
      status: sub.status,
      period_start: sub.period_start,
      period_end: sub.period_end,
      included_student_seats_override: sub.included_student_seats_override,
      included_student_seats:
        sub.included_student_seats_override ??
        sub.plan?.included_student_seats ??
        null,
      notes: sub.notes,
      addon_codes: (sub.addonLinks || [])
        .map((l) => l.addon?.code)
        .filter(Boolean) as string[],
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    };
  }

  serializeInvoice(inv: PlatformInvoice) {
    return {
      id: inv.id,
      school_id: inv.school_id,
      subscription_id: inv.subscription_id,
      billing_period: inv.billing_period,
      period_start: inv.period_start,
      period_end: inv.period_end,
      base_amount: num(inv.base_amount),
      seats_included: inv.seats_included,
      seats_used: inv.seats_used,
      overage_amount: num(inv.overage_amount),
      addons_amount: num(inv.addons_amount),
      total_amount: num(inv.total_amount),
      status: inv.status,
      paid_at: inv.paid_at,
      paid_note: inv.paid_note,
      line_items: inv.line_items,
      created_at: inv.created_at,
    };
  }

  async upsertSchoolSubscription(
    actor: User,
    schoolId: number,
    dto: UpsertSchoolSubscriptionDto,
  ) {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    this.assertBillingPeriod(dto.billing_period);

    const plan = await this.planRepo.findOne({
      where: { code: dto.plan_code, is_active: true },
      relations: ['prices'],
    });
    if (!plan) throw new BadRequestException(`Unknown plan: ${dto.plan_code}`);

    const start = dto.period_start
      ? new Date(dto.period_start)
      : new Date();
    const end = dto.period_end
      ? new Date(dto.period_end)
      : computePeriodEnd(start, dto.billing_period);

    let sub = await this.subRepo.findOne({ where: { school_id: schoolId } });
    if (!sub) {
      sub = this.subRepo.create({ school_id: schoolId });
    }

    sub.plan_id = plan.id;
    sub.billing_period = dto.billing_period;
    sub.period_start = toDateOnly(start);
    sub.period_end = toDateOnly(end);
    sub.status = dto.status ?? sub.status ?? 'draft';
    if (dto.included_student_seats_override !== undefined) {
      sub.included_student_seats_override = dto.included_student_seats_override;
    }
    if (dto.notes !== undefined) sub.notes = dto.notes;

    await this.subRepo.save(sub);

    if (dto.addon_codes) {
      await this.subAddonRepo.delete({ subscription_id: sub.id });
      if (dto.addon_codes.length) {
        const addons = await this.addonRepo.find({
          where: { code: In(dto.addon_codes), is_active: true },
        });
        for (const addon of addons) {
          await this.subAddonRepo.save(
            this.subAddonRepo.create({
              subscription_id: sub.id,
              addon_id: addon.id,
            }),
          );
        }
      }
    }

    if (dto.activate_school) {
      school.status = 'active';
      sub.status = 'active';
      await this.schoolRepo.save(school);
      await this.subRepo.save(sub);
      await this.activateSchoolAdmins(schoolId);
    } else if (dto.school_status) {
      school.status = dto.school_status;
      await this.schoolRepo.save(school);
      if (dto.school_status === 'active') {
        await this.activateSchoolAdmins(schoolId);
      }
    }

    return this.getSchoolSubscription(actor, schoolId);
  }

  /**
   * Called during public school signup — no actor check.
   */
  async createDraftSubscriptionForSchool(
    schoolId: number,
    planCode: string,
    billingPeriod: string,
  ) {
    this.assertBillingPeriod(billingPeriod);
    const plan = await this.planRepo.findOne({
      where: { code: planCode, is_active: true },
    });
    if (!plan) {
      throw new BadRequestException(`Unknown or inactive plan: ${planCode}`);
    }

    const start = new Date();
    const end = computePeriodEnd(start, billingPeriod);

    const existing = await this.subRepo.findOne({ where: { school_id: schoolId } });
    if (existing) {
      existing.plan_id = plan.id;
      existing.billing_period = billingPeriod;
      existing.period_start = toDateOnly(start);
      existing.period_end = toDateOnly(end);
      existing.status = 'draft';
      return this.subRepo.save(existing);
    }

    return this.subRepo.save(
      this.subRepo.create({
        school_id: schoolId,
        plan_id: plan.id,
        billing_period: billingPeriod,
        status: 'draft',
        period_start: toDateOnly(start),
        period_end: toDateOnly(end),
      }),
    );
  }

  async issueInvoice(actor: User, schoolId: number, dto: IssueInvoiceDto = {}) {
    this.assertPlatformAccess(actor);
    const sub = await this.subRepo.findOne({
      where: { school_id: schoolId },
      relations: ['plan', 'plan.prices', 'addonLinks', 'addonLinks.addon'],
    });
    if (!sub) {
      throw new BadRequestException('School has no platform subscription');
    }

    const periodStart = dto.period_start || sub.period_start;
    const periodEnd = dto.period_end || sub.period_end;

    const price = (sub.plan.prices || []).find(
      (p) => p.billing_period === sub.billing_period,
    );
    if (!price) {
      throw new BadRequestException(
        `No price for plan ${sub.plan.code} / ${sub.billing_period}`,
      );
    }

    const seatsUsed = await this.studentRepo.count({
      where: { school_id: schoolId },
    });
    const seatsIncluded =
      sub.included_student_seats_override ?? sub.plan.included_student_seats;
    const overageRate = num(sub.plan.overage_per_student_omr);
    const extraSeats = Math.max(0, seatsUsed - seatsIncluded);
    const overageAmount = extraSeats * overageRate;

    const addonLinks = sub.addonLinks || [];
    let addonsAmount = 0;
    const lineItems: Record<string, unknown>[] = [
      {
        type: 'base',
        label: `${sub.plan.code} (${sub.billing_period})`,
        amount: num(price.amount_omr),
      },
    ];

    for (const link of addonLinks) {
      const amt = num(link.addon?.amount_omr);
      addonsAmount += amt;
      lineItems.push({
        type: 'addon',
        code: link.addon?.code,
        label: link.addon?.name_en,
        amount: amt,
      });
    }

    if (overageAmount > 0) {
      lineItems.push({
        type: 'overage',
        seats_extra: extraSeats,
        rate: overageRate,
        amount: overageAmount,
      });
    }

    const baseAmount = num(price.amount_omr);
    const total = baseAmount + addonsAmount + overageAmount;

    const invoice = await this.invoiceRepo.save(
      this.invoiceRepo.create({
        school_id: schoolId,
        subscription_id: sub.id,
        billing_period: sub.billing_period,
        period_start: periodStart,
        period_end: periodEnd,
        base_amount: money(baseAmount),
        seats_included: seatsIncluded,
        seats_used: seatsUsed,
        overage_amount: money(overageAmount),
        addons_amount: money(addonsAmount),
        total_amount: money(total),
        status: 'issued',
        line_items: lineItems,
      }),
    );

    return this.serializeInvoice(invoice);
  }

  async markInvoicePaid(
    actor: User,
    invoiceId: number,
    dto: MarkInvoicePaidDto = {},
  ) {
    this.assertPlatformAccess(actor);
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'void') {
      throw new BadRequestException('Cannot pay a void invoice');
    }

    invoice.status = 'paid';
    invoice.paid_at = new Date();
    invoice.paid_note = dto.paid_note ?? invoice.paid_note;
    await this.invoiceRepo.save(invoice);

    const activate = dto.activate_school !== false;
    if (activate) {
      const sub = await this.subRepo.findOne({
        where: { id: invoice.subscription_id },
      });
      if (sub) {
        sub.status = 'active';
        await this.subRepo.save(sub);
      }
      const school = await this.schoolRepo.findOne({
        where: { id: invoice.school_id },
      });
      if (school) {
        school.status = 'active';
        await this.schoolRepo.save(school);
        await this.activateSchoolAdmins(school.id);
      }
    }

    return this.serializeInvoice(invoice);
  }

  async getSubscriptionSummaryBySchoolIds(schoolIds: number[]) {
    if (!schoolIds.length) return new Map();

    const subs = await this.subRepo.find({
      where: { school_id: In(schoolIds) },
      relations: ['plan'],
    });

    const latestInvoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .distinctOn(['inv.school_id'])
      .where('inv.school_id IN (:...ids)', { ids: schoolIds })
      .orderBy('inv.school_id')
      .addOrderBy('inv.created_at', 'DESC')
      .getMany();

    const invBySchool = new Map(latestInvoices.map((i) => [i.school_id, i]));
    const map = new Map<
      number,
      {
        planCode: string | null;
        billingPeriod: string | null;
        subscriptionStatus: string | null;
        invoiceStatus: string | null;
      }
    >();

    for (const id of schoolIds) {
      map.set(id, {
        planCode: null,
        billingPeriod: null,
        subscriptionStatus: null,
        invoiceStatus: null,
      });
    }
    for (const sub of subs) {
      const inv = invBySchool.get(sub.school_id);
      map.set(sub.school_id, {
        planCode: sub.plan?.code ?? null,
        billingPeriod: sub.billing_period,
        subscriptionStatus: sub.status,
        invoiceStatus: inv?.status ?? null,
      });
    }
    return map;
  }
}
