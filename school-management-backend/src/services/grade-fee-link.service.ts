import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { GradeFeeLink } from '../entities/grade-fee-link.entity';
import { GradeFeeLinkLine } from '../entities/grade-fee-link-line.entity';
import { FeePackage } from '../entities/fee-package.entity';
import { SchoolPaymentLevel } from '../entities/school-payment-level.entity';
import { UpsertGradeFeeLinkDto } from '../dto/fees-v2.dto';
import { moneyStr } from '../utils/fees-v2.util';

@Injectable()
export class GradeFeeLinkService {
  constructor(
    @InjectRepository(GradeFeeLink)
    private readonly linkRepo: Repository<GradeFeeLink>,
    @InjectRepository(GradeFeeLinkLine)
    private readonly lineRepo: Repository<GradeFeeLinkLine>,
    @InjectRepository(FeePackage)
    private readonly packageRepo: Repository<FeePackage>,
    @InjectRepository(SchoolPaymentLevel)
    private readonly levelRepo: Repository<SchoolPaymentLevel>,
  ) {}

  private assertAdmin(user: User) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Wrong school');
    }
  }

  async getByLevel(user: User, schoolId: number, levelId: string) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    const link = await this.linkRepo.findOne({
      where: { school_id: schoolId, level_id: levelId },
      relations: ['lines', 'lines.chargeType', 'feePackage', 'feePackage.chargeTypeLinks', 'level'],
    });
    return link;
  }

  async list(user: User, schoolId: number) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.linkRepo.find({
      where: { school_id: schoolId },
      relations: ['lines', 'feePackage', 'level'],
      order: { updated_at: 'DESC' },
    });
  }

  async upsert(user: User, dto: UpsertGradeFeeLinkDto) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);

    const level = await this.levelRepo.findOne({
      where: { id: dto.level_id, school_id: dto.school_id },
    });
    if (!level) throw new NotFoundException('Grade level not found');

    const pkg = await this.packageRepo.findOne({
      where: { id: dto.fee_package_id, school_id: dto.school_id },
      relations: ['chargeTypeLinks'],
    });
    if (!pkg) throw new NotFoundException('Fee package not found');

    const allowedChargeIds = new Set(
      (pkg.chargeTypeLinks ?? []).map((c) => c.charge_type_id),
    );
    for (const line of dto.lines) {
      if (!allowedChargeIds.has(line.charge_type_id)) {
        throw new BadRequestException(
          'Charge type is not part of the selected fee package',
        );
      }
    }

    let link = await this.linkRepo.findOne({
      where: { school_id: dto.school_id, level_id: dto.level_id },
    });
    if (!link) {
      link = await this.linkRepo.save(
        this.linkRepo.create({
          school_id: dto.school_id,
          level_id: dto.level_id,
          fee_package_id: dto.fee_package_id,
          is_active: true,
        }),
      );
    } else {
      link.fee_package_id = dto.fee_package_id;
      link.is_active = true;
      link = await this.linkRepo.save(link);
      await this.lineRepo.delete({ link_id: link.id });
    }

    const lines = dto.lines.map((l) =>
      this.lineRepo.create({
        link_id: link!.id,
        charge_type_id: l.charge_type_id,
        amount: moneyStr(l.amount),
      }),
    );
    if (lines.length) await this.lineRepo.save(lines);

    return this.getByLevel(user, dto.school_id, dto.level_id);
  }
}
