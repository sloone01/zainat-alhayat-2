import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BusFeeLink } from '../entities/bus-fee-link.entity';
import { BusFeeLinkLine } from '../entities/bus-fee-link-line.entity';
import { UpsertBusFeeLinkDto } from '../dto/fees-v2.dto';
import { moneyStr } from '../utils/fees-v2.util';

@Injectable()
export class BusFeeLinkService {
  constructor(
    @InjectRepository(BusFeeLink)
    private readonly linkRepo: Repository<BusFeeLink>,
    @InjectRepository(BusFeeLinkLine)
    private readonly lineRepo: Repository<BusFeeLinkLine>,
  ) {}

  private assertAdmin(user: User) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Wrong school');
    }
  }

  async getByBus(user: User, schoolId: number, busId: string) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.linkRepo.findOne({
      where: { school_id: schoolId, bus_id: busId },
      relations: ['lines', 'lines.chargeType', 'feePackage', 'feePackage.chargeTypeLinks', 'bus'],
    });
  }

  async upsert(user: User, dto: UpsertBusFeeLinkDto) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);

    let link = await this.linkRepo.findOne({
      where: { school_id: dto.school_id, bus_id: dto.bus_id },
    });
    if (!link) {
      link = await this.linkRepo.save(
        this.linkRepo.create({
          school_id: dto.school_id,
          bus_id: dto.bus_id,
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
    return this.getByBus(user, dto.school_id, dto.bus_id);
  }
}
