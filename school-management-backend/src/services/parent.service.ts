import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { Attendance } from '../entities/attendance.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Schedule } from '../entities/schedule.entity';
import { WeeklySessionPlan } from '../entities/weekly-session-plan.entity';
import { StudentProgress } from '../entities/student-progress.entity';
import { BusMovementLog } from '../entities/bus-movement-log.entity';
import { sanitizeUserDeep } from '../common/security/school-access';

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
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(BusMovementLog)
    private busMovementLogRepository: Repository<BusMovementLog>,
  ) {}

  async create(createParentDto: CreateParentDto, schoolId?: number | null): Promise<Parent> {
    const { studentIds, userId, ...fields } = createParentDto;
    const parent = this.parentRepository.create(fields);

    // Set user if provided
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId.toString() }
      });
      if (user) {
        parent.user = user;
        parent.user_id = userId;
      }
    }

    // Own the record: a parent created from the student screen has no user account, so
    // without this it belongs to no school and disappears from every scoped list.
    parent.school_id = schoolId ?? parent.user?.school_id ?? null;

    // Set students if provided
    if (studentIds && studentIds.length > 0) {
      const students = await this.studentRepository.findBy(
        schoolId == null
          ? { id: In(studentIds) }
          : { id: In(studentIds), school_id: schoolId },
      );
      if (students.length !== studentIds.length) {
        throw new NotFoundException('One or more students were not found in this school');
      }
      parent.students = students;
      if (parent.school_id == null && students[0]?.school_id != null) {
        parent.school_id = Number(students[0].school_id);
      }
    }

    return this.parentRepository.save(parent);
  }

  /**
   * Parents carry their own school_id; rows created before that column exists are still
   * reachable through the linked user account or a linked student.
   */
  private scopeQuery(qb: any, schoolId?: number | null) {
    if (schoolId == null) return qb;
    return qb.andWhere(
      new Brackets((w) => {
        w.where('parent.school_id = :schoolId', { schoolId })
          .orWhere('(parent.school_id IS NULL AND user.school_id = :schoolId)', { schoolId })
          .orWhere('(parent.school_id IS NULL AND students.school_id = :schoolId)', { schoolId });
      }),
    );
  }

  async findAll(schoolId?: number | null): Promise<Parent[]> {
    if (schoolId == null) {
      return sanitizeUserDeep(
        await this.parentRepository.find({
          relations: ['user', 'students'],
        }),
      );
    }
    const rows = await this.scopeQuery(
      this.parentRepository
        .createQueryBuilder('parent')
        .leftJoinAndSelect('parent.user', 'user')
        .leftJoinAndSelect('parent.students', 'students'),
      schoolId,
    ).getMany();
    return sanitizeUserDeep(rows);
  }

  async findOne(id: number, schoolId?: number | null): Promise<Parent> {
    const parent = await this.scopeQuery(
      this.parentRepository
        .createQueryBuilder('parent')
        .leftJoinAndSelect('parent.user', 'user')
        .leftJoinAndSelect('parent.students', 'students')
        .where('parent.id = :id', { id }),
      schoolId,
    ).getOne();

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async update(
    id: number,
    updateParentDto: UpdateParentDto,
    schoolId?: number | null,
  ): Promise<Parent> {
    const parent = await this.findOne(id, schoolId);

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
        const students = await this.studentRepository.findBy(
          schoolId == null
            ? { id: In(updateParentDto.studentIds) }
            : { id: In(updateParentDto.studentIds), school_id: schoolId },
        );
        if (students.length !== updateParentDto.studentIds.length) {
          throw new NotFoundException('One or more students were not found in this school');
        }
        parent.students = students;
      } else {
        parent.students = [];
      }
    }

    // Never let an update move a parent to another school.
    if (schoolId != null) {
      parent.school_id = schoolId;
    }

    return this.parentRepository.save(parent);
  }

  async remove(id: number, schoolId?: number | null): Promise<void> {
    const parent = await this.findOne(id, schoolId);
    await this.parentRepository.remove(parent);
  }

  /**
   * Admin-initiated password reset for a parent's login account. Scoped to the caller's
   * school, and it never reveals or requires the parent's current password.
   */
  async resetPassword(
    id: number,
    newPassword: string,
    schoolId?: number | null,
  ): Promise<{ email: string | null }> {
    const password = (newPassword ?? '').trim();
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const parent = await this.findOne(id, schoolId);
    if (!parent.user_id) {
      throw new BadRequestException(
        'This parent has no login account, so there is no password to reset.',
      );
    }

    const user = await this.userRepository.findOne({
      where:
        schoolId == null
          ? { id: parent.user_id }
          : { id: parent.user_id, school_id: schoolId },
    });
    if (!user) {
      throw new NotFoundException('The linked login account was not found in this school');
    }

    // 12 rounds, matching AuthService.changePassword.
    user.password = await bcrypt.hash(password, 12);
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return { email: user.email ?? null };
  }

  async searchParents(query: string, schoolId?: number | null): Promise<Parent[]> {
    const qb = this.parentRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.user', 'user')
      .leftJoinAndSelect('parent.students', 'students');

    // Bracketed: without it the ORs would match parents from every school.
    return sanitizeUserDeep(
      await this.scopeQuery(qb, schoolId)
        .andWhere(
          new Brackets((w) => {
            w.where('parent.firstName ILIKE :query', { query: `%${query}%` })
              .orWhere('parent.lastName ILIKE :query', { query: `%${query}%` })
              .orWhere('parent.email ILIKE :query', { query: `%${query}%` })
              .orWhere('parent.phone ILIKE :query', { query: `%${query}%` });
          }),
        )
        .getMany(),
    );
  }

  async assignToStudent(
    parentId: number,
    studentId: string,
    schoolId?: number | null,
  ): Promise<Parent> {
    const parent = await this.findOne(parentId, schoolId);
    const student = await this.studentRepository.findOne({
      where: schoolId == null ? { id: studentId } : { id: studentId, school_id: schoolId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Already linked: adding again violates the composite primary key.
    if ((parent.students || []).some((s) => s.id === studentId)) {
      return parent;
    }

    // Use relation builder to add the relationship
    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .add(studentId);

    // Return updated parent with relations
    return this.findOne(parentId, schoolId);
  }

  async removeFromStudent(
    parentId: number,
    studentId: string,
    schoolId?: number | null,
  ): Promise<Parent> {
    await this.findOne(parentId, schoolId);

    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .remove(studentId);

    // Return updated parent with relations
    return this.findOne(parentId, schoolId);
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
          where: { group_id: group.id, status: 'active' },
          relations: ['course', 'teacher', 'group', 'room'],
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
          relations: ['schedule', 'schedule.course', 'schedule.group', 'schedule.teacher'],
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

  /** Calendar "today" in server local time */
  private startOfLocalDay(d = new Date()): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private async getChildrenForParentUser(userId: string): Promise<Student[]> {
    let parentRecord = await this.parentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['students', 'students.groups'],
    });

    if (!parentRecord) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const students = await this.studentRepository
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.parents', 'parent')
        .leftJoinAndSelect('student.groups', 'group')
        .where('parent.firstName ILIKE :firstName', { firstName: `%${user.firstName}%` })
        .orWhere('parent.lastName ILIKE :lastName', { lastName: `%${user.lastName}%` })
        .getMany();

      return students;
    }

    return parentRecord.students || [];
  }

  /**
   * Today status per child + paginated history (excludes today from history list to avoid duplication).
   */
  async getParentAttendanceView(
    userId: string,
    offset = 0,
    limit = 5,
  ): Promise<{
    today: {
      date: string;
      children: Array<{
        studentId: string;
        firstName: string;
        lastName: string;
        groupNames: string;
        record: null | {
          id: number;
          status: string;
          check_in_time: string | null;
          check_out_time: string | null;
          notes: string | null;
          is_excused: boolean;
          reason: string | null;
          groupName: string | null;
        };
      }>;
      summary: {
        totalChildren: number;
        recorded: number;
        pending: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
      };
    };
    history: {
      items: Array<{
        id: number;
        attendance_date: string;
        status: string;
        check_in_time: string | null;
        check_out_time: string | null;
        notes: string | null;
        is_excused: boolean;
        reason: string | null;
        student: { id: string; firstName: string; lastName: string };
        group: { id: string; name: string } | null;
      }>;
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    const students = await this.getChildrenForParentUser(userId);
    const todayStart = this.startOfLocalDay();
    const dateStr = `${todayStart.getFullYear()}-${String(todayStart.getMonth() + 1).padStart(2, '0')}-${String(todayStart.getDate()).padStart(2, '0')}`;

    const emptySummary = {
      totalChildren: 0,
      recorded: 0,
      pending: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    if (students.length === 0) {
      return {
        today: {
          date: dateStr,
          children: [],
          summary: emptySummary,
        },
        history: {
          items: [],
          total: 0,
          offset,
          limit,
          hasMore: false,
        },
      };
    }

    const studentIds = students.map((s) => s.id);

    const todayRows = await this.attendanceRepository.find({
      where: {
        student_id: In(studentIds),
        attendance_date: todayStart,
      },
      relations: ['group'],
      order: { created_at: 'DESC' },
    });

    const todayByStudent = new Map<string, Attendance>();
    for (const row of todayRows) {
      if (!todayByStudent.has(row.student_id)) {
        todayByStudent.set(row.student_id, row);
      }
    }

    const mapAttendance = (r: Attendance) => ({
      id: r.id,
      status: r.status,
      check_in_time: r.check_in_time,
      check_out_time: r.check_out_time,
      notes: r.notes,
      is_excused: r.is_excused,
      reason: r.reason,
      groupName: r.group?.name ?? null,
    });

    const children = students.map((student) => {
      const rec = todayByStudent.get(student.id);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        groupNames: student.groups?.map((g) => g.name).join(', ') || '',
        record: rec ? mapAttendance(rec) : null,
      };
    });

    let recorded = 0;
    let pending = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    for (const c of children) {
      if (!c.record) {
        pending++;
        continue;
      }
      recorded++;
      if (c.record.status === 'present') present++;
      else if (c.record.status === 'absent') absent++;
      else if (c.record.status === 'late') late++;
      if (c.record.is_excused) excused++;
    }

    const safeLimit = Math.min(50, Math.max(1, limit));
    const safeOffset = Math.max(0, offset);

    const qb = this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .leftJoinAndSelect('a.group', 'group')
      .where('a.student_id IN (:...ids)', { ids: studentIds })
      .andWhere('a.attendance_date < :today', { today: todayStart })
      .orderBy('a.attendance_date', 'DESC')
      .addOrderBy('a.created_at', 'DESC')
      .skip(safeOffset)
      .take(safeLimit);

    const [historyRows, total] = await qb.getManyAndCount();

    const items = historyRows.map((r) => ({
      id: r.id,
      attendance_date:
        r.attendance_date instanceof Date
          ? r.attendance_date.toISOString().split('T')[0]
          : String(r.attendance_date).split('T')[0],
      status: r.status,
      check_in_time: r.check_in_time,
      check_out_time: r.check_out_time,
      notes: r.notes,
      is_excused: r.is_excused,
      reason: r.reason,
      student: {
        id: r.student.id,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
      },
      group: r.group ? { id: r.group.id, name: r.group.name } : null,
    }));

    return {
      today: {
        date: dateStr,
        children,
        summary: {
          totalChildren: children.length,
          recorded,
          pending,
          present,
          absent,
          late,
          excused,
        },
      },
      history: {
        items,
        total,
        offset: safeOffset,
        limit: safeLimit,
        hasMore: safeOffset + items.length < total,
      },
    };
  }

  /**
   * Activities (school calendar / group events) for groups the parent's children belong to.
   */
  async getParentAssignedActivities(userId: string): Promise<Activity[]> {
    const students = await this.getChildrenForParentUser(userId);
    const groupIds = new Set<string>();
    for (const s of students) {
      for (const g of s.groups || []) {
        groupIds.add(String(g.id));
      }
    }
    if (groupIds.size === 0) {
      return [];
    }
    const ids = [...groupIds];
    return this.activityRepository.find({
      where: {
        group_id: In(ids),
        is_active: true,
      },
      relations: ['group', 'createdByUser'],
      order: { activity_date: 'DESC', created_at: 'DESC' },
    });
  }

  /**
   * Bus boarding / drop-off log lines for the parent's children (same school as bus).
   * Optional `date` (YYYY-MM-DD) filters by trip day; otherwise returns the latest `limit` rows.
   */
  async getParentBusMovementLogs(
    userId: string,
    schoolId: number,
    options?: { date?: string; limit?: number },
  ): Promise<{
    date: string | null;
    items: Array<{
      id: string;
      logged_at: string;
      trip_date: string;
      trip_type: 'going' | 'return';
      event_type: 'boarded' | 'dropped_off';
      bus_id: string;
      bus_title: string;
      student_id: string;
      student_first_name: string;
      student_last_name: string;
    }>;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'parent') {
      throw new ForbiddenException('Only parents can view bus movement logs.');
    }

    const students = await this.getChildrenForParentUser(userId);
    const studentIds = students
      .filter((s) => s.school_id != null && Number(s.school_id) === Number(schoolId))
      .map((s) => s.id);

    const limit = Math.min(100, Math.max(1, options?.limit ?? 30));
    const dateParam =
      options?.date && /^\d{4}-\d{2}-\d{2}$/.test(options.date.trim())
        ? options.date.trim()
        : null;

    if (studentIds.length === 0) {
      return { date: dateParam, items: [] };
    }

    const qb = this.busMovementLogRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.student', 'student')
      .innerJoinAndSelect('log.bus', 'bus')
      .where('log.student_id IN (:...ids)', { ids: studentIds })
      .andWhere('bus.school_id = :sid', { sid: schoolId })
      .orderBy('log.logged_at', 'DESC')
      .take(limit);

    if (dateParam) {
      qb.andWhere('log.tripDate = :td', { td: dateParam });
    }

    const logs = await qb.getMany();

    const items = logs.map((log) => ({
      id: log.id,
      logged_at: log.logged_at?.toISOString?.() ?? String(log.logged_at),
      trip_date: (() => {
        const td = log.tripDate as unknown;
        return td instanceof Date
          ? td.toISOString().slice(0, 10)
          : String(td).slice(0, 10);
      })(),
      trip_type: log.tripType,
      event_type: log.event_type,
      bus_id: log.bus_id,
      bus_title: log.bus?.title ?? '',
      student_id: log.student_id,
      student_first_name: log.student?.firstName ?? '',
      student_last_name: log.student?.lastName ?? '',
    }));

    return { date: dateParam, items };
  }
}