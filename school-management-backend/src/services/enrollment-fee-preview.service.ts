import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';
import { InstallmentPlan } from '../entities/installment-plan.entity';
import { SchoolPaymentLevel } from '../entities/school-payment-level.entity';
import { GradeFeeLink } from '../entities/grade-fee-link.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import { FeePackage } from '../entities/fee-package.entity';
import { moneyStr, num, splitRoundedUpToFive } from '../utils/fees-v2.util';

export type PublicEnrollmentPlanRow = {
  id: string;
  name: string;
  description: string | null;
  entries: Array<{
    sequence: number;
    month_number: number | null;
    label: string | null;
    weight: string;
  }>;
};

export type PublicEnrollmentFeePreview = {
  currency: string;
  level: { id: string; code: string; name: string } | null;
  plan: PublicEnrollmentPlanRow | null;
  charges: Array<{
    charge_type_id: string;
    label: string;
    amount: string;
    payment_timing: 'upfront' | 'installment';
  }>;
  inclusions: Array<{ id: string; code: string; label: string }>;
  list_total: string;
  advance_due: string;
  installment_due: string;
  schedule: Array<{
    sequence: number;
    kind: 'advance' | 'installment';
    month_number: number | null;
    label: string | null;
    amount: string;
  }>;
};

@Injectable()
export class EnrollmentFeePreviewService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(InstallmentPlan)
    private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(SchoolPaymentLevel)
    private readonly levelRepo: Repository<SchoolPaymentLevel>,
    @InjectRepository(GradeFeeLink)
    private readonly gradeLinkRepo: Repository<GradeFeeLink>,
    @InjectRepository(LevelPaymentProfile)
    private readonly levelProfileRepo: Repository<LevelPaymentProfile>,
  ) {}

  private async assertSchool(schoolId: string): Promise<School> {
    const id = String(schoolId || '').trim();
    if (!id) throw new BadRequestException('school_id is required');
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school || school.status === 'rejected' || school.status === 'suspended') {
      throw new BadRequestException('Invalid school');
    }
    return school;
  }

  async listPlans(schoolId: string): Promise<PublicEnrollmentPlanRow[]> {
    await this.assertSchool(schoolId);
    const plans = await this.planRepo.find({
      where: { school_id: schoolId, is_active: true },
      relations: ['entries'],
      order: { name: 'ASC' },
    });
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      entries: [...(p.entries ?? [])]
        .sort((a, b) => a.sequence - b.sequence)
        .map((e) => ({
          sequence: e.sequence,
          month_number: e.month_number ?? null,
          label: e.label ?? null,
          weight: String(e.weight ?? '1'),
        })),
    }));
  }

  /** Match enrollment `gradeLevel` (code or name) to an active school payment level. */
  async resolvePaymentLevel(
    schoolId: string,
    gradeLevel: string,
  ): Promise<SchoolPaymentLevel | null> {
    const code = String(gradeLevel || '').trim();
    if (!code) return null;
    const levels = await this.levelRepo.find({
      where: { school_id: schoolId, is_active: true },
      order: { sort_order: 'ASC' },
    });
    const lower = code.toLowerCase();
    return (
      levels.find((l) => l.code.toLowerCase() === lower) ||
      levels.find((l) => l.name.toLowerCase() === lower) ||
      null
    );
  }

  async preview(
    schoolId: string,
    gradeLevel: string,
    installmentPlanId?: string | null,
  ): Promise<PublicEnrollmentFeePreview> {
    await this.assertSchool(schoolId);
    const level = await this.resolvePaymentLevel(schoolId, gradeLevel);

    const charges: PublicEnrollmentFeePreview['charges'] = [];
    const inclusions: PublicEnrollmentFeePreview['inclusions'] = [];
    let currency = 'OMR';

    if (level) {
      const link = await this.gradeLinkRepo.findOne({
        where: { school_id: schoolId, level_id: level.id, is_active: true },
        relations: [
          'lines',
          'lines.chargeType',
          'feePackage',
          'feePackage.chargeTypeLinks',
          'feePackage.chargeTypeLinks.chargeType',
          'feePackage.inclusionTypeLinks',
          'feePackage.inclusionTypeLinks.inclusionType',
        ],
      });
      const profile = await this.levelProfileRepo.findOne({
        where: { school_id: schoolId, level_id: level.id },
        relations: ['chargeLines', 'chargeLines.chargeType'],
      });

      let feePackage = link?.feePackage ?? null;
      if (!feePackage && profile?.fee_package_id) {
        feePackage = await this.levelProfileRepo.manager.findOne(FeePackage, {
          where: { id: profile.fee_package_id, school_id: schoolId },
          relations: ['chargeTypeLinks', 'chargeTypeLinks.chargeType', 'inclusionTypeLinks', 'inclusionTypeLinks.inclusionType'],
        });
      }
      if (feePackage) {
        currency = feePackage.currency || currency;
        const meta = feePackage.chargeTypeLinks ?? [];
        const linkAmount = new Map(
          (link?.lines ?? []).map((line) => [
            line.charge_type_id,
            { amount: num(line.amount), label: line.chargeType?.label ?? null },
          ]),
        );
        const profileAmount = new Map(
          (profile?.chargeLines ?? []).map((line) => [
            line.charge_type_id,
            { amount: num(line.amount), label: line.chargeType?.label ?? null },
          ]),
        );
        for (const ct of meta) {
          const fromProfile = profileAmount.get(ct.charge_type_id);
          const fromLink = linkAmount.get(ct.charge_type_id);
          const picked =
            fromProfile && fromProfile.amount > 0
              ? fromProfile
              : fromLink && fromLink.amount > 0
                ? fromLink
                : null;
          if (!picked) continue;
          charges.push({
            charge_type_id: ct.charge_type_id,
            label: picked.label || ct.chargeType?.label || ct.charge_type_id,
            amount: moneyStr(picked.amount),
            payment_timing: ct.payment_timing === 'upfront' ? 'upfront' : 'installment',
          });
        }
        const seen = new Set<string>();
        for (const link of feePackage.inclusionTypeLinks ?? []) {
          const t = link.inclusionType;
          if (!t?.is_active || seen.has(t.id)) continue;
          seen.add(t.id);
          inclusions.push({ id: t.id, code: t.code, label: t.label });
        }
      }
    }

    const listTotal = charges.reduce((s, c) => s + num(c.amount), 0);
    let upfrontGross = 0;
    let installmentGross = 0;
    for (const c of charges) {
      const amt = num(c.amount);
      if (c.payment_timing === 'upfront') upfrontGross += amt;
      else installmentGross += amt;
    }
    const timingGross = upfrontGross + installmentGross;

    let plan: InstallmentPlan | null = null;
    if (installmentPlanId) {
      plan = await this.planRepo.findOne({
        where: { id: installmentPlanId, school_id: schoolId, is_active: true },
        relations: ['entries'],
      });
      if (!plan) throw new NotFoundException('Installment plan not found');
    }

    let advanceDue = 0;
    if (timingGross > 0) {
      advanceDue = listTotal * (upfrontGross / timingGross);
    }
    if (!plan) {
      advanceDue = listTotal;
    }
    const installmentDue = Math.max(0, listTotal - advanceDue);

    const schedule: PublicEnrollmentFeePreview['schedule'] = [];
    if (listTotal > 0) {
      schedule.push({
        sequence: 0,
        kind: 'advance',
        month_number: null,
        label: 'upfront',
        amount: moneyStr(Math.max(0, advanceDue)),
      });
    }
    if (plan && installmentDue > 0) {
      const entries = [...(plan.entries ?? [])].sort((a, b) => a.sequence - b.sequence);
      if (entries.length) {
        const weights = entries.map((e) => num(e.weight) || 1);
        const amounts = splitRoundedUpToFive(installmentDue, weights);
        for (let i = 0; i < entries.length; i++) {
          const amt = amounts[i] ?? 0;
          if (amt <= 0) continue;
          const entry = entries[i];
          schedule.push({
            sequence: entry.sequence === 0 ? Math.max(1, i + 1) : entry.sequence,
            kind: 'installment',
            month_number: entry.month_number ?? null,
            label: entry.label ?? null,
            amount: moneyStr(amt),
          });
        }
      }
    }

    return {
      currency,
      level: level ? { id: level.id, code: level.code, name: level.name } : null,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            description: plan.description ?? null,
            entries: [...(plan.entries ?? [])]
              .sort((a, b) => a.sequence - b.sequence)
              .map((e) => ({
                sequence: e.sequence,
                month_number: e.month_number ?? null,
                label: e.label ?? null,
                weight: String(e.weight ?? '1'),
              })),
          }
        : null,
      charges,
      inclusions,
      list_total: moneyStr(listTotal),
      advance_due: moneyStr(Math.max(0, advanceDue)),
      installment_due: moneyStr(installmentDue),
      schedule,
    };
  }
}
