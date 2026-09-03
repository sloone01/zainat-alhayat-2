import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Student } from '../entities/student.entity';
import { PlatformPlan } from './entities/platform-plan.entity';
import { PlatformPlanPrice } from './entities/platform-plan-price.entity';
import { PlatformModule } from './entities/platform-module.entity';
import { PlatformPlanModule } from './entities/platform-plan-module.entity';
import { PlatformAddon } from './entities/platform-addon.entity';
import { SchoolPlatformSubscription } from './entities/school-platform-subscription.entity';
import { SchoolPlatformSubscriptionAddon } from './entities/school-platform-subscription-addon.entity';
import { PlatformInvoice } from './entities/platform-invoice.entity';
import { SchoolModule } from './entities/school-module.entity';
import { RbacGroupService } from '../rbac/rbac-group.service';
import {
  computePeriodEnd,
  PLATFORM_BILLING_PERIODS,
  type PlatformBillingPeriod,
} from './platform-billing.types';
import {
  IssueInvoiceDto,
  MarkInvoicePaidDto,
  UpdatePlatformModuleDto,
  UpdatePlatformPlanDto,
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
    @InjectRepository(PlatformModule)
    private readonly moduleRepo: Repository<PlatformModule>,
    @InjectRepository(PlatformPlanModule)
    private readonly planModuleRepo: Repository<PlatformPlanModule>,
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
    @InjectRepository(SchoolModule)
    private readonly schoolModuleRepo: Repository<SchoolModule>,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
  ) {}

  private assertPlatformAccess(actor: User) {
    if (actor.isSuperAdmin || actor.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  /** Sync school_modules from the school's current subscription plan (no-op if none). */
  async syncSchoolModulesForSchool(schoolId: number) {
    const sub = await this.subRepo.findOne({ where: { school_id: schoolId } });
    if (!sub?.plan_id) return;
    await this.syncSchoolModulesFromPlan(schoolId, sub.plan_id);
  }

  /**
   * Replace plan-sourced school_modules with the modules linked to the given plan.
   * Manual entitlements (source=manual) are preserved.
   */
  async syncSchoolModulesFromPlan(schoolId: number, planId: number) {
    const planModules = await this.planModuleRepo.find({
      where: { plan_id: planId },
    });
    const moduleIds = new Set(planModules.map((pm) => pm.module_id));

    const existing = await this.schoolModuleRepo.find({ where: { school_id: schoolId } });
    for (const row of existing) {
      if (row.source === 'manual') continue;
      if (!moduleIds.has(row.module_id)) {
        await this.schoolModuleRepo.remove(row);
      } else {
        row.is_active = true;
        row.source = 'plan';
        await this.schoolModuleRepo.save(row);
        moduleIds.delete(row.module_id);
      }
    }

    for (const moduleId of moduleIds) {
      await this.schoolModuleRepo.save(
        this.schoolModuleRepo.create({
          school_id: schoolId,
          module_id: moduleId,
          source: 'plan',
          is_active: true,
        }),
      );
    }
  }

  /** Enable school owner admin accounts and provision School Admin user group. */
  private async activateSchoolAdmins(schoolId: number) {
    const admins = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
    });
    for (const admin of admins) {
      admin.user_type = 'staff';
      admin.isActive = true;
      await this.userRepo.save(admin);
      await this.rbacGroupService.ensureSchoolStaffDefaults(schoolId, admin.id);
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

  serializeModule(m: PlatformModule) {
    return {
      id: m.id,
      code: m.code,
      name_en: m.name_en,
      name_ar: m.name_ar,
      description_en: m.description_en,
      description_ar: m.description_ar,
      amount_omr: num(m.amount_omr),
      page_keys: Array.isArray(m.page_keys) ? m.page_keys : [],
      sort_order: m.sort_order,
      is_active: m.is_active,
    };
  }

  async listModules(actor: User) {
    this.assertPlatformAccess(actor);
    const modules = await this.moduleRepo.find({
      order: { sort_order: 'ASC' },
    });
    return {
      modules: modules.map((m) => this.serializeModule(m)),
      billing_periods: [...PLATFORM_BILLING_PERIODS],
    };
  }

  async updateModule(actor: User, moduleCode: string, dto: UpdatePlatformModuleDto) {
    this.assertPlatformAccess(actor);
    const code = moduleCode.trim().toLowerCase();
    const mod = await this.moduleRepo.findOne({ where: { code } });
    if (!mod) throw new NotFoundException(`Module not found: ${code}`);

    if (dto.name_en != null) mod.name_en = dto.name_en.trim();
    if (dto.name_ar != null) mod.name_ar = dto.name_ar.trim();
    if (dto.description_en !== undefined) mod.description_en = dto.description_en;
    if (dto.description_ar !== undefined) mod.description_ar = dto.description_ar;
    if (dto.page_keys) mod.page_keys = dto.page_keys;
    if (dto.is_active != null) mod.is_active = dto.is_active;
    if (dto.amount_omr != null) mod.amount_omr = money(dto.amount_omr);
    await this.moduleRepo.save(mod);

    return this.serializeModule(mod);
  }

  async getPlanDetail(actor: User, planCode: string) {
    this.assertPlatformAccess(actor);
    const code = planCode.trim().toLowerCase();
    const plan = await this.planRepo.findOne({
      where: { code },
      relations: ['prices', 'features'],
    });
    if (!plan) throw new NotFoundException(`Plan not found: ${code}`);

    const [allModules, links] = await Promise.all([
      this.moduleRepo.find({ order: { sort_order: 'ASC' } }),
      this.planModuleRepo.find({ where: { plan_id: plan.id } }),
    ]);
    const included = new Set(links.map((l) => l.module_id));

    return {
      plan: {
        ...this.serializePlan(plan),
        module_codes: allModules.filter((m) => included.has(m.id)).map((m) => m.code),
      },
      modules: allModules.map((m) => ({
        ...this.serializeModule(m),
        included: included.has(m.id),
      })),
      billing_periods: [...PLATFORM_BILLING_PERIODS],
    };
  }

  async updatePlan(actor: User, planCode: string, dto: UpdatePlatformPlanDto) {
    this.assertPlatformAccess(actor);
    const code = planCode.trim().toLowerCase();
    const plan = await this.planRepo.findOne({
      where: { code },
      relations: ['prices', 'features'],
    });
    if (!plan) throw new NotFoundException(`Plan not found: ${code}`);

    if (dto.name_en != null) plan.name_en = dto.name_en.trim();
    if (dto.name_ar != null) plan.name_ar = dto.name_ar.trim();
    if (dto.description_en !== undefined) plan.description_en = dto.description_en;
    if (dto.description_ar !== undefined) plan.description_ar = dto.description_ar;
    if (dto.included_student_seats != null) {
      plan.included_student_seats = dto.included_student_seats;
    }
    if (dto.overage_per_student_omr != null) {
      plan.overage_per_student_omr = money(dto.overage_per_student_omr);
    }
    if (dto.is_active != null) plan.is_active = dto.is_active;
    await this.planRepo.save(plan);

    if (dto.module_codes) {
      const codes = dto.module_codes.map((c) => c.trim().toLowerCase()).filter(Boolean);
      const modules = codes.length
        ? await this.moduleRepo.find({ where: { code: In(codes) } })
        : [];
      if (modules.length !== codes.length) {
        const found = new Set(modules.map((m) => m.code));
        const missing = codes.filter((c) => !found.has(c));
        throw new BadRequestException(`Unknown module codes: ${missing.join(', ')}`);
      }
      await this.planModuleRepo.delete({ plan_id: plan.id });
      for (const mod of modules) {
        await this.planModuleRepo.save(
          this.planModuleRepo.create({ plan_id: plan.id, module_id: mod.id }),
        );
      }
      // Propagate module changes to every school currently on this plan
      const schoolsOnPlan = await this.subRepo.find({ where: { plan_id: plan.id } });
      for (const s of schoolsOnPlan) {
        await this.syncSchoolModulesFromPlan(s.school_id, plan.id);
      }
    }

    if (dto.prices?.length) {
      for (const row of dto.prices) {
        this.assertBillingPeriod(row.billing_period);
        let price = await this.priceRepo.findOne({
          where: { plan_id: plan.id, billing_period: row.billing_period },
        });
        if (!price) {
          price = this.priceRepo.create({
            plan_id: plan.id,
            billing_period: row.billing_period,
            amount_omr: money(row.amount_omr),
          });
        } else {
          price.amount_omr = money(row.amount_omr);
        }
        await this.priceRepo.save(price);
      }
    }

    return this.getPlanDetail(actor, code);
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
    await this.syncSchoolModulesFromPlan(schoolId, plan.id);

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
      const saved = await this.subRepo.save(existing);
      await this.syncSchoolModulesFromPlan(schoolId, plan.id);
      return saved;
    }

    const created = await this.subRepo.save(
      this.subRepo.create({
        school_id: schoolId,
        plan_id: plan.id,
        billing_period: billingPeriod,
        status: 'draft',
        period_start: toDateOnly(start),
        period_end: toDateOnly(end),
      }),
    );
    await this.syncSchoolModulesFromPlan(schoolId, plan.id);
    return created;
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
        membershipFrom: string | null;
        membershipTo: string | null;
      }
    >();

    for (const id of schoolIds) {
      map.set(id, {
        planCode: null,
        billingPeriod: null,
        subscriptionStatus: null,
        invoiceStatus: null,
        membershipFrom: null,
        membershipTo: null,
      });
    }

    // Prefer active membership; otherwise keep the latest by period_end.
    const ranked = [...subs].sort((a, b) => {
      const aActive = a.status === 'active' ? 1 : 0;
      const bActive = b.status === 'active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return String(b.period_end || '').localeCompare(String(a.period_end || ''));
    });

    const seen = new Set<number>();
    for (const sub of ranked) {
      if (seen.has(sub.school_id)) continue;
      seen.add(sub.school_id);
      const inv = invBySchool.get(sub.school_id);
      map.set(sub.school_id, {
        planCode: sub.plan?.code ?? null,
        billingPeriod: sub.billing_period,
        subscriptionStatus: sub.status,
        invoiceStatus: inv?.status ?? null,
        membershipFrom: sub.period_start ?? null,
        membershipTo: sub.period_end ?? null,
      });
    }
    return map;
  }
}
