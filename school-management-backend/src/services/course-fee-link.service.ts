import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CourseFeeLink } from '../entities/course-fee-link.entity';
import { CourseFeeLinkLine } from '../entities/course-fee-link-line.entity';
import { UpsertCourseFeeLinkDto } from '../dto/fees-v2.dto';
import { moneyStr } from '../utils/fees-v2.util';

@Injectable()
export class CourseFeeLinkService {
  constructor(
    @InjectRepository(CourseFeeLink)
    private readonly linkRepo: Repository<CourseFeeLink>,
    @InjectRepository(CourseFeeLinkLine)
    private readonly lineRepo: Repository<CourseFeeLinkLine>,
  ) {}

  private assertAdmin(user: User) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('Wrong school');
    }
  }

  async getByCourse(user: User, schoolId: number, courseId: string) {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.linkRepo.findOne({
      where: { school_id: schoolId, course_id: courseId },
      relations: ['lines', 'lines.chargeType', 'feePackage', 'feePackage.chargeTypeLinks', 'course'],
    });
  }

  async upsert(user: User, dto: UpsertCourseFeeLinkDto) {
    this.assertAdmin(user);
    this.assertSchool(user, dto.school_id);

    let link = await this.linkRepo.findOne({
      where: { school_id: dto.school_id, course_id: dto.course_id },
    });
    if (!link) {
      link = await this.linkRepo.save(
        this.linkRepo.create({
          school_id: dto.school_id,
          course_id: dto.course_id,
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
    return this.getByCourse(user, dto.school_id, dto.course_id);
  }
}
