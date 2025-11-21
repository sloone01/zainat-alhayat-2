import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';

export interface CreateGroupDto {
  name: string;
  age_group: string;
  capacity: number;
  academic_year: string;
  semester: string;
  description?: string;
  school_id: number;
  supervisor_id?: number;
}

export interface UpdateGroupDto {
  name?: string;
  age_group?: string;
  capacity?: number;
  academic_year?: string;
  semester?: string;
  description?: string;
  supervisor_id?: number;
  is_active?: boolean;
}

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(createGroupDto);
    return await this.groupRepository.save(group);
  }

  async findAll(schoolId?: number, isActive?: boolean): Promise<Group[]> {
    try {
      const whereConditions: any = {};

      if (schoolId !== undefined) {
        whereConditions.school_id = schoolId;
      }

      if (isActive !== undefined) {
        whereConditions.is_active = isActive;
      }

      const groups = await this.groupRepository.find({
        where: whereConditions,
        relations: ['students', 'school', 'academicYear'],
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
      relations: ['students', 'school', 'schedules'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async findByAcademicYear(schoolId: number, academicYear: string): Promise<Group[]> {
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

  async findBySupervisor(supervisorId: number): Promise<Group[]> {
    // Since supervisor relationship is not in the current schema, return empty array
    return [];
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    Object.assign(group, updateGroupDto);
    return await this.groupRepository.save(group);
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

