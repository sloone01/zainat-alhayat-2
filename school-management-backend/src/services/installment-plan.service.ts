import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InstallmentPlan } from '../entities/installment-plan.entity';
import { InstallmentPlanEntry } from '../entities/installment-plan-entry.entity';
import { StudentChargeSheet } from '../entities/student-charge-sheet.entity';
import { UpsertInstallmentPlanDto } from '../dto/fees-v2.dto';

export type InstallmentPlanUsageKind = 'student_charge_sheet';

export interface InstallmentPlanUsageItem {
  kind: InstallmentPlanUsageKind;
  id: string;
  label: string;
}

export interface InstallmentPlanUsage {
  in_use: boolean;
  usages: InstallmentPlanUsageItem[];
}

@Injectable()
export class InstallmentPlanService {
  constructor(
    @InjectRepository(InstallmentPlan)
    private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(InstallmentPlanEntry)
    private readonly entryRepo: Repository<InstallmentPlanEntry>,
    @InjectRepository(StudentChargeSheet)
    private readonly chargeSheetRepo: Repository<StudentChargeSheet>,
  ) {}

  private assertAdmin(user: User) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Wrong school');
    }
  }

  async list(user: User, schoolId: number) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.planRepo.find({
      where: { school_id: schoolId },
      relations: ['entries'],
      order: { name: 'ASC' },
    });
  }

  async getOne(user: User, id: string) {
    this.assertAdmin(user);
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['entries'],
    });
    if (!plan) throw new NotFoundException('Installment plan not found');
    this.assertSchool(user, plan.school_id);
    plan.entries.sort((a, b) => a.sequence - b.sequence);
    return plan;
  }

  async upsert(user: User, dto: UpsertInstallmentPlanDto, id?: string) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);
    if (!dto.entries.length) {
      throw new BadRequestException('At least one installment entry is required');
    }

    let plan: InstallmentPlan;
    if (id) {
      const existing = await this.planRepo.findOne({ where: { id } });
      if (!existing) throw new NotFoundException('Installment plan not found');
      this.assertSchool(user, existing.school_id);
      existing.name = dto.name.trim();
      existing.description = dto.description?.trim() || null;
      existing.is_active = dto.is_active !== false;
      plan = await this.planRepo.save(existing);
      await this.entryRepo.delete({ plan_id: plan.id });
    } else {
      plan = await this.planRepo.save(
        this.planRepo.create({
          school_id: dto.school_id,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          is_active: dto.is_active !== false,
        }),
      );
    }

    const entries = dto.entries
      .sort((a, b) => a.sequence - b.sequence)
      .map((e, idx) =>
        this.entryRepo.create({
          plan_id: plan.id,
          sequence: e.sequence || idx + 1,
          month_number: e.month_number ?? null,
          label: e.label?.trim() || null,
          weight: String(e.weight ?? 1),
        }),
      );
    await this.entryRepo.save(entries);
    return this.getOne(user, plan.id);
  }

  async getUsage(user: User, id: string): Promise<InstallmentPlanUsage> {
    this.assertAdmin(user);
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Installment plan not found');
    this.assertSchool(user, plan.school_id);

    const sheets = await this.chargeSheetRepo.find({
      where: { installment_plan_id: id },
      relations: ['student'],
    });

    const usages: InstallmentPlanUsageItem[] = sheets.map((sheet) => {
      const student = sheet.student;
      const name = student
        ? `${student.first_name ?? ''} ${student.family_name ?? ''}`.trim()
        : '';
      return {
        kind: 'student_charge_sheet',
        id: sheet.id,
        label: name || sheet.student_id,
      };
    });

    return { in_use: usages.length > 0, usages };
  }

  async remove(user: User, id: string) {
    this.assertAdmin(user);
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Installment plan not found');
    this.assertSchool(user, plan.school_id);

    const usage = await this.getUsage(user, id);
    if (usage.in_use) {
      throw new BadRequestException({
        code: 'INSTALLMENT_PLAN_IN_USE',
        usages: usage.usages,
      });
    }

    await this.planRepo.remove(plan);
  }
}
