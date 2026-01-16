import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Schedule } from '../entities/schedule.entity';
import { WeeklySessionPlan } from '../entities/weekly-session-plan.entity';
import { StudentProgress } from '../entities/student-progress.entity';

export interface CreateParentDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  userId?: string;
  studentIds?: string[];
}

export interface UpdateParentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  userId?: string;
  studentIds?: string[];
}

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(WeeklySessionPlan)
    private weeklySessionPlanRepository: Repository<WeeklySessionPlan>,
    @InjectRepository(StudentProgress)
    private studentProgressRepository: Repository<StudentProgress>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const parent = this.parentRepository.create(createParentDto);

    // Set user if provided
    if (createParentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createParentDto.userId.toString() }
      });
      if (user) {
        parent.user = user;
        parent.user_id = createParentDto.userId;
      }
    }

    // Set students if provided
    if (createParentDto.studentIds && createParentDto.studentIds.length > 0) {
      const students = await this.studentRepository.findBy({
        id: In(createParentDto.studentIds)
      });
      parent.students = students;
    }

    return this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return this.parentRepository.find({
      relations: ['user', 'students']
    });
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['user', 'students']
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async update(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    const parent = await this.findOne(id);

    // Update basic fields
    Object.assign(parent, updateParentDto);

    // Update user if provided
    if (updateParentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateParentDto.userId.toString() }
      });
      if (user) {
        parent.user = user;
      }
    }

    // Update students if provided
    if (updateParentDto.studentIds) {
      if (updateParentDto.studentIds.length > 0) {
        const students = await this.studentRepository.findByIds(updateParentDto.studentIds);
        parent.students = students;
      } else {
        parent.students = [];
      }
    }

    return this.parentRepository.save(parent);
  }

  async remove(id: number): Promise<void> {
    const parent = await this.findOne(id);
    await this.parentRepository.remove(parent);
  }

  async searchParents(query: string): Promise<Parent[]> {
    return this.parentRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.user', 'user')
      .leftJoinAndSelect('parent.students', 'students')
      .where('parent.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.lastName ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.email ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.phone ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async assignToStudent(parentId: number, studentId: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Use relation builder to add the relationship
    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .add(studentId);

    // Return updated parent with relations
    return this.findOne(parentId);
  }

  async removeFromStudent(parentId: number, studentId: string): Promise<Parent> {
    const parent = await this.findOne(parentId);

    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .remove(studentId);

    // Return updated parent with relations
    return this.findOne(parentId);
  }

  async getParentDashboardData(userId: string): Promise<any> {
    try {
      // First, try to find parent record by user relation
      let parentRecord = await this.parentRepository.findOne({
        where: { user: { id: userId } },
        relations: ['students', 'students.groups', 'students.parents']
      });

      // If no parent record found, find students by parent name matching
      if (!parentRecord) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Find students where parent name matches user name
        const students = await this.studentRepository
          .createQueryBuilder('student')
          .leftJoinAndSelect('student.parents', 'parent')
          .leftJoinAndSelect('student.groups', 'group')
          .leftJoinAndSelect('student.progress', 'progress')
          .where('parent.firstName ILIKE :firstName', { firstName: `%${user.firstName}%` })
          .orWhere('parent.lastName ILIKE :lastName', { lastName: `%${user.lastName}%` })
          .getMany();

        if (students.length === 0) {
          return {
            children: [],
            groups: [],
            schedules: [],
            weeklyPlans: [],
            progress: []
          };
        }

        // Create a virtual parent record
        parentRecord = {
          id: 0,
          students: students,
          user: user
        } as any;
      }

      // Get all unique groups from all children
      const allGroups: any[] = [];
      const groupIds = new Set();

      if (parentRecord && parentRecord.students) {
        parentRecord.students.forEach(student => {
          if (student.groups) {
            student.groups.forEach(group => {
              if (!groupIds.has(group.id)) {
                groupIds.add(group.id);
                allGroups.push(group);
              }
            });
          }
        });
      }

      // Get schedules for all groups
      const schedules: any[] = [];
      for (const group of allGroups) {
        const groupSchedules = await this.scheduleRepository.find({
          where: { group_id: group.id },
          relations: ['course', 'teacher', 'group']
        });
        schedules.push(...groupSchedules);
      }

      // Get weekly plans for all groups (current week)
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const weeklyPlans: any[] = [];

      for (const group of allGroups) {
        const groupWeeklyPlans = await this.weeklySessionPlanRepository.find({
          where: {
            schedule: { group_id: group.id }
          },
          relations: ['schedule', 'schedule.course', 'schedule.group']
        });
        weeklyPlans.push(...groupWeeklyPlans);
      }

      // Get progress for all children
      const progressData: any[] = [];
      if (parentRecord && parentRecord.students) {
        for (const student of parentRecord.students) {
          const studentProgress = await this.studentProgressRepository.find({
            where: { student: { id: student.id } },
            relations: ['milestone', 'milestone.phase', 'milestone.phase.course']
          });
          progressData.push({
            student: student,
            progress: studentProgress
          });
        }
      }

      return {
        children: parentRecord && parentRecord.students ? parentRecord.students.map(student => ({
          ...student,
          groupNames: student.groups?.map(g => g.name).join(', ') || 'No group assigned'
        })) : [],
        groups: allGroups,
        schedules: schedules,
        weeklyPlans: weeklyPlans,
        progress: progressData,
        summary: {
          totalChildren: parentRecord && parentRecord.students ? parentRecord.students.length : 0,
          totalGroups: allGroups.length,
          totalSchedules: schedules.length,
          totalWeeklyPlans: weeklyPlans.length
        }
      };

    } catch (error) {
      console.error('Error getting parent dashboard data:', error);
      throw error;
    }
  }
}