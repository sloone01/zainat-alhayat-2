import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../../entities/school.entity';

const CACHE_MS = 5 * 60_000;

export type ActorLogUser = {
  id?: string;
  school_id?: string | null;
  isSuperAdmin?: boolean;
  isSystemUser?: boolean;
  user_type?: string;
};

@Injectable()
export class ActorLogLabelService {
  private readonly cache = new Map<string, { name: string; at: number }>();

  constructor(
    @InjectRepository(School)
    private readonly schools: Repository<School>,
  ) {}

  async format(user?: ActorLogUser | null): Promise<{ userId: string; schoolName: string }> {
    const userId = user?.id ? String(user.id) : '-';
    const schoolId = user?.school_id ? String(user.school_id) : '';
    if (!schoolId) {
      if (user?.isSuperAdmin || user?.isSystemUser || user?.user_type === 'platform') {
        return { userId, schoolName: 'platform' };
      }
      return { userId, schoolName: '-' };
    }
    return { userId, schoolName: await this.schoolName(schoolId) };
  }

  async schoolName(schoolId: string): Promise<string> {
    const hit = this.cache.get(schoolId);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.name;
    const row = await this.schools.findOne({
      where: { id: schoolId },
      select: ['id', 'name', 'name_ar', 'name_en'],
    });
    const name = String(row?.name_ar || row?.name || row?.name_en || schoolId).trim() || schoolId;
    this.cache.set(schoolId, { name, at: Date.now() });
    return name;
  }
}
