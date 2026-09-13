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
import {
  applyBilingualName,
  normalizeCivilId,
  normalizeEmail,
  normalizePhone,
} from '../common/identity/bilingual-name';

export type ParentRelationship = 'father' | 'mother' | 'guardian';

export interface CreateParentDto {
  firstName?: string;
  lastName?: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  civil_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  tribe?: string;
  workplace?: string;
  workPhone?: string;
  maritalStatus?: string;
  organizationName?: string;
  responsiblePerson?: string;
  responsiblePhone?: string;
  userId?: string;
  studentIds?: string[];
  /** Applied when linking via studentIds on create */
  relationship?: ParentRelationship;
}

export interface UpdateParentDto {
  firstName?: string;
  lastName?: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  civil_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  tribe?: string;
  workplace?: string;
  workPhone?: string;
  maritalStatus?: string;
  organizationName?: string;
  responsiblePerson?: string;
  responsiblePhone?: string;
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

  /**
   * One parent globally. Match by civil id, then email, then phone.
   * School tenancy is only via linked students — never by parents.school_id.
   */
  async findExistingParent(input: {
    civil_id?: string | null;
    email?: string | null;
    phone?: string | null;
  }): Promise<Parent | null> {
    const civilId = normalizeCivilId(input.civil_id);
    if (civilId) {
      const byCivil = await this.parentRepository
        .createQueryBuilder('parent')
        .leftJoinAndSelect('parent.user', 'user')
        .leftJoinAndSelect('parent.students', 'students')
        .where('parent.civil_id = :civilId', { civilId })
        .getOne();
      if (byCivil) return byCivil;
    }
    const email = normalizeEmail(input.email);
    if (email) {
      const byEmail = await this.parentRepository
        .createQueryBuilder('parent')
        .leftJoinAndSelect('parent.user', 'user')
        .leftJoinAndSelect('parent.students', 'students')
        .where('LOWER(parent.email) = :email', { email })
        .getOne();
      if (byEmail) return byEmail;
    }
    const phone = normalizePhone(input.phone);
    if (phone) {
      const byPhone = await this.parentRepository
        .createQueryBuilder('parent')
        .leftJoinAndSelect('parent.user', 'user')
        .leftJoinAndSelect('parent.students', 'students')
        .where(
          `regexp_replace(COALESCE(parent.phone, ''), '[^0-9+]', '', 'g') = :phone`,
          { phone },
        )
        .getOne();
      if (byPhone) return byPhone;
    }
    return null;
  }

  private async findById(id: string): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['user', 'students'],
    });
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async create(createParentDto: CreateParentDto, schoolId?: string | null): Promise<Parent> {
    const {
      studentIds,
      userId,
      relationship,
      workPhone,
      maritalStatus,
      organizationName,
      responsiblePerson,
      responsiblePhone,
      civil_id,
      ...rest
    } = createParentDto;

    const names = applyBilingualName(rest);
    const civilId = normalizeCivilId(civil_id);
    const email = normalizeEmail(rest.email);
    const phone = rest.phone?.trim() || undefined;

    const existing = await this.findExistingParent({
      civil_id: civilId,
      email,
      phone,
    });
    if (existing) {
      if (civilId && !existing.civil_id) {
        existing.civil_id = civilId;
        await this.parentRepository.save(existing);
      }
      if (studentIds?.length) {
        const rel: ParentRelationship = relationship || 'guardian';
        for (const studentId of studentIds) {
          const student = await this.studentRepository.findOne({
            where:
              schoolId == null ? { id: studentId } : { id: studentId, school_id: schoolId },
          });
          if (!student) {
            throw new NotFoundException('One or more students were not found in this school');
          }
          await this.linkStudentParent(existing.id, studentId, rel);
        }
      }
      return this.findOne(existing.id, schoolId, { forLink: true });
    }

    const parent = this.parentRepository.create({
      ...rest,
      ...names,
      email: email ?? rest.email,
      phone,
      civil_id: civilId,
      workPhone: workPhone ?? null,
      maritalStatus: maritalStatus ?? null,
      organizationName: organizationName ?? null,
      responsiblePerson: responsiblePerson ?? null,
      responsiblePhone: responsiblePhone ?? null,
      school_id: null,
    });

    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId.toString() },
      });
      if (user) {
        parent.user = user;
        parent.user_id = userId;
      }
    }

    const saved = await this.parentRepository.save(parent);

    if (studentIds && studentIds.length > 0) {
      const students = await this.studentRepository.findBy(
        schoolId == null
          ? { id: In(studentIds) }
          : { id: In(studentIds), school_id: schoolId },
      );
      if (students.length !== studentIds.length) {
        throw new NotFoundException('One or more students were not found in this school');
      }
      const rel: ParentRelationship = relationship || 'guardian';
      for (const studentId of studentIds) {
        await this.linkStudentParent(saved.id, studentId, rel);
      }
    }

    return this.findOne(saved.id, schoolId, { forLink: true });
  }

  /** List/search: parents who have a child in this school. Never own a parent by school_id. */
  private scopeQuery(qb: any, schoolId?: string | null) {
    if (schoolId == null) return qb;
    return qb.andWhere('students.school_id = :schoolId', { schoolId });
  }

  async findAll(schoolId?: string | null): Promise<Parent[]> {
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

  async findOne(
    id: string,
    schoolId?: string | null,
    opts?: { forLink?: boolean },
  ): Promise<Parent> {
    if (opts?.forLink || schoolId == null) {
      return this.findById(id);
    }
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
    id: string,
    updateParentDto: UpdateParentDto,
    schoolId?: string | null,
  ): Promise<Parent> {
    const parent = await this.findOne(id, schoolId);

    const {
      userId,
      studentIds,
      workPhone,
      maritalStatus,
      organizationName,
      responsiblePerson,
      responsiblePhone,
      civil_id,
      ...rest
    } = updateParentDto;

    Object.assign(parent, applyBilingualName({ ...parent, ...rest }));
    if (civil_id !== undefined) parent.civil_id = normalizeCivilId(civil_id);
    if (workPhone !== undefined) parent.workPhone = workPhone ?? null;
    if (maritalStatus !== undefined) parent.maritalStatus = maritalStatus ?? null;
    if (organizationName !== undefined) parent.organizationName = organizationName ?? null;
    if (responsiblePerson !== undefined) parent.responsiblePerson = responsiblePerson ?? null;
    if (responsiblePhone !== undefined) parent.responsiblePhone = responsiblePhone ?? null;

    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId.toString() },
      });
      if (user) {
        parent.user = user;
      }
    }

    if (studentIds) {
      if (studentIds.length > 0) {
        const students = await this.studentRepository.findBy(
          schoolId == null
            ? { id: In(studentIds) }
            : { id: In(studentIds), school_id: schoolId },
        );
        if (students.length !== studentIds.length) {
          throw new NotFoundException('One or more students were not found in this school');
        }
        parent.students = students;
      } else {
        parent.students = [];
      }
    }

    parent.school_id = null;

    return this.parentRepository.save(parent);
  }

  async remove(id: string, schoolId?: string | null): Promise<void> {
    const parent = await this.findOne(id, schoolId);
    await this.parentRepository.remove(parent);
  }

  /**
   * Admin-initiated password reset for a parent's login account. Scoped to the caller's
   * school, and it never reveals or requires the parent's current password.
   */
  async resetPassword(
    id: string,
    newPassword: string,
    schoolId?: string | null,
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
      where: { id: parent.user_id },
    });
    if (!user) {
      throw new NotFoundException('The linked login account was not found');
    }

    // 12 rounds, matching AuthService.changePassword.
    user.password = await bcrypt.hash(password, 12);
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return { email: user.email ?? null };
  }

  async searchParents(query: string, schoolId?: string | null): Promise<Parent[]> {
    const term = `%${query}%`;
    const qb = this.parentRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.user', 'user')
      .leftJoinAndSelect('parent.students', 'students');

    const nameMatch = new Brackets((w) => {
      w.where('parent.firstName ILIKE :query', { query: term })
        .orWhere('parent.lastName ILIKE :query', { query: term })
        .orWhere('parent.first_name_ar ILIKE :query', { query: term })
        .orWhere('parent.first_name_en ILIKE :query', { query: term })
        .orWhere('parent.last_name_ar ILIKE :query', { query: term })
        .orWhere('parent.last_name_en ILIKE :query', { query: term })
        .orWhere('parent.email ILIKE :query', { query: term })
        .orWhere('parent.phone ILIKE :query', { query: term })
        .orWhere('parent.civil_id ILIKE :query', { query: term });
    });

    const inSchool = sanitizeUserDeep(
      await this.scopeQuery(qb, schoolId).andWhere(nameMatch).getMany(),
    );

    const identifier = await this.findExistingParent({
      civil_id: query,
      email: query,
      phone: query,
    });
    if (!identifier) return inSchool;
    if (inSchool.some((row) => row.id === identifier.id)) return inSchool;
    return sanitizeUserDeep([identifier, ...inSchool]);
  }

  private normalizeRelationship(value?: string | null): ParentRelationship {
    if (value === 'father' || value === 'mother' || value === 'guardian') return value;
    return 'guardian';
  }

  private async linkStudentParent(
    parentId: string,
    studentId: string,
    relationship: ParentRelationship,
  ): Promise<void> {
    const rel = this.normalizeRelationship(relationship);
    await this.parentRepository.query(
      `DELETE FROM student_parents WHERE student_id = $1 AND parent_id = $2`,
      [studentId, parentId],
    );
    await this.parentRepository.query(
      `INSERT INTO student_parents (student_id, parent_id, relationship) VALUES ($1, $2, $3)`,
      [studentId, parentId, rel],
    );
  }

  async assignToStudent(
    parentId: string,
    studentId: string,
    schoolId?: string | null,
    relationship: ParentRelationship = 'guardian',
  ): Promise<Parent> {
    await this.findById(parentId);
    const student = await this.studentRepository.findOne({
      where: schoolId == null ? { id: studentId } : { id: studentId, school_id: schoolId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (schoolId != null && String(student.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Student not in your school');
    }

    await this.linkStudentParent(parentId, studentId, relationship);
    return this.findOne(parentId, schoolId);
  }

  async removeFromStudent(
    parentId: string,
    studentId: string,
    schoolId?: string | null,
  ): Promise<Parent> {
    await this.findOne(parentId, schoolId);
    const student = await this.studentRepository.findOne({
      where: schoolId == null ? { id: studentId } : { id: studentId, school_id: schoolId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (schoolId != null && String(student.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Student not in your school');
    }

    await this.parentRepository.query(
      `DELETE FROM student_parents WHERE parent_id = $1 AND student_id = $2`,
      [parentId, studentId],
    );

    return this.findOne(parentId, schoolId);
  }

  async getParentDashboardData(userId: string): Promise<any> {
    try {
      // Prefer linked parent profile; fall back only when no parents.user_id row exists.
      let parentRecord = await this.parentRepository.findOne({
        where: { user: { id: userId } },
        relations: ['students', 'students.groups', 'students.parents']
      });

      // If the ManyToMany relation is empty but student_parents has rows (extra join columns),
      // reload children via the join table — same source of truth as fee access checks.
      if (parentRecord && (!parentRecord.students || parentRecord.students.length === 0)) {
        const linked = await this.studentRepository
          .createQueryBuilder('student')
          .innerJoin('student_parents', 'sp', 'sp.student_id = student.id')
          .innerJoin('parents', 'p', 'p.id = sp.parent_id')
          .leftJoinAndSelect('student.groups', 'group')
          .leftJoinAndSelect('student.parents', 'parent')
          .where('p.user_id = :userId', { userId })
          .getMany();
        if (linked.length) {
          parentRecord.students = linked;
        }
      }

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

      const weeklyPlans = await this.weeklyPlansForGroupIds(
        allGroups.map((g) => String(g.id)),
      );

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
          groupNames: student.groups?.map(g => g.name).join(', ') || ''
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

  /** Same source as the parent timetable: class groups → `weekly_session_plans` via `schedules`. */
  private async weeklyPlansForGroupIds(groupIds: string[]): Promise<WeeklySessionPlan[]> {
    const ids = [...new Set(groupIds.filter(Boolean))];
    if (!ids.length) return [];
    return this.weeklySessionPlanRepository
      .createQueryBuilder('wsp')
      .leftJoinAndSelect('wsp.schedule', 'schedule')
      .leftJoinAndSelect('schedule.group', 'group')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('schedule.teacher', 'teacher')
      .where('schedule.group_id IN (:...ids)', { ids })
      .andWhere("(schedule.status IS NULL OR schedule.status = 'active')")
      .orderBy('wsp.week_start_date', 'DESC')
      .getMany();
  }

  private mapParentChildren(students: Student[]) {
    return (students || []).map((student) => ({
      ...student,
      groupNames: student.groups?.map((g) => g.name).join(', ') || '',
    }));
  }

  /**
   * Parent-self weekly plans for `/parent/weekly-plans`.
   * Scoped by linked children and their timetable groups — no JWT school.
   */
  async getParentWeeklyPlans(userId: string): Promise<{
    children: Array<Student & { groupNames: string }>;
    weeklyPlans: WeeklySessionPlan[];
  }> {
    const students = await this.getChildrenForParentUser(userId);
    const groupIds = [
      ...new Set(
        students.flatMap((s) => (s.groups || []).map((g) => String(g.id))),
      ),
    ];
    const weeklyPlans = await this.weeklyPlansForGroupIds(groupIds);
    return {
      children: this.mapParentChildren(students),
      weeklyPlans,
    };
  }

  private async getChildrenForParentUser(userId: string): Promise<Student[]> {
    let parentRecord = await this.parentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['students', 'students.groups'],
    });

    if (parentRecord && (!parentRecord.students || parentRecord.students.length === 0)) {
      const linked = await this.studentRepository
        .createQueryBuilder('student')
        .innerJoin('student_parents', 'sp', 'sp.student_id = student.id')
        .innerJoin('parents', 'p', 'p.id = sp.parent_id')
        .leftJoinAndSelect('student.groups', 'group')
        .where('p.user_id = :userId', { userId })
        .getMany();
      if (linked.length) return linked;
    }

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
          id: string;
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
        id: string;
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
   * Bus boarding / drop-off log lines for the parent's children.
   * Optional `schoolId` narrows to one school; otherwise all linked children.
   * Optional `date` (YYYY-MM-DD) filters by trip day; otherwise returns the latest `limit` rows.
   */
  async getParentBusMovementLogs(
    userId: string,
    options?: { schoolId?: string | null; date?: string; limit?: number },
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

    const schoolFilter =
      options?.schoolId != null && String(options.schoolId).trim() !== ''
        ? String(options.schoolId)
        : null;

    const students = await this.getChildrenForParentUser(userId);
    const studentIds = students
      .filter((s) => (schoolFilter == null ? true : s.school_id != null && String(s.school_id) === schoolFilter))
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
      .orderBy('log.logged_at', 'DESC')
      .take(limit);

    if (schoolFilter) {
      qb.andWhere('bus.school_id = :sid', { sid: schoolFilter });
    }

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