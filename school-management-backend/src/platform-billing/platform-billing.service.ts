import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { existsSync } from 'fs';
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
import { RbacPermissionService } from '../rbac/rbac-permission.service';
import {
  computePeriodEnd,
  PLATFORM_BILLING_PERIODS,
  type PlatformBillingPeriod,
} from './platform-billing.types';
import {
  IssueInvoiceDto,
  MarkInvoicePaidDto,
  UpdatePlatformModuleDto,
  CreatePlatformPlanDto,
  UpdatePlatformPlanDto,
  UpsertSchoolSubscriptionDto,
} from './dto/platform-billing.dto';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import type { NotifyRequest } from '../notifications/notification.types';
import { ThawaniService } from '../services/thawani.service';
import { assertSameSchool } from '../common/security/school-access';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

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
    @Inject(forwardRef(() => RbacPermissionService))
    private readonly rbacPermissions: RbacPermissionService,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
    private readonly thawani: ThawaniService,
  ) {}

  private assertPlatformAccess(actor: User) {
    if (actor.isSuperAdmin || actor.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  /** Sync school_modules from the school's current subscription plan (no-op if none). */
  /**
   * Modules a school actually has, with where each came from. `manual` grants are the
   * per-school escape hatch: they survive a plan sync, so a school can be given a module
   * without changing what its plan sells to everyone else.
   */
  async listSchoolModules(actor: User, schoolId: string) {
    this.assertPlatformAccess(actor);
    const [modules, rows] = await Promise.all([
      this.moduleRepo.find({ where: { is_active: true }, order: { sort_order: 'ASC' } }),
      this.schoolModuleRepo.find({ where: { school_id: schoolId } }),
    ]);
    const bySource = new Map(rows.map((r) => [r.module_id, r]));
    return {
      modules: modules.map((m) => {
        const row = bySource.get(m.id);
        return {
          ...this.serializeModule(m),
          granted: Boolean(row?.is_active),
          source: row?.source ?? null,
        };
      }),
    };
  }

  /**
   * Replace this school's manual module grants. Plan-sourced modules are left alone —
   * they follow the subscription.
   */
  async setSchoolManualModules(actor: User, schoolId: string, codes: string[]) {
    this.assertPlatformAccess(actor);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    const wanted = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
    const modules = wanted.length
      ? await this.moduleRepo.find({ where: { code: In(wanted) } })
      : [];
    if (modules.length !== wanted.length) {
      const found = new Set(modules.map((m) => m.code));
      throw new BadRequestException(
        `Unknown module code(s): ${wanted.filter((c) => !found.has(c)).join(', ')}`,
      );
    }

    const existing = await this.schoolModuleRepo.find({ where: { school_id: schoolId } });
    const planIds = new Set(
      existing.filter((r) => r.source !== 'manual').map((r) => r.module_id),
    );
    const wantedIds = new Set(modules.map((m) => m.id));

    for (const row of existing) {
      if (row.source !== 'manual') continue;
      if (!wantedIds.has(row.module_id)) await this.schoolModuleRepo.remove(row);
    }
    for (const moduleId of wantedIds) {
      // Already covered by the plan — no manual row needed.
      if (planIds.has(moduleId)) continue;
      const row = existing.find((r) => r.module_id === moduleId && r.source === 'manual');
      if (row) {
        row.is_active = true;
        await this.schoolModuleRepo.save(row);
      } else {
        await this.schoolModuleRepo.save(
          this.schoolModuleRepo.create({
            school_id: schoolId,
            module_id: moduleId,
            source: 'manual',
            is_active: true,
          }),
        );
      }
    }

    // Claims are cached per user and filtered by these modules.
    this.rbacPermissions.invalidateSchool(schoolId);
    return this.listSchoolModules(actor, schoolId);
  }

  async syncSchoolModulesForSchool(schoolId: string) {
    const sub = await this.subRepo.findOne({ where: { school_id: schoolId } });
    if (!sub?.plan_id) return;
    await this.syncSchoolModulesFromPlan(schoolId, sub.plan_id);
  }

  /**
   * Replace plan-sourced school_modules with the modules linked to the given plan.
   * Manual entitlements (source=manual) are preserved.
   */
  async syncSchoolModulesFromPlan(schoolId: string, planId: string) {
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
  private async activateSchoolAdmins(schoolId: string) {
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
    // The public pricing page describes each plan by the modules it includes, so it needs
    // both the plan's module links and the catalog that turns codes into readable names.
    // `features` is a separate legacy list and does not map onto modules.
    const modules = await this.moduleRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
    const links = await this.planModuleRepo.find();
    const modulesById = new Map(modules.map((m) => [m.id, m]));
    const codesByPlan = new Map<string, string[]>();
    for (const link of links) {
      const module = modulesById.get(link.module_id);
      if (!module) continue;
      if (!codesByPlan.has(link.plan_id)) codesByPlan.set(link.plan_id, []);
      codesByPlan.get(link.plan_id)!.push(module.code);
    }
    return {
      plans: plans.map((p) => ({
        ...this.serializePlan(p),
        module_codes: codesByPlan.get(p.id) ?? [],
      })),
      addons: addons.map((a) => this.serializeAddon(a)),
      modules: modules.map((m) => this.serializeModule(m)),
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
      await this.applyPlanModules(plan.id, await this.resolveModules(dto.module_codes));
    }

    if (dto.prices?.length) {
      await this.applyPlanPrices(plan.id, dto.prices);
    }

    return this.getPlanDetail(actor, code);
  }

  /** Resolve module codes, rejecting the whole set if any code is unknown. */
  private async resolveModules(rawCodes: string[]): Promise<PlatformModule[]> {
    const codes = rawCodes.map((c) => c.trim().toLowerCase()).filter(Boolean);
    const modules = codes.length
      ? await this.moduleRepo.find({ where: { code: In(codes) } })
      : [];
    if (modules.length !== codes.length) {
      const found = new Set(modules.map((m) => m.code));
      throw new BadRequestException(
        `Unknown module codes: ${codes.filter((c) => !found.has(c)).join(', ')}`,
      );
    }
    return modules;
  }

  private async applyPlanModules(planId: string, modules: PlatformModule[]) {
    await this.planModuleRepo.delete({ plan_id: planId });
    for (const mod of modules) {
      await this.planModuleRepo.save(
        this.planModuleRepo.create({ plan_id: planId, module_id: mod.id }),
      );
    }
    // Propagate module changes to every school currently on this plan
    const schoolsOnPlan = await this.subRepo.find({ where: { plan_id: planId } });
    for (const s of schoolsOnPlan) {
      await this.syncSchoolModulesFromPlan(s.school_id, planId);
    }
    this.rbacPermissions.invalidateAllClaims();
  }

  private async applyPlanPrices(
    planId: string,
    rows: { billing_period: string; amount_omr: number }[],
  ) {
    for (const row of rows) {
      this.assertBillingPeriod(row.billing_period);
      let price = await this.priceRepo.findOne({
        where: { plan_id: planId, billing_period: row.billing_period as PlatformBillingPeriod },
      });
      if (!price) {
        price = this.priceRepo.create({
          plan_id: planId,
          billing_period: row.billing_period as PlatformBillingPeriod,
          amount_omr: money(row.amount_omr),
        });
      } else {
        price.amount_omr = money(row.amount_omr);
      }
      await this.priceRepo.save(price);
    }
  }

  async createPlan(actor: User, dto: CreatePlatformPlanDto) {
    this.assertPlatformAccess(actor);
    const code = dto.code.trim().toLowerCase();
    const existing = await this.planRepo.findOne({ where: { code } });
    if (existing) throw new ConflictException(`Plan code already exists: ${code}`);

    // Resolve first: an unknown module code must not leave a half-created plan behind.
    const modules = dto.module_codes?.length
      ? await this.resolveModules(dto.module_codes)
      : [];
    for (const row of dto.prices ?? []) this.assertBillingPeriod(row.billing_period);

    const last = await this.planRepo.find({ order: { sort_order: 'DESC' }, take: 1 });
    const plan = await this.planRepo.save(
      this.planRepo.create({
        code,
        name_en: dto.name_en.trim(),
        name_ar: dto.name_ar.trim(),
        description_en: dto.description_en ?? null,
        description_ar: dto.description_ar ?? null,
        included_student_seats: dto.included_student_seats ?? 50,
        overage_per_student_omr: money(dto.overage_per_student_omr ?? 0),
        sort_order: dto.sort_order ?? (last[0]?.sort_order ?? 0) + 1,
        is_active: dto.is_active ?? true,
      }),
    );

    if (modules.length) await this.applyPlanModules(plan.id, modules);
    if (dto.prices?.length) await this.applyPlanPrices(plan.id, dto.prices);

    return this.getPlanDetail(actor, code);
  }

  async deletePlan(actor: User, planCode: string) {
    this.assertPlatformAccess(actor);
    const code = planCode.trim().toLowerCase();
    const plan = await this.planRepo.findOne({ where: { code } });
    if (!plan) throw new NotFoundException(`Plan not found: ${code}`);

    // Subscriptions reference the plan — refuse with a reason rather than a FK error.
    const subscriptions = await this.subRepo.count({ where: { plan_id: plan.id } });
    if (subscriptions > 0) {
      throw new ConflictException(
        `Plan is used by ${subscriptions} subscription(s) and cannot be deleted`,
      );
    }

    await this.planModuleRepo.delete({ plan_id: plan.id });
    await this.priceRepo.delete({ plan_id: plan.id });
    await this.planRepo.delete({ id: plan.id });
    return { code, deleted: true };
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

  async getSchoolSubscription(actor: User, schoolId: string) {
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
      paid_amount: inv.paid_amount != null ? num(inv.paid_amount) : null,
      paid_receipt_url: inv.paid_receipt_url,
      line_items: inv.line_items,
      created_at: inv.created_at,
    };
  }

  async upsertSchoolSubscription(
    actor: User,
    schoolId: string,
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

    const prevStatus = school.status;
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
      if (dto.school_status !== prevStatus) {
        void this.notifySchoolStatus(school, dto.school_status);
      }
    }

    return this.getSchoolSubscription(actor, schoolId);
  }

  /**
   * Called during public school signup — no actor check.
   */
  async createDraftSubscriptionForSchool(
    schoolId: string,
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

  async issueInvoice(
    actor: User,
    schoolId: string,
    dto: IssueInvoiceDto = {},
    opts?: { notify?: boolean },
  ) {
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

    if (opts?.notify !== false) {
      void this.notifyInvoice(
        schoolId,
        invoice.id,
        invoice.total_amount,
        NOTIFICATION_TEMPLATE_KEYS.PLATFORM_INVOICE_ISSUED,
      );
    }
    return this.serializeInvoice(invoice);
  }

  /** First unpaid invoice for approval (does not send the generic invoice-issued mail). */
  async ensureIssuedInvoiceForSchool(actor: User, schoolId: string) {
    this.assertPlatformAccess(actor);
    const sub = await this.subRepo.findOne({
      where: { school_id: schoolId },
      relations: ['plan', 'plan.prices', 'addonLinks', 'addonLinks.addon'],
    });
    if (!sub) {
      return { invoice: null, planNameEn: '', planNameAr: '' };
    }
    const [existing] = await this.invoiceRepo.find({
      where: { school_id: schoolId, status: 'issued' },
      order: { created_at: 'DESC' },
      take: 1,
    });
    const invoice = existing
      ? this.serializeInvoice(existing)
      : await this.issueInvoice(actor, schoolId, {}, { notify: false });
    return {
      invoice,
      planNameEn: sub.plan?.name_en || sub.plan?.code || '',
      planNameAr: sub.plan?.name_ar || sub.plan?.name_en || sub.plan?.code || '',
    };
  }

  async markInvoicePaid(
    actor: User,
    invoiceId: string,
    dto: MarkInvoicePaidDto,
    paidReceiptUrl?: string,
    opts?: { notify?: boolean },
  ) {
    this.assertPlatformAccess(actor);
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'void') {
      throw new BadRequestException('Cannot pay a void invoice');
    }
    if (dto.paid_amount == null || !Number.isFinite(Number(dto.paid_amount)) || Number(dto.paid_amount) < 0) {
      throw new BadRequestException('paid_amount is required and must be >= 0');
    }

    invoice.status = 'paid';
    invoice.paid_at = new Date();
    invoice.paid_amount = String(dto.paid_amount);
    invoice.paid_note = dto.paid_note ?? invoice.paid_note;
    if (paidReceiptUrl) {
      invoice.paid_receipt_url = paidReceiptUrl;
    }
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

    if (opts?.notify !== false) {
      void this.notifyInvoicePaid(invoice);
    }
    return this.serializeInvoice(invoice);
  }

  private async notifySchoolStatus(school: School, status: string): Promise<void> {
    const templateKey =
      status === 'rejected'
        ? NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_REJECTED
        : status === 'suspended'
          ? NOTIFICATION_TEMPLATE_KEYS.PLATFORM_SCHOOL_SUSPENDED
          : null;
    if (!templateKey) return;
    const recipients = await this.audience.schoolAdmins(school.id);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId: school.id,
      templateKey,
      locale: 'ar',
      variables: {
        recipientName: recipients[0]?.name || school.owner_legal_name || 'Owner',
        notes: '',
      },
      recipients,
    });
  }

  private async notifyInvoice(
    schoolId: string,
    invoiceId: string,
    amount: string | number,
    templateKey: string,
  ): Promise<void> {
    const recipients = await this.audience.schoolAdmins(schoolId);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId,
      templateKey,
      locale: 'ar',
      variables: {
        recipientName: recipients[0]?.name || 'Owner',
        reference: String(invoiceId),
        amount: typeof amount === 'number' ? amount.toFixed(3) : String(amount),
        currency: 'OMR',
      },
      recipients,
    });
  }

  /** Email/SMS payment confirmation (+ attached receipt file when uploaded). */
  private async notifyInvoicePaid(invoice: PlatformInvoice): Promise<void> {
    const recipients = await this.audience.schoolAdmins(invoice.school_id);
    if (!recipients.length) return;

    const paidAmount =
      invoice.paid_amount != null ? String(invoice.paid_amount) : String(invoice.total_amount);
    const attachments: NonNullable<NotifyRequest['attachments']> = [];
    if (invoice.paid_receipt_url) {
      const filename = invoice.paid_receipt_url.split('/').pop();
      if (filename && !filename.includes('..')) {
        const path = `./uploads/platform-invoice-receipts/${filename}`;
        if (existsSync(path)) {
          attachments.push({ filename, path });
        }
      }
    }

    await this.notifications.notifySafe({
      schoolId: invoice.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PLATFORM_INVOICE_PAID,
      locale: 'ar',
      variables: {
        recipientName: recipients[0]?.name || 'Owner',
        reference: String(invoice.id).slice(0, 8),
        amount: paidAmount,
        invoiceTotal: String(invoice.total_amount),
        currency: 'OMR',
        periodStart: invoice.period_start || '',
        periodEnd: invoice.period_end || '',
        paidNote: invoice.paid_note?.trim() || '',
        hasReceiptAttachment: attachments.length ? '1' : '0',
      },
      recipients,
      attachments: attachments.length ? attachments : undefined,
    });
  }

  async getSubscriptionSummaryBySchoolIds(schoolIds: string[]) {
    if (!schoolIds.length) return new Map();

    const subs = await this.subRepo.find({
      where: { school_id: In(schoolIds) },
      relations: ['plan'],
    });

    const latestInvoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select(['inv.id', 'inv.school_id', 'inv.status', 'inv.created_at'])
      .distinctOn(['inv.school_id'])
      .where('inv.school_id IN (:...ids)', { ids: schoolIds })
      .orderBy('inv.school_id')
      .addOrderBy('inv.created_at', 'DESC')
      .getMany();

    const invBySchool = new Map(latestInvoices.map((i) => [i.school_id, i]));
    const map = new Map<
      string,
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

    const seen = new Set<string>();
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

  /** School-admin self-serve billing summary (subscription + open invoice). */
  async getSchoolSelfBilling(actor: User, schoolId: string) {
    assertSameSchool(actor, schoolId);
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

    const open = invoices.find((i) => i.status === 'issued') ?? null;

    return {
      school: {
        id: school.id,
        name: school.name,
        status: school.status,
      },
      subscription: sub ? this.serializeSubscription(sub) : null,
      invoice: open ? this.serializeInvoice(open) : null,
      invoices: invoices.map((i) => this.serializeInvoice(i)),
      thawani_configured: this.thawani.isConfigured(),
    };
  }

  async createSchoolThawaniSession(
    actor: User,
    schoolId: string,
    input: { successUrl: string; cancelUrl: string },
  ) {
    assertSameSchool(actor, schoolId);
    this.thawani.assertConfigured();
    const [invoice] = await this.invoiceRepo.find({
      where: { school_id: schoolId, status: 'issued' },
      order: { created_at: 'DESC' },
      take: 1,
    });
    if (!invoice) {
      throw new BadRequestException('No unpaid invoice to pay');
    }
    const amount = num(invoice.total_amount);
    if (amount <= 0) {
      invoice.status = 'paid';
      invoice.paid_at = new Date();
      invoice.paid_note = 'Zero-amount invoice';
      await this.invoiceRepo.save(invoice);
      const sub = await this.subRepo.findOne({ where: { id: invoice.subscription_id } });
      if (sub) {
        sub.status = 'active';
        await this.subRepo.save(sub);
      }
      const schoolRow = await this.schoolRepo.findOne({ where: { id: schoolId } });
      if (schoolRow) {
        schoolRow.status = 'active';
        await this.schoolRepo.save(schoolRow);
        await this.activateSchoolAdmins(schoolRow.id);
      }
      return {
        paid: true,
        invoice: this.serializeInvoice(invoice),
        session_id: null,
        checkout_url: null,
      };
    }

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    const session = await this.thawani.createCheckoutSession({
      clientReferenceId: `plat-inv-${invoice.id}`,
      productName: `FIKR subscription — ${school?.name ?? 'School'}`,
      amountOmr: amount,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: {
        invoice_id: String(invoice.id),
        school_id: String(schoolId),
        kind: 'platform_invoice',
      },
    });
    invoice.thawani_session_id = session.session_id;
    await this.invoiceRepo.save(invoice);
    return {
      paid: false,
      invoice: this.serializeInvoice(invoice),
      session_id: session.session_id,
      checkout_url: session.checkout_url,
    };
  }

  async confirmSchoolThawani(actor: User, schoolId: string, invoiceId?: string) {
    assertSameSchool(actor, schoolId);
    const invoice = invoiceId
      ? await this.invoiceRepo.findOne({ where: { id: invoiceId, school_id: schoolId } })
      : (
          await this.invoiceRepo.find({
            where: { school_id: schoolId },
            order: { created_at: 'DESC' },
            take: 1,
          })
        )[0];
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'paid') {
      const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
      return {
        paid: true,
        school_status: school?.status ?? 'active',
        invoice: this.serializeInvoice(invoice),
      };
    }
    if (!invoice.thawani_session_id) {
      throw new BadRequestException('Checkout session not found');
    }
    const session = await this.thawani.getSession(invoice.thawani_session_id);
    if (session.payment_status !== 'paid') {
      return {
        paid: false,
        payment_status: session.payment_status,
        school_status: (await this.schoolRepo.findOne({ where: { id: schoolId } }))?.status ?? null,
        invoice: this.serializeInvoice(invoice),
      };
    }

    invoice.status = 'paid';
    invoice.paid_at = new Date();
    invoice.paid_amount = String(invoice.total_amount);
    invoice.paid_note = 'Paid via Thawani';
    invoice.thawani_invoice = session.invoice ?? invoice.thawani_invoice;
    await this.invoiceRepo.save(invoice);

    const sub = await this.subRepo.findOne({ where: { id: invoice.subscription_id } });
    if (sub) {
      sub.status = 'active';
      await this.subRepo.save(sub);
    }
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (school) {
      school.status = 'active';
      await this.schoolRepo.save(school);
      await this.activateSchoolAdmins(school.id);
    }

    void this.notifyInvoicePaid(invoice);

    return {
      paid: true,
      payment_status: 'paid',
      school_status: school?.status ?? 'active',
      invoice: this.serializeInvoice(invoice),
    };
  }
}
