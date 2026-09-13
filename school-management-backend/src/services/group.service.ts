import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto';

function uuidOrNull(value: unknown): string | null {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  /** Write FK columns without going through relations (TypeORM otherwise overwrites them). */
  private async persistFks(
    id: string,
    patch: { level_id?: string | null; supervisor_id?: string | null },
  ): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [];
    let n = 1;
    if (patch.level_id !== undefined) {
      sets.push(`level_id = $${n++}`);
      params.push(uuidOrNull(patch.level_id));
    }
    if (patch.supervisor_id !== undefined) {
      sets.push(`supervisor_id = $${n++}`);
      params.push(uuidOrNull(patch.supervisor_id));
    }
    if (!sets.length) return;
    params.push(id);
    await this.groupRepository.query(`UPDATE groups SET ${sets.join(', ')} WHERE id = $${n}`, params);
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      capacity: createGroupDto.capacity,
      school_id: createGroupDto.school_id,
      academic_year_id: uuidOrNull(createGroupDto.academic_year_id) ?? undefined,
      is_active: createGroupDto.is_active !== false,
      status: createGroupDto.is_active === false ? 'inactive' : 'active',
    });
    const saved = await this.groupRepository.save(group);
    await this.persistFks(saved.id, {
      level_id: createGroupDto.level_id,
      supervisor_id: createGroupDto.supervisor_id,
    });
    return this.findOne(saved.id);
  }

  async findAll(schoolId?: string, isActive?: boolean, paymentLevelId?: string): Promise<Group[]> {
    try {
      if (paymentLevelId) {
        const qb = this.groupRepository
          .createQueryBuilder('g')
          .leftJoinAndSelect('g.students', 'students')
          .leftJoinAndSelect('g.school', 'school')
          .leftJoinAndSelect('g.academicYear', 'academicYear')
          .leftJoinAndSelect('g.level', 'level')
          .leftJoinAndSelect('g.supervisor', 'supervisor')
          .where('g.level_id = :paymentLevelId', { paymentLevelId })
          .orderBy('g.created_at', 'DESC');
        if (schoolId !== undefined) {
          qb.andWhere('g.school_id = :schoolId', { schoolId });
        }
        if (isActive !== undefined) {
          qb.andWhere('g.is_active = :isActive', { isActive });
        }
        return qb.getMany();
      }

      const whereConditions: any = {};

      if (schoolId !== undefined) {
        whereConditions.school_id = schoolId;
      }

      if (isActive !== undefined) {
        whereConditions.is_active = isActive;
      }

      const groups = await this.groupRepository.find({
        where: whereConditions,
        relations: ['students', 'school', 'academicYear', 'level', 'supervisor'],
        order: { created_at: 'DESC' },
      });

      console.log(`Found ${groups.length} groups for school_id: ${schoolId}, is_active: ${isActive}`);
      return groups;
    } catch (error) {
      console.error(`Database error finding groups: ${error.message}`, error.stack);

      // Check if it's a database connection or table issue
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        throw new Error(`Database table 'groups' does not exist. Please run database migrations or check database setup.`);
      } else if (error.message.includes('connect') || error.message.includes('connection')) {
        throw new Error(`Cannot connect to database. Please check database connection settings.`);
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['students', 'school', 'schedules', 'level', 'supervisor'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async findByAcademicYear(schoolId: string, academicYear: string): Promise<Group[]> {
    return await this.groupRepository.find({
      where: {
        school_id: schoolId,
        academic_year_id: academicYear,
        is_active: true
      },
      relations: ['students'],
      order: { name: 'ASC' },
    });
  }

  async findBySupervisor(supervisorId: string, schoolId?: string): Promise<Group[]> {
    const id = uuidOrNull(supervisorId);
    if (!id) return [];
    const qb = this.groupRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.level', 'level')
      .leftJoinAndSelect('g.supervisor', 'supervisor')
      .where('g.supervisor_id = :supervisorId', { supervisorId: id })
      .orderBy('g.name', 'ASC');
    if (schoolId) {
      qb.andWhere('g.school_id = :schoolId', { schoolId });
    }
    return qb.getMany();
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    const { level_id, supervisor_id, ...rest } = updateGroupDto;
    if (rest.name !== undefined) group.name = rest.name;
    if (rest.description !== undefined) group.description = rest.description;
    if (rest.capacity !== undefined) group.capacity = rest.capacity;
    if (rest.is_active !== undefined) {
      group.is_active = rest.is_active;
      group.status = rest.is_active ? 'active' : 'inactive';
    }

    await this.groupRepository.save(group);
    await this.persistFks(id, { level_id, supervisor_id });
    return this.findOne(id);
  }

  async updateStudentCount(id: string): Promise<Group> {
    const group = await this.findOne(id);

    // Count current students - no need to update since current_students field doesn't exist
    // This method can be simplified or removed

    return await this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    await this.groupRepository.remove(group);
  }

  async deactivate(id: string): Promise<Group> {
    const group = await this.findOne(id);
    group.is_active = false;
    return await this.groupRepository.save(group);
  }

  async getGroupCapacity(id: string): Promise<any> {
    const group = await this.findOne(id);
    const currentStudents = group.students ? group.students.length : 0;

    return {
      capacity: group.capacity,
      currentStudents: currentStudents,
      available: group.capacity - currentStudents
    };
  }

  async getGroupStatistics(id: string): Promise<any> {
    const group = await this.findOne(id);
    const currentStudents = group.students ? group.students.length : 0;

    return {
      id: group.id,
      name: group.name,
      capacity: group.capacity,
      current_students: currentStudents,
      available_spots: group.capacity - currentStudents,
      occupancy_rate: (currentStudents / group.capacity) * 100,
    };
  }
}

