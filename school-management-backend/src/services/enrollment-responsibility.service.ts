import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';
import {
  EnrollmentResponsibilityItem,
  type EnrollmentResponsibilityParty,
} from '../entities/enrollment-responsibility-item.entity';
import { User } from '../entities/user.entity';
import {
  CreateEnrollmentResponsibilityDto,
  UpdateEnrollmentResponsibilityDto,
} from '../dto/enrollment-responsibility.dto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SerializedEnrollmentResponsibility = {
  id: string;
  school_id: string;
  party: EnrollmentResponsibilityParty;
  text_ar: string;
  text_en: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class EnrollmentResponsibilityService {
  constructor(
    @InjectRepository(EnrollmentResponsibilityItem)
    private readonly repo: Repository<EnrollmentResponsibilityItem>,
  ) {}

  private serialize(row: EnrollmentResponsibilityItem): SerializedEnrollmentResponsibility {
    return {
      id: row.id,
      school_id: row.school_id,
      party: row.party,
      text_ar: row.text_ar,
      text_en: row.text_en,
      sort_order: row.sort_order,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private schoolOf(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested ?? undefined);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  async listForAdmin(
    user: User,
    requestedSchoolId?: string | null,
    party?: EnrollmentResponsibilityParty | null,
  ): Promise<SerializedEnrollmentResponsibility[]> {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const where: { school_id: string; party?: EnrollmentResponsibilityParty } = {
      school_id: schoolId,
    };
    if (party === 'school' || party === 'parent') where.party = party;
    const rows = await this.repo.find({
      where,
      order: { party: 'ASC', sort_order: 'ASC', created_at: 'ASC' },
    });
    return rows.map((r) => this.serialize(r));
  }

  /** Public enrollment form — active items only. */
  async listPublic(schoolId: string): Promise<{
    school: SerializedEnrollmentResponsibility[];
    parent: SerializedEnrollmentResponsibility[];
  }> {
    const id = schoolId?.trim() ?? '';
    if (!UUID_RE.test(id)) throw new BadRequestException('school_id must be a UUID');
    const rows = await this.repo.find({
      where: { school_id: id, is_active: true },
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });
    const school = rows.filter((r) => r.party === 'school').map((r) => this.serialize(r));
    const parent = rows.filter((r) => r.party === 'parent').map((r) => this.serialize(r));
    return { school, parent };
  }

  async create(
    user: User,
    dto: CreateEnrollmentResponsibilityDto,
    requestedSchoolId?: string | null,
  ): Promise<SerializedEnrollmentResponsibility> {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const textAr = dto.text_ar.trim();
    const textEn = dto.text_en.trim();
    if (!textAr || !textEn) {
      throw new BadRequestException('text_ar and text_en are required');
    }
    let sortOrder = dto.sort_order;
    if (sortOrder == null) {
      const max = await this.repo
        .createQueryBuilder('r')
        .select('MAX(r.sort_order)', 'max')
        .where('r.school_id = :schoolId AND r.party = :party', {
          schoolId,
          party: dto.party,
        })
        .getRawOne<{ max: string | null }>();
      sortOrder = (max?.max != null ? Number(max.max) : -1) + 1;
    }
    const row = this.repo.create({
      school_id: schoolId,
      party: dto.party,
      text_ar: textAr,
      text_en: textEn,
      sort_order: sortOrder,
      is_active: dto.is_active !== false,
    });
    const saved = await this.repo.save(row);
    return this.serialize(saved);
  }

  async update(
    user: User,
    id: string,
    dto: UpdateEnrollmentResponsibilityDto,
  ): Promise<SerializedEnrollmentResponsibility> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Responsibility item not found');
    assertSameSchool(user, row.school_id);
    if (dto.party != null) row.party = dto.party;
    if (dto.text_ar != null) {
      const v = dto.text_ar.trim();
      if (!v) throw new BadRequestException('text_ar cannot be empty');
      row.text_ar = v;
    }
    if (dto.text_en != null) {
      const v = dto.text_en.trim();
      if (!v) throw new BadRequestException('text_en cannot be empty');
      row.text_en = v;
    }
    if (dto.sort_order != null) row.sort_order = dto.sort_order;
    if (dto.is_active != null) row.is_active = dto.is_active;
    const saved = await this.repo.save(row);
    return this.serialize(saved);
  }

  async remove(user: User, id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Responsibility item not found');
    assertSameSchool(user, row.school_id);
    await this.repo.remove(row);
  }
}
