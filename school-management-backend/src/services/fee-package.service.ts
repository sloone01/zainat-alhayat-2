import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FeePackage } from '../entities/fee-package.entity';
import { FeePackageChargeType } from '../entities/fee-package-charge-type.entity';
import { FeePackageDiscountType } from '../entities/fee-package-discount-type.entity';
import { FeePackageInstallment } from '../entities/fee-package-installment.entity';
import { FeePackageLevelAmount } from '../entities/fee-package-level-amount.entity';
import { FeePackageCourseAmount } from '../entities/fee-package-course-amount.entity';
import { FeePackageLevelPeriodSetting } from '../entities/fee-package-level-period-setting.entity';
import { SchoolPaymentLevel } from '../entities/school-payment-level.entity';
import { PaymentChargeType } from '../entities/payment-charge-type.entity';
import { PaymentDiscountType } from '../entities/payment-discount-type.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import {
  LevelPaymentChargeLine,
  type LevelChargeBillingPeriod,
} from '../entities/level-payment-charge-line.entity';
import { LevelPaymentInstallment } from '../entities/level-payment-installment.entity';
import { LevelPaymentProfileDiscount } from '../entities/level-payment-profile-discount.entity';
import { Course } from '../entities/course.entity';
import { CoursePaymentProfile } from '../entities/course-payment-profile.entity';
import { CoursePaymentChargeLine } from '../entities/course-payment-charge-line.entity';
import { UpsertFeePackageDto } from '../dto/fee-package.dto';
import type { CoursePricingBasis } from '../entities/course-payment-profile.entity';
import { deriveInstallmentsFromPeriodSetting } from '../utils/fee-package-installment.util';

@Injectable()
export class FeePackageService {
  constructor(
    @InjectRepository(FeePackage)
    private readonly packageRepo: Repository<FeePackage>,
    @InjectRepository(SchoolPaymentLevel)
    private readonly levelRepo: Repository<SchoolPaymentLevel>,
    @InjectRepository(PaymentChargeType)
    private readonly chargeTypeRepo: Repository<PaymentChargeType>,
    @InjectRepository(PaymentDiscountType)
    private readonly discountTypeRepo: Repository<PaymentDiscountType>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(LevelPaymentProfile)
    private readonly levelProfileRepo: Repository<LevelPaymentProfile>,
    @InjectRepository(CoursePaymentProfile)
    private readonly courseProfileRepo: Repository<CoursePaymentProfile>,
  ) {}

  private assertAdmin(user: User): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage fee packages');
    }
  }

  private assertSchool(user: User, schoolId: number): void {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only manage fee packages for your school');
    }
  }

  private packageRelations = [
    'chargeTypeLinks',
    'chargeTypeLinks.chargeType',
    'discountTypeLinks',
    'discountTypeLinks.discountType',
    'installments',
    'levelAmounts',
    'levelAmounts.level',
    'levelAmounts.chargeType',
    'courseAmounts',
    'courseAmounts.course',
    'courseAmounts.chargeType',
    'levelPeriodSettings',
  ] as const;

  async list(user: User, schoolId: number) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const rows = await this.packageRepo.find({
      where: { school_id: schoolId },
      order: { name: 'ASC' },
      relations: ['levelAmounts', 'courseAmounts'],
    });
    return rows.map((p) => ({
      id: p.id,
      school_id: p.school_id,
      name: p.name,
      currency: p.currency,
      year_payment_mode: p.year_payment_mode,
      course_pricing_basis: p.course_pricing_basis,
      is_active: p.is_active,
      created_at: p.created_at,
      updated_at: p.updated_at,
      level_count: new Set((p.levelAmounts ?? []).map((a) => a.level_id)).size,
      course_count: new Set((p.courseAmounts ?? []).map((a) => a.course_id)).size,
    }));
  }

  async getOne(user: User, id: string) {
    this.assertAdmin(user);
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: [...this.packageRelations],
    });
    if (!pkg) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, pkg.school_id);
    return this.serializePackage(pkg);
  }

  private serializePackage(pkg: FeePackage) {
    const chargeTypeIds = (pkg.chargeTypeLinks ?? []).map((l) => l.charge_type_id);
    const discountTypeIds = (pkg.discountTypeLinks ?? []).map((l) => l.discount_type_id);
    return {
      id: pkg.id,
      school_id: pkg.school_id,
      name: pkg.name,
      currency: pkg.currency,
      year_payment_mode: pkg.year_payment_mode,
      course_pricing_basis: pkg.course_pricing_basis,
      is_active: pkg.is_active,
      charge_type_ids: chargeTypeIds,
      discount_type_ids: discountTypeIds,
      installments: (pkg.installments ?? [])
        .sort((a, b) => a.sequence - b.sequence)
        .map((i) => ({
          sequence: i.sequence,
          month_number: i.month_number,
          label: i.label,
          amount: Number(i.amount),
        })),
      level_amounts: (pkg.levelAmounts ?? []).map((a) => ({
        level_id: a.level_id,
        charge_type_id: a.charge_type_id,
        billing_period: a.billing_period ?? 'yearly',
        amount: Number(a.amount),
        level: a.level
          ? { id: a.level.id, code: a.level.code, name: a.level.name }
          : undefined,
      })),
      course_amounts: (pkg.courseAmounts ?? []).map((a) => ({
        course_id: a.course_id,
        charge_type_id: a.charge_type_id,
        amount: Number(a.amount),
        course: a.course
          ? {
              id: a.course.id,
              name: (a.course.name ?? a.course.title ?? '').trim() || '—',
            }
          : undefined,
      })),
      level_period_settings: (pkg.levelPeriodSettings ?? []).map((s) => ({
        level_id: s.level_id,
        billing_period: s.billing_period ?? 'yearly',
        downpayment_amount: Number(s.downpayment_amount),
        installment_schedule_months: Array.isArray(s.installment_schedule_months)
          ? s.installment_schedule_months
          : null,
      })),
    };
  }

  async create(user: User, dto: UpsertFeePackageDto) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);
    return this.savePackage(user, null, dto);
  }

  async update(user: User, id: string, dto: UpsertFeePackageDto) {
    this.assertAdmin(user);
    const existing = await this.packageRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, existing.school_id);
    if (Number(dto.school_id) !== Number(existing.school_id)) {
      throw new BadRequestException('school_id cannot be changed');
    }
    return this.savePackage(user, id, dto);
  }

  async delete(user: User, id: string): Promise<void> {
    this.assertAdmin(user);
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, pkg.school_id);

    await this.packageRepo.manager.transaction(async (em) => {
      await em.update(LevelPaymentProfile, { fee_package_id: id }, { fee_package_id: null });
      await em.update(CoursePaymentProfile, { fee_package_id: id }, { fee_package_id: null });
      await em.delete(FeePackage, { id });
    });
  }

  private async savePackage(user: User, packageId: string | null, dto: UpsertFeePackageDto) {
    this.validateDto(dto);

    const chargeTypeIds = [...new Set(dto.charge_type_ids)];
    const discountIds = [...new Set(dto.discount_type_ids ?? [])];
    const levelIds = [...new Set(dto.level_amounts.map((a) => a.level_id))];
    const courseIds = [...new Set(dto.course_amounts.map((a) => a.course_id))];

    if (chargeTypeIds.length) {
      const found = await this.chargeTypeRepo.count({
        where: { id: In(chargeTypeIds), school_id: dto.school_id },
      });
      if (found !== chargeTypeIds.length) {
        throw new BadRequestException('Invalid charge type for this school');
      }
    }

    if (discountIds.length) {
      const found = await this.discountTypeRepo.count({
        where: { id: In(discountIds), school_id: dto.school_id },
      });
      if (found !== discountIds.length) {
        throw new BadRequestException('Invalid discount type for this school');
      }
    }

    for (const la of dto.level_amounts) {
      if (!chargeTypeIds.includes(la.charge_type_id)) {
        throw new BadRequestException('Level amount references a charge type not in this package');
      }
    }
    const levelIdSetFromAmounts = new Set(dto.level_amounts.map((a) => a.level_id));
    for (const ps of dto.level_period_settings ?? []) {
      if (!levelIdSetFromAmounts.has(ps.level_id)) {
        throw new BadRequestException('Period setting references a level not in this package');
      }
      if (!['monthly', 'semester', 'yearly'].includes(ps.billing_period)) {
        throw new BadRequestException('Invalid billing_period on level period setting');
      }
    }
    for (const ca of dto.course_amounts) {
      if (!chargeTypeIds.includes(ca.charge_type_id)) {
        throw new BadRequestException('Course amount references a charge type not in this package');
      }
    }

    const yearMode = dto.year_payment_mode ?? 'one_time';
    if (levelIds.length && !['one_time', 'installments', 'both'].includes(yearMode)) {
      throw new BadRequestException('year_payment_mode is required when linking grade levels');
    }

    const courseBasis: CoursePricingBasis =
      dto.course_pricing_basis && ['grade', 'phase'].includes(dto.course_pricing_basis)
        ? dto.course_pricing_basis
        : 'grade';

    return this.packageRepo.manager.transaction(async (em) => {
      let pkg: FeePackage;
      if (packageId) {
        const found = await em.findOne(FeePackage, { where: { id: packageId } });
        if (!found) throw new NotFoundException('Fee package not found');
        found.name = dto.name.trim();
        found.currency = (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();
        found.year_payment_mode = levelIds.length ? yearMode : null;
        found.course_pricing_basis = courseIds.length ? courseBasis : null;
        found.is_active = dto.is_active ?? true;
        pkg = await em.save(found);
      } else {
        pkg = await em.save(
          em.create(FeePackage, {
            school_id: dto.school_id,
            name: dto.name.trim(),
            currency: (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase(),
            year_payment_mode: levelIds.length ? yearMode : null,
            course_pricing_basis: courseIds.length ? courseBasis : null,
            is_active: dto.is_active ?? true,
          }),
        );
      }

      const pid = pkg.id;

      await this.clearLevelFromOtherPackages(em, pid, levelIds);
      await this.clearCourseFromOtherPackages(em, pid, courseIds);

      await em.delete(FeePackageChargeType, { package_id: pid });
      await em.delete(FeePackageDiscountType, { package_id: pid });
      await em.delete(FeePackageInstallment, { package_id: pid });
      await em.delete(FeePackageLevelAmount, { package_id: pid });
      await em.delete(FeePackageLevelPeriodSetting, { package_id: pid });
      await em.delete(FeePackageCourseAmount, { package_id: pid });

      for (const cid of chargeTypeIds) {
        await em.save(em.create(FeePackageChargeType, { package_id: pid, charge_type_id: cid }));
      }
      for (const did of discountIds) {
        await em.save(em.create(FeePackageDiscountType, { package_id: pid, discount_type_id: did }));
      }

      const installments = yearMode === 'installments' || yearMode === 'both' ? (dto.installments ?? []) : [];
      for (const row of installments) {
        await em.save(
          em.create(FeePackageInstallment, {
            package_id: pid,
            sequence: row.sequence,
            month_number: row.month_number ?? null,
            label: row.label?.trim() ?? null,
            amount: String(Number(row.amount).toFixed(2)),
          }),
        );
      }

      for (const la of dto.level_amounts) {
        if (Number(la.amount) <= 0) continue;
        const period = la.billing_period ?? 'yearly';
        if (!['monthly', 'semester', 'yearly'].includes(period)) {
          throw new BadRequestException('Invalid billing_period on level amount');
        }
        await em.save(
          em.create(FeePackageLevelAmount, {
            package_id: pid,
            level_id: la.level_id,
            charge_type_id: la.charge_type_id,
            billing_period: period,
            amount: String(Number(la.amount).toFixed(2)),
          }),
        );
      }

      for (const ps of dto.level_period_settings ?? []) {
        const dp = Number(ps.downpayment_amount);
        const months = ps.installment_schedule_months?.filter(
          (m) => Number.isFinite(m) && m >= 1 && m <= 12,
        );
        if (dp <= 0 && (!months || !months.length)) continue;
        await em.save(
          em.create(FeePackageLevelPeriodSetting, {
            package_id: pid,
            level_id: ps.level_id,
            billing_period: ps.billing_period,
            downpayment_amount: String(Math.max(0, dp).toFixed(2)),
            installment_schedule_months: months?.length ? months : null,
          }),
        );
      }

      for (const ca of dto.course_amounts) {
        if (Number(ca.amount) <= 0) continue;
        await em.save(
          em.create(FeePackageCourseAmount, {
            package_id: pid,
            course_id: ca.course_id,
            charge_type_id: ca.charge_type_id,
            amount: String(Number(ca.amount).toFixed(2)),
          }),
        );
      }

      await this.projectToLevelProfiles(em, pkg, dto, levelIds, chargeTypeIds, discountIds, installments);
      await this.projectToCourseProfiles(em, pkg, dto, courseIds, chargeTypeIds, courseBasis);

      const full = await em.findOne(FeePackage, {
        where: { id: pid },
        relations: [...this.packageRelations],
      });
      return this.serializePackage(full!);
    });
  }

  private validateDto(dto: UpsertFeePackageDto) {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Package name is required');
    }
    if (!dto.charge_type_ids?.length) {
      throw new BadRequestException('At least one charge type is required');
    }
    if (dto.level_amounts?.length && !dto.year_payment_mode) {
      dto.year_payment_mode = 'one_time';
    }
  }

  private async clearLevelFromOtherPackages(em: typeof this.packageRepo.manager, packageId: string, levelIds: string[]) {
    if (!levelIds.length) return;
    await em
      .createQueryBuilder()
      .delete()
      .from(FeePackageLevelAmount)
      .where('level_id IN (:...levelIds)', { levelIds })
      .andWhere('package_id != :packageId', { packageId })
      .execute();
    await em.update(
      LevelPaymentProfile,
      { level_id: In(levelIds), fee_package_id: Not(packageId) },
      { fee_package_id: null },
    );
  }

  private sumLevelPeriodTotal(
    levelId: string,
    period: 'yearly' | 'semester',
    levelAmounts: UpsertFeePackageDto['level_amounts'],
  ): number {
    let sum = 0;
    for (const la of levelAmounts) {
      if (la.level_id !== levelId) continue;
      if ((la.billing_period ?? 'yearly') !== period) continue;
      const amt = Number(la.amount);
      if (amt > 0) sum += amt;
    }
    return sum;
  }

  private resolveLevelInstallmentRows(
    levelId: string,
    packageInstallments: UpsertFeePackageDto['installments'],
    levelPeriodSettings: UpsertFeePackageDto['level_period_settings'],
    levelAmounts: UpsertFeePackageDto['level_amounts'],
    yearTotal: number,
  ): Array<{
    sequence: number;
    month_number?: number | null;
    label?: string | null;
    amount: number;
  }> {
    const global =
      packageInstallments?.filter((r) => r.sequence >= 1 && Number(r.amount) > 0) ?? [];
    if (global.length) {
      return global.map((r) => ({
        sequence: r.sequence,
        month_number: r.month_number ?? null,
        label: r.label?.trim() ?? null,
        amount: Number(r.amount),
      }));
    }

    const periodSetting =
      (levelPeriodSettings ?? []).find(
        (s) => s.level_id === levelId && (s.billing_period ?? 'yearly') === 'yearly',
      ) ??
      (levelPeriodSettings ?? []).find(
        (s) => s.level_id === levelId && s.billing_period === 'semester',
      );
    if (!periodSetting) return [];

    const period = (periodSetting.billing_period ?? 'yearly') as 'yearly' | 'semester';
    const periodTotal = this.sumLevelPeriodTotal(levelId, period, levelAmounts);
    const total = periodTotal > 0 ? periodTotal : yearTotal;

    const derived = deriveInstallmentsFromPeriodSetting(
      total,
      Number(periodSetting.downpayment_amount ?? 0),
      periodSetting.installment_schedule_months,
      { downpaymentLabel: 'Advance payment' },
    );
    return derived.map((r) => ({
      sequence: r.sequence,
      month_number: r.month_number,
      label: r.label,
      amount: r.amount,
    }));
  }

  private async clearCourseFromOtherPackages(em: typeof this.packageRepo.manager, packageId: string, courseIds: string[]) {
    if (!courseIds.length) return;
    await em
      .createQueryBuilder()
      .delete()
      .from(FeePackageCourseAmount)
      .where('course_id IN (:...courseIds)', { courseIds })
      .andWhere('package_id != :packageId', { packageId })
      .execute();
    await em.update(
      CoursePaymentProfile,
      { course_id: In(courseIds), fee_package_id: Not(packageId) },
      { fee_package_id: null },
    );
  }

  private async projectToLevelProfiles(
    em: typeof this.packageRepo.manager,
    pkg: FeePackage,
    dto: UpsertFeePackageDto,
    levelIds: string[],
    chargeTypeIds: string[],
    discountIds: string[],
    installments: UpsertFeePackageDto['installments'],
  ) {
    const previouslyLinked = await em.find(LevelPaymentProfile, {
      where: { fee_package_id: pkg.id },
      select: ['id', 'level_id'],
    });
    const prevLevelIds = new Set(previouslyLinked.map((p) => p.level_id));
    const newLevelIdSet = new Set(levelIds);

    for (const prev of previouslyLinked) {
      if (!newLevelIdSet.has(prev.level_id)) {
        await em.update(LevelPaymentProfile, { id: prev.id }, { fee_package_id: null });
      }
    }

    if (!levelIds.length) return;

    const levels = await em.find(SchoolPaymentLevel, {
      where: { id: In(levelIds), school_id: dto.school_id },
    });
    if (levels.length !== levelIds.length) {
      throw new BadRequestException('One or more levels are invalid for this school');
    }

    const amountsByLevel = new Map<string, Map<string, Map<string, number>>>();
    for (const la of dto.level_amounts) {
      if (Number(la.amount) <= 0) continue;
      const period = la.billing_period ?? 'yearly';
      if (!amountsByLevel.has(la.level_id)) amountsByLevel.set(la.level_id, new Map());
      const byCharge = amountsByLevel.get(la.level_id)!;
      if (!byCharge.has(la.charge_type_id)) byCharge.set(la.charge_type_id, new Map());
      byCharge.get(la.charge_type_id)!.set(period, Number(la.amount));
    }

    const yearMode = dto.year_payment_mode ?? 'one_time';
    const currency = (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();

    const billingPeriods: LevelChargeBillingPeriod[] = ['monthly', 'semester', 'yearly'];

    for (const levelId of levelIds) {
      const chargeMap = amountsByLevel.get(levelId);
      const charge_lines: {
        charge_type_id: string;
        billing_period: LevelChargeBillingPeriod;
        amount: number;
      }[] = [];

      for (const cid of chargeTypeIds) {
        const periodMap = chargeMap?.get(cid);
        if (!periodMap) continue;
        for (const billing_period of billingPeriods) {
          const amount = periodMap.get(billing_period);
          if (amount != null && amount > 0) {
            charge_lines.push({ charge_type_id: cid, billing_period, amount });
          }
        }
      }

      if (!charge_lines.length) {
        const existing = await em.findOne(LevelPaymentProfile, {
          where: { level_id: levelId, school_id: dto.school_id },
        });
        if (existing?.fee_package_id === pkg.id) {
          await em.update(LevelPaymentProfile, { id: existing.id }, { fee_package_id: null });
        }
        continue;
      }

      const yearTotal = charge_lines
        .filter((l) => l.billing_period === 'yearly')
        .reduce((s, l) => s + l.amount, 0);

      let profile = await em.findOne(LevelPaymentProfile, {
        where: { level_id: levelId, school_id: dto.school_id },
      });

      if (!profile) {
        profile = em.create(LevelPaymentProfile, {
          school_id: dto.school_id,
          level_id: levelId,
          pricing_model: 'per_year',
          year_payment_mode: yearMode,
          year_total_amount: String(yearTotal.toFixed(2)),
          currency,
          fee_package_id: pkg.id,
        });
      } else {
        profile.pricing_model = 'per_year';
        profile.year_payment_mode = yearMode;
        profile.year_total_amount = String(yearTotal.toFixed(2));
        profile.currency = currency;
        profile.fee_package_id = pkg.id;
      }
      profile = await em.save(profile);

      await em.delete(LevelPaymentChargeLine, { profile_id: profile.id });
      await em.delete(LevelPaymentInstallment, { profile_id: profile.id });
      await em.delete(LevelPaymentProfileDiscount, { profile_id: profile.id });

      for (const line of charge_lines) {
        await em.save(
          em.create(LevelPaymentChargeLine, {
            profile_id: profile.id,
            charge_type_id: line.charge_type_id,
            billing_period: line.billing_period,
            amount: String(line.amount.toFixed(2)),
          }),
        );
      }

      const instRows =
        yearMode === 'installments' || yearMode === 'both'
          ? this.resolveLevelInstallmentRows(
              levelId,
              installments,
              dto.level_period_settings,
              dto.level_amounts,
              yearTotal,
            )
          : [];
      for (const row of instRows) {
        await em.save(
          em.create(LevelPaymentInstallment, {
            profile_id: profile.id,
            sequence: row.sequence,
            month_number: row.month_number ?? null,
            label: row.label?.trim() ?? null,
            amount: String(Number(row.amount).toFixed(2)),
          }),
        );
      }

      for (const did of discountIds) {
        await em.save(
          em.create(LevelPaymentProfileDiscount, {
            profile_id: profile.id,
            discount_type_id: did,
          }),
        );
      }
    }
  }

  private async projectToCourseProfiles(
    em: typeof this.packageRepo.manager,
    pkg: FeePackage,
    dto: UpsertFeePackageDto,
    courseIds: string[],
    chargeTypeIds: string[],
    courseBasis: CoursePricingBasis,
  ) {
    const previouslyLinked = await em.find(CoursePaymentProfile, {
      where: { fee_package_id: pkg.id },
      select: ['id', 'course_id'],
    });
    const newCourseIdSet = new Set(courseIds);

    for (const prev of previouslyLinked) {
      if (!newCourseIdSet.has(prev.course_id)) {
        await em.update(CoursePaymentProfile, { id: prev.id }, { fee_package_id: null });
      }
    }

    if (!courseIds.length) return;

    const courses = await em.find(Course, {
      where: { id: In(courseIds), school_id: dto.school_id },
    });
    if (courses.length !== courseIds.length) {
      throw new BadRequestException('One or more courses are invalid for this school');
    }

    const amountsByCourse = new Map<string, Map<string, number>>();
    for (const ca of dto.course_amounts) {
      if (Number(ca.amount) <= 0) continue;
      if (!amountsByCourse.has(ca.course_id)) amountsByCourse.set(ca.course_id, new Map());
      amountsByCourse.get(ca.course_id)!.set(ca.charge_type_id, Number(ca.amount));
    }

    const currency = (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();

    for (const courseId of courseIds) {
      const chargeMap = amountsByCourse.get(courseId);
      const charge_lines = chargeTypeIds
        .map((cid) => ({
          charge_type_id: cid,
          amount: chargeMap?.get(cid) ?? 0,
        }))
        .filter((l) => l.amount > 0);

      if (!charge_lines.length) {
        const existing = await em.findOne(CoursePaymentProfile, {
          where: { course_id: courseId, school_id: dto.school_id },
        });
        if (existing?.fee_package_id === pkg.id) {
          await em.update(CoursePaymentProfile, { id: existing.id }, { fee_package_id: null });
        }
        continue;
      }

      let profile = await em.findOne(CoursePaymentProfile, {
        where: { course_id: courseId, school_id: dto.school_id },
      });

      if (!profile) {
        profile = em.create(CoursePaymentProfile, {
          school_id: dto.school_id,
          course_id: courseId,
          course_pricing_basis: courseBasis,
          currency,
          fee_package_id: pkg.id,
        });
      } else {
        profile.course_pricing_basis = courseBasis;
        profile.currency = currency;
        profile.fee_package_id = pkg.id;
      }
      profile = await em.save(profile);

      await em.delete(CoursePaymentChargeLine, { profile_id: profile.id });
      for (const line of charge_lines) {
        await em.save(
          em.create(CoursePaymentChargeLine, {
            profile_id: profile.id,
            charge_type_id: line.charge_type_id,
            amount: String(line.amount.toFixed(2)),
          }),
        );
      }
    }
  }

  async getPackageSummaryForLevel(user: User, levelId: string): Promise<{ id: string; name: string } | null> {
    const profile = await this.levelProfileRepo.findOne({
      where: { level_id: levelId },
      select: ['fee_package_id'],
    });
    if (!profile?.fee_package_id) return null;
    const pkg = await this.packageRepo.findOne({
      where: { id: profile.fee_package_id },
      select: ['id', 'name', 'school_id'],
    });
    if (!pkg) return null;
    this.assertSchool(user, pkg.school_id);
    return { id: pkg.id, name: pkg.name };
  }

  async getPackageSummaryForCourse(
    user: User,
    courseId: string,
    schoolId: number,
  ): Promise<{ id: string; name: string } | null> {
    const profile = await this.courseProfileRepo.findOne({
      where: { course_id: courseId, school_id: schoolId },
      select: ['fee_package_id'],
    });
    if (!profile?.fee_package_id) return null;
    const pkg = await this.packageRepo.findOne({
      where: { id: profile.fee_package_id },
      select: ['id', 'name'],
    });
    return pkg ? { id: pkg.id, name: pkg.name } : null;
  }
}
