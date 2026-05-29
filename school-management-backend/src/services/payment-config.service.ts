import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SchoolPaymentLevel } from '../entities/school-payment-level.entity';
import { PaymentChargeType } from '../entities/payment-charge-type.entity';
import {
  DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE,
  isPaymentChargeBillingOccurrence,
  type PaymentChargeBillingOccurrence,
} from '../constants/payment-charge-billing-occurrence';
import { PaymentDiscountType } from '../entities/payment-discount-type.entity';
import {
  LevelPaymentProfile,
  type LevelPricingModel,
  type YearPaymentMode,
} from '../entities/level-payment-profile.entity';
import { LevelPaymentChargeLine } from '../entities/level-payment-charge-line.entity';
import { LevelPaymentInstallment } from '../entities/level-payment-installment.entity';
import { LevelPaymentProfileDiscount } from '../entities/level-payment-profile-discount.entity';
import { School } from '../entities/school.entity';
import { Grade } from '../entities/grade.entity';
import { Course } from '../entities/course.entity';
import { CoursePaymentProfile, type CoursePricingBasis } from '../entities/course-payment-profile.entity';
import { CoursePaymentChargeLine } from '../entities/course-payment-charge-line.entity';
import { FeePackage } from '../entities/fee-package.entity';

export interface UpsertLevelDto {
  code: string;
  name: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpsertCatalogDto {
  code: string;
  label: string;
  value?: string | null;
  sort_order?: number;
  is_active?: boolean;
  /** Charge types only: per_year | once_ever | other */
  billing_occurrence?: PaymentChargeBillingOccurrence;
}

export type LevelChargeBillingPeriod = 'monthly' | 'semester' | 'yearly';

export interface ChargeLineInput {
  charge_type_id: string;
  amount: number;
  billing_period?: LevelChargeBillingPeriod;
}

export interface InstallmentInput {
  sequence: number;
  month_number?: number | null;
  label?: string | null;
  amount: number;
}

export interface UpsertLevelPaymentProfileDto {
  school_id: number;
  pricing_model: LevelPricingModel;
  /** Required for level (annual) fees */
  year_payment_mode?: YearPaymentMode | null;
  year_total_amount?: number | null;
  currency?: string;
  charge_lines: ChargeLineInput[];
  installments?: InstallmentInput[];
  discount_type_ids?: string[];
}

export interface UpsertCoursePaymentProfileDto {
  school_id: number;
  course_pricing_basis: CoursePricingBasis;
  currency?: string;
  charge_lines: ChargeLineInput[];
}

@Injectable()
export class PaymentConfigService {
  constructor(
    @InjectRepository(SchoolPaymentLevel)
    private readonly levelRepo: Repository<SchoolPaymentLevel>,
    @InjectRepository(PaymentChargeType)
    private readonly chargeTypeRepo: Repository<PaymentChargeType>,
    @InjectRepository(PaymentDiscountType)
    private readonly discountTypeRepo: Repository<PaymentDiscountType>,
    @InjectRepository(LevelPaymentProfile)
    private readonly profileRepo: Repository<LevelPaymentProfile>,
    @InjectRepository(LevelPaymentChargeLine)
    private readonly chargeLineRepo: Repository<LevelPaymentChargeLine>,
    @InjectRepository(LevelPaymentInstallment)
    private readonly installmentRepo: Repository<LevelPaymentInstallment>,
    @InjectRepository(LevelPaymentProfileDiscount)
    private readonly profileDiscountRepo: Repository<LevelPaymentProfileDiscount>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CoursePaymentProfile)
    private readonly coursePaymentProfileRepo: Repository<CoursePaymentProfile>,
  ) {}

  private assertAdmin(user: User): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage payment configuration');
    }
  }

  private assertSchool(user: User, schoolId: number): void {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only manage payment configuration for your school');
    }
  }

  // --- Levels ---
  async listLevels(user: User, schoolId: number): Promise<SchoolPaymentLevel[]> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    await this.syncSchoolPaymentLevelsFromGrades(user, schoolId);
    return this.levelRepo.find({
      where: { school_id: schoolId },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Grade levels come from system configuration (`grades` table).
   * Ensures each school has a matching `school_payment_levels` row (same code) for payment profiles,
   * then returns one row per grade in grade display order.
   */
  private async syncSchoolPaymentLevelsFromGrades(user: User, schoolId: number): Promise<Grade[]> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const grades = await this.gradeRepo.find({
      order: { displayOrder: 'ASC', nameEn: 'ASC' },
    });
    for (const g of grades) {
      const code = g.code?.trim().toUpperCase();
      if (!code) continue;
      let row = await this.levelRepo.findOne({ where: { school_id: schoolId, code } });
      if (!row) {
        row = this.levelRepo.create({
          school_id: schoolId,
          code,
          name: g.nameEn.trim(),
          sort_order: g.displayOrder ?? 0,
          is_active: g.isActive !== false,
        });
        await this.levelRepo.save(row);
      } else {
        row.name = g.nameEn.trim();
        row.sort_order = g.displayOrder ?? 0;
        row.is_active = g.isActive !== false;
        await this.levelRepo.save(row);
      }
    }
    return grades;
  }

  /** One entry per configured grade: payment row + profile status + bilingual names from grades. */
  async listLevelsWithProfileStatus(
    user: User,
    schoolId: number,
  ): Promise<
    Array<
      Pick<SchoolPaymentLevel, 'id' | 'school_id' | 'code' | 'name' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'> & {
        profile_configured: boolean;
        grade_id: string;
        name_en: string;
        name_ar: string;
      }
    >
  > {
    const grades = await this.syncSchoolPaymentLevelsFromGrades(user, schoolId);
    const withCode = grades
      .map((g) => ({ g, code: g.code?.trim().toUpperCase() ?? '' }))
      .filter((x) => x.code.length > 0)
      .sort(
        (a, b) =>
          (a.g.displayOrder ?? 0) - (b.g.displayOrder ?? 0) || a.g.nameEn.localeCompare(b.g.nameEn),
      );
    if (!withCode.length) {
      return [];
    }
    const codes = [...new Set(withCode.map((x) => x.code))];
    const levels = await this.levelRepo.find({
      where: { school_id: schoolId, code: In(codes) },
    });
    const levelByCode = new Map(levels.map((l) => [l.code, l]));
    const levelIds = codes.map((c) => levelByCode.get(c)?.id).filter((id): id is string => Boolean(id));
    if (!levelIds.length) {
      return [];
    }
    const profiles = await this.profileRepo.find({
      where: { school_id: schoolId, level_id: In(levelIds) },
      relations: ['chargeLines'],
    });
    const byLevelId = new Map(profiles.map((p) => [p.level_id, p]));
    const packageIds = [...new Set(profiles.map((p) => p.fee_package_id).filter((id): id is string => !!id))];
    const packageRows =
      packageIds.length > 0
        ? await this.profileRepo.manager.find(FeePackage, { where: { id: In(packageIds) }, select: ['id', 'name'] })
        : [];
    const packageNameById = new Map(packageRows.map((p) => [p.id, p.name]));
    return withCode.flatMap(({ g, code }) => {
      const lv = levelByCode.get(code);
      if (!lv) return [];
      const prof = byLevelId.get(lv.id);
      const feePackageId = prof?.fee_package_id ?? null;
      return [
        {
          id: lv.id,
          school_id: lv.school_id,
          code: lv.code,
          name: lv.name,
          sort_order: lv.sort_order,
          is_active: lv.is_active,
          created_at: lv.created_at,
          updated_at: lv.updated_at,
          grade_id: g.id,
          name_en: g.nameEn,
          name_ar: g.nameAr,
          profile_configured: this.isLevelProfileConfigured(prof),
          fee_package_id: feePackageId,
          fee_package_name: feePackageId ? (packageNameById.get(feePackageId) ?? null) : null,
        },
      ];
    });
  }

  private isLevelProfileConfigured(profile: LevelPaymentProfile | undefined): boolean {
    if (!profile) return false;
    const lines = profile.chargeLines ?? [];
    const hasChargeAmount = lines.some((l) => l.charge_type_id && Number(l.amount) > 0);
    const hasYearTotal =
      profile.year_total_amount != null &&
      !Number.isNaN(Number(profile.year_total_amount)) &&
      Number(profile.year_total_amount) > 0;
    return hasChargeAmount || hasYearTotal;
  }

  private isCoursePaymentProfileConfigured(profile: CoursePaymentProfile | undefined): boolean {
    if (!profile?.course_pricing_basis) return false;
    const lines = profile.chargeLines ?? [];
    return lines.some((l) => l.charge_type_id && Number(l.amount) > 0);
  }

  async createLevel(user: User, schoolId: number, dto: UpsertLevelDto): Promise<SchoolPaymentLevel> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const code = dto.code.trim().toUpperCase();
    if (!code) throw new BadRequestException('Level code is required');
    const row = this.levelRepo.create({
      school_id: schoolId,
      code,
      name: dto.name.trim(),
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
    });
    try {
      return await this.levelRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException(`Level code already exists for this school: ${code}`);
      }
      throw e;
    }
  }

  async updateLevel(user: User, id: string, dto: Partial<UpsertLevelDto>): Promise<SchoolPaymentLevel> {
    this.assertAdmin(user);
    const row = await this.levelRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Level not found');
    this.assertSchool(user, row.school_id);
    if (dto.code != null) row.code = dto.code.trim().toUpperCase();
    if (dto.name != null) row.name = dto.name.trim();
    if (dto.sort_order != null) row.sort_order = dto.sort_order;
    if (dto.is_active != null) row.is_active = dto.is_active;
    try {
      return await this.levelRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('Level code already exists for this school');
      }
      throw e;
    }
  }

  async deleteLevel(user: User, id: string): Promise<void> {
    this.assertAdmin(user);
    const row = await this.levelRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Level not found');
    this.assertSchool(user, row.school_id);
    await this.levelRepo.remove(row);
  }

  private resolveChargeBillingOccurrence(
    value: unknown,
    fallback: PaymentChargeBillingOccurrence = DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE,
  ): PaymentChargeBillingOccurrence {
    if (value == null || value === '') return fallback;
    if (!isPaymentChargeBillingOccurrence(value)) {
      throw new BadRequestException(
        'billing_occurrence must be per_year, once_ever, or other',
      );
    }
    return value;
  }

  // --- Charge types ---
  async listChargeTypes(user: User, schoolId: number): Promise<PaymentChargeType[]> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.chargeTypeRepo.find({
      where: { school_id: schoolId },
      order: { sort_order: 'ASC', label: 'ASC' },
    });
  }

  async createChargeType(user: User, schoolId: number, dto: UpsertCatalogDto): Promise<PaymentChargeType> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const code = dto.code.trim().toUpperCase();
    const row = this.chargeTypeRepo.create({
      school_id: schoolId,
      code,
      label: dto.label.trim(),
      value: dto.value?.trim() ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
      billing_occurrence: this.resolveChargeBillingOccurrence(dto.billing_occurrence),
    });
    try {
      return await this.chargeTypeRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException(`Charge type code already exists: ${code}`);
      }
      throw e;
    }
  }

  async updateChargeType(user: User, id: string, dto: Partial<UpsertCatalogDto>): Promise<PaymentChargeType> {
    this.assertAdmin(user);
    const row = await this.chargeTypeRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Charge type not found');
    this.assertSchool(user, row.school_id);
    if (dto.code != null) row.code = dto.code.trim().toUpperCase();
    if (dto.label != null) row.label = dto.label.trim();
    if (dto.value !== undefined) row.value = dto.value?.trim() ?? null;
    if (dto.sort_order != null) row.sort_order = dto.sort_order;
    if (dto.is_active != null) row.is_active = dto.is_active;
    if (dto.billing_occurrence !== undefined) {
      row.billing_occurrence = this.resolveChargeBillingOccurrence(
        dto.billing_occurrence,
        row.billing_occurrence ?? DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE,
      );
    }
    try {
      return await this.chargeTypeRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('Charge type code already exists for this school');
      }
      throw e;
    }
  }

  async deleteChargeType(user: User, id: string): Promise<void> {
    this.assertAdmin(user);
    const row = await this.chargeTypeRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Charge type not found');
    this.assertSchool(user, row.school_id);
    await this.chargeTypeRepo.remove(row);
  }

  // --- Discount types ---
  async listDiscountTypes(user: User, schoolId: number): Promise<PaymentDiscountType[]> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.discountTypeRepo.find({
      where: { school_id: schoolId },
      order: { sort_order: 'ASC', label: 'ASC' },
    });
  }

  async createDiscountType(user: User, schoolId: number, dto: UpsertCatalogDto): Promise<PaymentDiscountType> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const code = dto.code.trim().toUpperCase();
    const row = this.discountTypeRepo.create({
      school_id: schoolId,
      code,
      label: dto.label.trim(),
      value: dto.value?.trim() ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
    });
    try {
      return await this.discountTypeRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException(`Discount code already exists: ${code}`);
      }
      throw e;
    }
  }

  async updateDiscountType(user: User, id: string, dto: Partial<UpsertCatalogDto>): Promise<PaymentDiscountType> {
    this.assertAdmin(user);
    const row = await this.discountTypeRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Discount type not found');
    this.assertSchool(user, row.school_id);
    if (dto.code != null) row.code = dto.code.trim().toUpperCase();
    if (dto.label != null) row.label = dto.label.trim();
    if (dto.value !== undefined) row.value = dto.value?.trim() ?? null;
    if (dto.sort_order != null) row.sort_order = dto.sort_order;
    if (dto.is_active != null) row.is_active = dto.is_active;
    try {
      return await this.discountTypeRepo.save(row);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException('Discount code already exists for this school');
      }
      throw e;
    }
  }

  async deleteDiscountType(user: User, id: string): Promise<void> {
    this.assertAdmin(user);
    const row = await this.discountTypeRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Discount type not found');
    this.assertSchool(user, row.school_id);
    await this.discountTypeRepo.remove(row);
  }

  // --- Profile ---
  async getProfileForLevel(user: User, levelId: string) {
    this.assertAdmin(user);
    const level = await this.levelRepo.findOne({ where: { id: levelId } });
    if (!level) throw new NotFoundException('Level not found');
    this.assertSchool(user, level.school_id);

    const profile = await this.profileRepo.findOne({
      where: { level_id: levelId },
      relations: ['chargeLines', 'chargeLines.chargeType', 'installments', 'discountLinks', 'discountLinks.discountType'],
    });

    const grade = await this.gradeRepo
      .createQueryBuilder('g')
      .where('UPPER(TRIM(g.code)) = UPPER(TRIM(:code))', { code: level.code })
      .getOne();

    let fee_package: { id: string; name: string } | null = null;
    if (profile?.fee_package_id) {
      const pkgRow = await this.profileRepo.manager.findOne(FeePackage, {
        where: { id: profile.fee_package_id },
        select: ['id', 'name'],
      });
      if (pkgRow) fee_package = { id: pkgRow.id, name: pkgRow.name };
    }

    return {
      level,
      profile,
      fee_package,
      grade: grade
        ? {
            id: grade.id,
            code: grade.code,
            name_en: grade.nameEn,
            name_ar: grade.nameAr,
            is_active: grade.isActive,
          }
        : null,
    };
  }

  async upsertProfileForLevel(user: User, levelId: string, dto: UpsertLevelPaymentProfileDto): Promise<LevelPaymentProfile> {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);

    const level = await this.levelRepo.findOne({ where: { id: levelId, school_id: dto.school_id } });
    if (!level) {
      throw new NotFoundException('Level not found for this school');
    }

    if (dto.pricing_model !== 'per_year') {
      throw new BadRequestException('Level fees are annual only; use course payment profiles for per-course pricing');
    }

    if (!dto.year_payment_mode || !['one_time', 'installments', 'both'].includes(dto.year_payment_mode)) {
      throw new BadRequestException('year_payment_mode is required (one_time, installments, or both)');
    }
    if (dto.year_total_amount == null || Number.isNaN(Number(dto.year_total_amount))) {
      throw new BadRequestException('year_total_amount is required');
    }

    if (dto.year_payment_mode === 'one_time') {
      dto.installments = [];
    }

    if (dto.year_payment_mode === 'installments' || dto.year_payment_mode === 'both') {
      const inst = dto.installments ?? [];
      if (!inst.length) {
        throw new BadRequestException('Installments are required when year payment mode is installments or both');
      }
    }
    const chargeTypeIds = [...new Set(dto.charge_lines.map((l) => l.charge_type_id))];
    if (chargeTypeIds.length) {
      const types = await this.chargeTypeRepo.find({
        where: { id: In(chargeTypeIds), school_id: dto.school_id },
      });
      if (types.length !== chargeTypeIds.length) {
        throw new BadRequestException('One or more charge types are invalid for this school');
      }
    }

    const discountIds = dto.discount_type_ids ?? [];
    if (discountIds.length) {
      const discs = await this.discountTypeRepo.find({
        where: { id: In(discountIds), school_id: dto.school_id },
      });
      if (discs.length !== discountIds.length) {
        throw new BadRequestException('One or more discount types are invalid for this school');
      }
    }

    return this.profileRepo.manager.transaction(async (em) => {
      let profile = await em.findOne(LevelPaymentProfile, { where: { level_id: levelId, school_id: dto.school_id } });

      if (!profile) {
        profile = em.create(LevelPaymentProfile, {
          school_id: dto.school_id,
          level_id: levelId,
          pricing_model: dto.pricing_model,
          year_payment_mode: dto.year_payment_mode ?? null,
          year_total_amount:
            dto.year_total_amount != null ? String(Number(dto.year_total_amount).toFixed(2)) : null,
          currency: (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase(),
        });
        profile = await em.save(profile);
      } else {
        profile.pricing_model = dto.pricing_model;
        profile.year_payment_mode = dto.year_payment_mode ?? null;
        profile.year_total_amount =
          dto.year_total_amount != null ? String(Number(dto.year_total_amount).toFixed(2)) : null;
        profile.currency = (dto.currency ?? profile.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();
        profile = await em.save(profile);
      }

      await em.delete(LevelPaymentChargeLine, { profile_id: profile.id });
      await em.delete(LevelPaymentInstallment, { profile_id: profile.id });
      await em.delete(LevelPaymentProfileDiscount, { profile_id: profile.id });

      for (const line of dto.charge_lines) {
        const period = line.billing_period ?? 'yearly';
        if (!['monthly', 'semester', 'yearly'].includes(period)) {
          throw new BadRequestException('Invalid billing_period on charge line');
        }
        await em.save(
          em.create(LevelPaymentChargeLine, {
            profile_id: profile.id,
            charge_type_id: line.charge_type_id,
            billing_period: period,
            amount: String(Number(line.amount).toFixed(2)),
          }),
        );
      }

      const yearlyTotal = dto.charge_lines
        .filter((l) => (l.billing_period ?? 'yearly') === 'yearly')
        .reduce((s, l) => s + Number(l.amount), 0);
      if (yearlyTotal > 0) {
        profile.year_total_amount = String(yearlyTotal.toFixed(2));
        await em.save(profile);
      }

      const inst = dto.installments ?? [];
      for (const row of inst) {
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

      const full = await em.findOne(LevelPaymentProfile, {
        where: { id: profile.id },
        relations: ['chargeLines', 'chargeLines.chargeType', 'installments', 'discountLinks', 'discountLinks.discountType'],
      });
      return full!;
    });
  }

  async listCoursesPaymentSummary(
    user: User,
    schoolId: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      title: string | null;
      status: string | null;
      course_kind: string | null;
      is_active: boolean;
      profile_configured: boolean;
      course_pricing_basis: CoursePricingBasis | null;
    }>
  > {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const courses = await this.courseRepo.find({
      where: { school_id: schoolId },
      order: { title: 'ASC', name: 'ASC' },
    });
    const profiles = await this.coursePaymentProfileRepo.find({
      where: { school_id: schoolId },
      relations: ['chargeLines'],
    });
    const byCourse = new Map(profiles.map((p) => [p.course_id, p]));
    const packageIds = [...new Set(profiles.map((p) => p.fee_package_id).filter((id): id is string => !!id))];
    const packageRows =
      packageIds.length > 0
        ? await this.coursePaymentProfileRepo.manager.find(FeePackage, {
            where: { id: In(packageIds) },
            select: ['id', 'name'],
          })
        : [];
    const packageNameById = new Map(packageRows.map((p) => [p.id, p.name]));
    return courses.map((c) => {
      const p = byCourse.get(c.id);
      const feePackageId = p?.fee_package_id ?? null;
      return {
        id: c.id,
        name: (c.name ?? c.title ?? '').trim() || '—',
        title: c.title ?? null,
        status: c.status ?? null,
        course_kind: c.course_kind ?? null,
        is_active: c.is_active,
        profile_configured: this.isCoursePaymentProfileConfigured(p),
        course_pricing_basis: p?.course_pricing_basis ?? null,
        fee_package_id: feePackageId,
        fee_package_name: feePackageId ? (packageNameById.get(feePackageId) ?? null) : null,
      };
    });
  }

  async getProfileForCourse(user: User, courseId: string, schoolId: number) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (Number(course.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Course belongs to another school');
    }
    const profile = await this.coursePaymentProfileRepo.findOne({
      where: { course_id: courseId, school_id: schoolId },
      relations: ['chargeLines', 'chargeLines.chargeType'],
    });
    let fee_package: { id: string; name: string } | null = null;
    if (profile?.fee_package_id) {
      const pkgRow = await this.coursePaymentProfileRepo.manager.findOne(FeePackage, {
        where: { id: profile.fee_package_id },
        select: ['id', 'name'],
      });
      if (pkgRow) fee_package = { id: pkgRow.id, name: pkgRow.name };
    }
    return {
      course: {
        id: course.id,
        name: (course.name ?? course.title ?? '').trim() || '—',
        title: course.title ?? null,
        school_id: course.school_id,
        status: course.status,
        course_kind: course.course_kind ?? null,
      },
      profile,
      fee_package,
    };
  }

  async upsertProfileForCourse(
    user: User,
    courseId: string,
    dto: UpsertCoursePaymentProfileDto,
  ): Promise<CoursePaymentProfile> {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);
    if (!['grade', 'phase'].includes(dto.course_pricing_basis)) {
      throw new BadRequestException('course_pricing_basis must be grade or phase');
    }
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (Number(course.school_id) !== Number(dto.school_id)) {
      throw new ForbiddenException('Course belongs to another school');
    }
    const existingManaged = await this.coursePaymentProfileRepo.findOne({
      where: { course_id: courseId, school_id: dto.school_id },
      select: ['id', 'fee_package_id'],
    });
    if (existingManaged?.fee_package_id) {
      throw new BadRequestException(
        'This course fee is managed by a fee package. Edit it under Payment settings → Fee packages.',
      );
    }
    const chargeTypeIds = [...new Set(dto.charge_lines.map((l) => l.charge_type_id))];
    if (chargeTypeIds.length) {
      const types = await this.chargeTypeRepo.find({
        where: { id: In(chargeTypeIds), school_id: dto.school_id },
      });
      if (types.length !== chargeTypeIds.length) {
        throw new BadRequestException('One or more charge types are invalid for this school');
      }
    }
    return this.coursePaymentProfileRepo.manager.transaction(async (em) => {
      let profile = await em.findOne(CoursePaymentProfile, {
        where: { course_id: courseId, school_id: dto.school_id },
      });
      if (!profile) {
        profile = em.create(CoursePaymentProfile, {
          school_id: dto.school_id,
          course_id: courseId,
          course_pricing_basis: dto.course_pricing_basis,
          currency: (dto.currency ?? 'OMR').trim().slice(0, 3).toUpperCase(),
        });
      } else {
        profile.course_pricing_basis = dto.course_pricing_basis;
        profile.currency = (dto.currency ?? profile.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();
      }
      profile = await em.save(profile);
      await em.delete(CoursePaymentChargeLine, { profile_id: profile.id });
      for (const line of dto.charge_lines) {
        await em.save(
          em.create(CoursePaymentChargeLine, {
            profile_id: profile.id,
            charge_type_id: line.charge_type_id,
            amount: String(Number(line.amount).toFixed(2)),
          }),
        );
      }
      const full = await em.findOne(CoursePaymentProfile, {
        where: { id: profile.id },
        relations: ['chargeLines', 'chargeLines.chargeType'],
      });
      return full!;
    });
  }

  async getSchoolPaymentFlags(
    user: User,
    schoolId: number,
  ): Promise<{ allow_admin_adjust_student_total: boolean }> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    return { allow_admin_adjust_student_total: !!school.payment_allow_admin_adjust_student_total };
  }

  async updateSchoolPaymentFlags(
    user: User,
    schoolId: number,
    dto: { allow_admin_adjust_student_total?: boolean },
  ): Promise<{ allow_admin_adjust_student_total: boolean }> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    if (dto.allow_admin_adjust_student_total === undefined) {
      throw new BadRequestException('allow_admin_adjust_student_total is required');
    }
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) {
      throw new NotFoundException('School not found');
    }
    school.payment_allow_admin_adjust_student_total = dto.allow_admin_adjust_student_total;
    await this.schoolRepo.save(school);
    return this.getSchoolPaymentFlags(user, schoolId);
  }
}
