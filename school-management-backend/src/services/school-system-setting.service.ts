import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolSystemSetting } from '../entities/school-system-setting.entity';
import { User } from '../entities/user.entity';

export interface CreateSchoolSystemSettingDto {
  key: string;
  value: string | boolean | number | Record<string, unknown>;
  type: 'string' | 'boolean' | 'number' | 'json';
  category: string;
  title: string;
  description: string;
  is_public?: boolean;
}

export interface UpdateSchoolSystemSettingDto {
  value: string | boolean | number | Record<string, unknown>;
  title?: string;
  description?: string;
  is_public?: boolean;
}

type SettingValue = string | boolean | number | Record<string, unknown>;

type RegistryEntry = {
  value: SettingValue;
  type: 'string' | 'boolean' | 'number' | 'json';
  category: string;
  title: string;
  description: string;
  is_public: boolean;
};

/** Keys the unified app expects for system settings (seed + metadata on upsert). */
const SETTING_REGISTRY: Record<string, RegistryEntry> = {
  'attendance.allowAllUsersToTakeAttendance': {
    value: true,
    type: 'boolean',
    category: 'attendance',
    title: 'Allow All Users to Take Attendance',
    description:
      'When enabled, all users can take attendance for any group. When disabled, only supervisors can take attendance for their assigned groups.',
    is_public: false,
  },
  'attendance.requireSupervisorApproval': {
    value: false,
    type: 'boolean',
    category: 'attendance',
    title: 'Require Supervisor Approval',
    description: 'Require supervisor approval before attendance is finalized',
    is_public: false,
  },
  'attendance.allowRetroactiveAttendance': {
    value: true,
    type: 'boolean',
    category: 'attendance',
    title: 'Allow Retroactive Attendance',
    description: 'Allow users to mark attendance for past dates',
    is_public: false,
  },
  'attendance.maxRetroactiveDays': {
    value: 7,
    type: 'number',
    category: 'attendance',
    title: 'Max Retroactive Days',
    description: 'Maximum number of days in the past that attendance can be marked',
    is_public: false,
  },
  'userPermissions.teacherCanViewAllGroups': {
    value: true,
    type: 'boolean',
    category: 'userPermissions',
    title: 'Teachers Can View All Groups',
    description: 'Allow teachers to view and manage all groups, not just their assigned ones',
    is_public: false,
  },
  'userPermissions.parentCanViewOtherStudents': {
    value: false,
    type: 'boolean',
    category: 'userPermissions',
    title: 'Parents Can View Other Students',
    description: 'Allow parents to see information about other students in the same group',
    is_public: false,
  },
  'userPermissions.adminRequiresTwoFactorAuth': {
    value: false,
    type: 'boolean',
    category: 'userPermissions',
    title: 'Admin Requires Two-Factor Auth',
    description: 'Require administrators to use two-factor authentication',
    is_public: false,
  },
  'schoolInfo.name': {
    value: 'زهرة الحياة للأطفال',
    type: 'string',
    category: 'schoolInfo',
    title: 'School Name',
    description: '',
    is_public: true,
  },
  'schoolInfo.address': {
    value: 'مسقط، سلطنة عمان',
    type: 'string',
    category: 'schoolInfo',
    title: 'School Address',
    description: '',
    is_public: true,
  },
  'schoolInfo.phone': {
    value: '+968 1234 5678',
    type: 'string',
    category: 'schoolInfo',
    title: 'Phone Number',
    description: '',
    is_public: true,
  },
  'schoolInfo.email': {
    value: 'info@zahratalhayat.om',
    type: 'string',
    category: 'schoolInfo',
    title: 'Email Address',
    description: '',
    is_public: true,
  },
  'schoolInfo.website': {
    value: 'www.zahratalhayat.om',
    type: 'string',
    category: 'schoolInfo',
    title: 'Website',
    description: '',
    is_public: true,
  },
  'academic.currentAcademicYear': {
    value: '2024-2025',
    type: 'string',
    category: 'academic',
    title: 'Current Academic Year',
    description: '',
    is_public: false,
  },
  'academic.termStartDate': {
    value: '2024-09-01',
    type: 'string',
    category: 'academic',
    title: 'Term Start Date',
    description: '',
    is_public: false,
  },
  'academic.termEndDate': {
    value: '2025-06-30',
    type: 'string',
    category: 'academic',
    title: 'Term End Date',
    description: '',
    is_public: false,
  },
};

function inferMetaFromKey(key: string): RegistryEntry {
  const dot = key.indexOf('.');
  const category = dot === -1 ? 'general' : key.slice(0, dot);
  return {
    value: '',
    type: 'string',
    category,
    title: key,
    description: '',
    is_public: category === 'schoolInfo',
  };
}

function inferTypeFromValue(value: unknown): 'string' | 'boolean' | 'number' | 'json' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return 'json';
  return 'string';
}

function coerceType(value: unknown, type: 'string' | 'boolean' | 'number' | 'json'): SettingValue {
  if (type === 'json' && value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (type === 'boolean') return Boolean(value);
  if (type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) throw new BadRequestException(`Invalid number for setting`);
    return n;
  }
  if (type === 'string') return value === null || value === undefined ? '' : String(value);
  return value as SettingValue;
}

export type SerializedSchoolSystemSetting = {
  id: string;
  key: string;
  value: string | boolean | number | Record<string, unknown>;
  type: 'string' | 'boolean' | 'number' | 'json';
  category: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class SchoolSystemSettingService {
  constructor(
    @InjectRepository(SchoolSystemSetting)
    private readonly repo: Repository<SchoolSystemSetting>,
  ) {}

  private requireSchoolId(user: User): number {
    if (user.school_id == null) {
      throw new ForbiddenException('User is not linked to a school');
    }
    return user.school_id;
  }

  private serialize(row: SchoolSystemSetting): SerializedSchoolSystemSetting {
    let value: string | boolean | number | Record<string, unknown> = row.value_json as any;
    if (row.type === 'number' && typeof value === 'string') {
      value = Number(value);
    }
    return {
      id: row.id,
      key: row.setting_key,
      value,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      is_public: row.is_public,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }

  /** Insert any registry defaults missing for this school. */
  async ensureDefaultsForSchool(schoolId: number): Promise<void> {
    const existing = await this.repo.find({ where: { school_id: schoolId }, select: ['setting_key'] });
    const have = new Set(existing.map((r) => r.setting_key));
    for (const [key, meta] of Object.entries(SETTING_REGISTRY)) {
      if (have.has(key)) continue;
      await this.repo.save(
        this.repo.create({
          school_id: schoolId,
          setting_key: key,
          value_json: meta.value,
          type: meta.type,
          category: meta.category,
          title: meta.title,
          description: meta.description,
          is_public: meta.is_public,
        }),
      );
    }
  }

  async findAllForUser(user: User): Promise<SerializedSchoolSystemSetting[]> {
    const schoolId = this.requireSchoolId(user);
    await this.ensureDefaultsForSchool(schoolId);
    const rows = await this.repo.find({ where: { school_id: schoolId }, order: { category: 'ASC', setting_key: 'ASC' } });
    return rows.map((r) => this.serialize(r));
  }

  async findByCategory(user: User, category: string): Promise<SerializedSchoolSystemSetting[]> {
    const schoolId = this.requireSchoolId(user);
    await this.ensureDefaultsForSchool(schoolId);
    const rows = await this.repo.find({
      where: { school_id: schoolId, category },
      order: { setting_key: 'ASC' },
    });
    return rows.map((r) => this.serialize(r));
  }

  async findByKey(user: User, key: string): Promise<SerializedSchoolSystemSetting> {
    const schoolId = this.requireSchoolId(user);
    await this.ensureDefaultsForSchool(schoolId);
    const row = await this.repo.findOne({ where: { school_id: schoolId, setting_key: key } });
    if (!row) {
      throw new NotFoundException(`Setting not found: ${key}`);
    }
    return this.serialize(row);
  }

  async create(user: User, dto: CreateSchoolSystemSettingDto): Promise<SerializedSchoolSystemSetting> {
    const schoolId = this.requireSchoolId(user);
    const meta = SETTING_REGISTRY[dto.key] ?? inferMetaFromKey(dto.key);
    const row = this.repo.create({
      school_id: schoolId,
      setting_key: dto.key,
      value_json: coerceType(dto.value, dto.type),
      type: dto.type,
      category: dto.category,
      title: dto.title ?? meta.title,
      description: dto.description ?? meta.description,
      is_public: dto.is_public ?? meta.is_public,
    });
    try {
      const saved = await this.repo.save(row);
      return this.serialize(saved);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException(`Setting already exists: ${dto.key}`);
      }
      throw e;
    }
  }

  async updateByKey(user: User, key: string, dto: UpdateSchoolSystemSettingDto): Promise<SerializedSchoolSystemSetting> {
    const schoolId = this.requireSchoolId(user);
    let row = await this.repo.findOne({ where: { school_id: schoolId, setting_key: key } });
    if (!row) {
      const meta = SETTING_REGISTRY[key] ?? inferMetaFromKey(key);
      row = this.repo.create({
        school_id: schoolId,
        setting_key: key,
        value_json: meta.value,
        type: meta.type,
        category: meta.category,
        title: meta.title,
        description: meta.description,
        is_public: meta.is_public,
      });
    }
    row.value_json = coerceType(dto.value, row.type);
    if (dto.title !== undefined) row.title = dto.title;
    if (dto.description !== undefined) row.description = dto.description;
    if (dto.is_public !== undefined) row.is_public = dto.is_public;
    const saved = await this.repo.save(row);
    return this.serialize(saved);
  }

  async deleteByKey(user: User, key: string): Promise<void> {
    const schoolId = this.requireSchoolId(user);
    const res = await this.repo.delete({ school_id: schoolId, setting_key: key });
    if (!res.affected) {
      throw new NotFoundException(`Setting not found: ${key}`);
    }
  }

  async bulkUpsert(user: User, items: { key: string; value: unknown }[]): Promise<SerializedSchoolSystemSetting[]> {
    const schoolId = this.requireSchoolId(user);
    const results: SerializedSchoolSystemSetting[] = [];
    for (const item of items) {
      if (!item?.key) continue;
      const meta = SETTING_REGISTRY[item.key] ?? inferMetaFromKey(item.key);
      let row = await this.repo.findOne({ where: { school_id: schoolId, setting_key: item.key } });
      if (!row) {
        const type = SETTING_REGISTRY[item.key] ? meta.type : inferTypeFromValue(item.value);
        row = this.repo.create({
          school_id: schoolId,
          setting_key: item.key,
          value_json: coerceType(item.value, type),
          type,
          category: meta.category,
          title: meta.title,
          description: meta.description,
          is_public: meta.is_public,
        });
      } else {
        row.value_json = coerceType(item.value, row.type);
      }
      results.push(this.serialize(await this.repo.save(row)));
    }
    return results;
  }
}
