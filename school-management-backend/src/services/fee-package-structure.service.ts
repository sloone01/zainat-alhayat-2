import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FeePackage } from '../entities/fee-package.entity';
import { FeePackageChargeType } from '../entities/fee-package-charge-type.entity';
import { FeePackageDiscountType } from '../entities/fee-package-discount-type.entity';
import { GradeFeeLink } from '../entities/grade-fee-link.entity';
import { BusFeeLink } from '../entities/bus-fee-link.entity';
import { CourseFeeLink } from '../entities/course-fee-link.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import { CoursePaymentProfile } from '../entities/course-payment-profile.entity';
import { UpsertFeePackageStructureDto } from '../dto/fees-v2.dto';

export type FeePackageUsageItem = {
  kind: 'grade' | 'bus' | 'course' | 'level_profile' | 'course_profile';
  id: string;
  label: string;
};

export type FeePackageUsage = {
  in_use: boolean;
  usages: FeePackageUsageItem[];
};

@Injectable()
export class FeePackageStructureService {
  constructor(
    @InjectRepository(FeePackage)
    private readonly packageRepo: Repository<FeePackage>,
    @InjectRepository(FeePackageChargeType)
    private readonly chargeLinkRepo: Repository<FeePackageChargeType>,
    @InjectRepository(FeePackageDiscountType)
    private readonly discountLinkRepo: Repository<FeePackageDiscountType>,
    @InjectRepository(GradeFeeLink)
    private readonly gradeLinkRepo: Repository<GradeFeeLink>,
    @InjectRepository(BusFeeLink)
    private readonly busLinkRepo: Repository<BusFeeLink>,
    @InjectRepository(CourseFeeLink)
    private readonly courseLinkRepo: Repository<CourseFeeLink>,
    @InjectRepository(LevelPaymentProfile)
    private readonly levelProfileRepo: Repository<LevelPaymentProfile>,
    @InjectRepository(CoursePaymentProfile)
    private readonly courseProfileRepo: Repository<CoursePaymentProfile>,
  ) {}

  private assertAdmin(user: User) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Wrong school');
    }
  }

  private serialize(pkg: FeePackage) {
    return {
      id: pkg.id,
      school_id: pkg.school_id,
      name: pkg.name,
      currency: pkg.currency,
      is_active: pkg.is_active,
      charge_lines: (pkg.chargeTypeLinks ?? []).map((l) => ({
        charge_type_id: l.charge_type_id,
        charge_type: l.chargeType
          ? { id: l.chargeType.id, code: l.chargeType.code, label: l.chargeType.label }
          : null,
        payment_timing: l.payment_timing ?? 'installment',
        billing_frequency: l.billing_frequency ?? 'per_year',
      })),
      discount_type_ids: (pkg.discountTypeLinks ?? []).map((d) => d.discount_type_id),
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
    };
  }

  async list(user: User, schoolId: number) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const rows = await this.packageRepo.find({
      where: { school_id: schoolId },
      order: { name: 'ASC' },
    });
    return rows.map((p) => ({
      id: p.id,
      school_id: p.school_id,
      name: p.name,
      currency: p.currency,
      is_active: p.is_active,
      updated_at: p.updated_at,
    }));
  }

  async getOne(user: User, id: string) {
    this.assertAdmin(user);
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['chargeTypeLinks', 'chargeTypeLinks.chargeType', 'discountTypeLinks'],
    });
    if (!pkg) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, pkg.school_id);
    return this.serialize(pkg);
  }

  async upsert(user: User, dto: UpsertFeePackageStructureDto, id?: string) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);
    if (!dto.charge_lines.length) {
      throw new BadRequestException('At least one charge line is required');
    }

    let pkg: FeePackage;
    if (id) {
      const existing = await this.packageRepo.findOne({ where: { id } });
      if (!existing) throw new NotFoundException('Fee package not found');
      this.assertSchool(user, existing.school_id);
      existing.name = dto.name.trim();
      existing.currency = (dto.currency ?? existing.currency ?? 'OMR').slice(0, 3).toUpperCase();
      existing.is_active = dto.is_active !== false;
      pkg = await this.packageRepo.save(existing);
      await this.chargeLinkRepo.delete({ package_id: pkg.id });
      await this.discountLinkRepo.delete({ package_id: pkg.id });
    } else {
      pkg = await this.packageRepo.save(
        this.packageRepo.create({
          school_id: dto.school_id,
          name: dto.name.trim(),
          currency: (dto.currency ?? 'OMR').slice(0, 3).toUpperCase(),
          is_active: dto.is_active !== false,
          year_payment_mode: null,
          course_pricing_basis: null,
        }),
      );
    }

    const chargeLinks = dto.charge_lines.map((l) =>
      this.chargeLinkRepo.create({
        package_id: pkg.id,
        charge_type_id: l.charge_type_id,
        payment_timing: l.payment_timing,
        billing_frequency: l.billing_frequency,
      }),
    );
    await this.chargeLinkRepo.save(chargeLinks);

    const discountIds = dto.discount_type_ids ?? [];
    if (discountIds.length) {
      await this.discountLinkRepo.save(
        discountIds.map((discount_type_id) =>
          this.discountLinkRepo.create({ package_id: pkg.id, discount_type_id }),
        ),
      );
    }

    return this.getOne(user, pkg.id);
  }

  async getUsage(user: User, id: string): Promise<FeePackageUsage> {
    this.assertAdmin(user);
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, pkg.school_id);

    const usages: FeePackageUsageItem[] = [];

    const gradeLinks = await this.gradeLinkRepo.find({
      where: { fee_package_id: id },
      relations: ['level'],
    });
    for (const link of gradeLinks) {
      usages.push({
        kind: 'grade',
        id: link.level_id,
        label: link.level?.name ?? link.level_id,
      });
    }

    const busLinks = await this.busLinkRepo.find({
      where: { fee_package_id: id },
      relations: ['bus'],
    });
    for (const link of busLinks) {
      usages.push({
        kind: 'bus',
        id: link.bus_id,
        label: link.bus?.title ?? link.bus_id,
      });
    }

    const courseLinks = await this.courseLinkRepo.find({
      where: { fee_package_id: id },
      relations: ['course'],
    });
    for (const link of courseLinks) {
      const course = link.course;
      const label =
        (course?.name ?? (course as { title?: string } | undefined)?.title ?? '').trim() ||
        link.course_id;
      usages.push({
        kind: 'course',
        id: link.course_id,
        label,
      });
    }

    const levelProfiles = await this.levelProfileRepo.find({
      where: { fee_package_id: id },
      relations: ['level'],
    });
    for (const profile of levelProfiles) {
      usages.push({
        kind: 'level_profile',
        id: profile.id,
        label: profile.level?.name ?? profile.level_id ?? profile.id,
      });
    }

    const courseProfiles = await this.courseProfileRepo.find({
      where: { fee_package_id: id },
      relations: ['course'],
    });
    for (const profile of courseProfiles) {
      const course = profile.course;
      const label =
        (course?.name ?? (course as { title?: string } | undefined)?.title ?? '').trim() ||
        profile.course_id ||
        profile.id;
      usages.push({
        kind: 'course_profile',
        id: profile.id,
        label,
      });
    }

    return { in_use: usages.length > 0, usages };
  }

  async remove(user: User, id: string) {
    this.assertAdmin(user);
    const pkg = await this.packageRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Fee package not found');
    this.assertSchool(user, pkg.school_id);

    const usage = await this.getUsage(user, id);
    if (usage.in_use) {
      throw new BadRequestException({
        code: 'FEE_PACKAGE_IN_USE',
        usages: usage.usages,
      });
    }

    await this.packageRepo.remove(pkg);
  }
}
