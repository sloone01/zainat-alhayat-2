import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Course } from '../entities/course.entity';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleLessonDemand } from '../entities/schedule-lesson-demand.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';
import { ClassSettingsService } from './class-settings.service';
import {
  CreateScheduleLessonDemandDto,
  GenerateTimetableDto,
  ReplaceScheduleLessonDemandsDto,
  UpdateScheduleLessonDemandDto,
} from '../dto/schedule-auto.dto';
import {
  hmToMinutes,
  minutesToHm,
  OccupiedInterval,
  SolverLesson,
  SolverPlacement,
  SolverSlot,
  solveTimetable,
} from './schedule-auto-solver';

const DEFAULT_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

const DEFAULT_STARTS = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'];

@Injectable()
export class ScheduleAutoService {
  constructor(
    @InjectRepository(ScheduleLessonDemand)
    private readonly demandRepo: Repository<ScheduleLessonDemand>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly classSettings: ClassSettingsService,
    private readonly dataSource: DataSource,
  ) {}

  requireSchool(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  async listDemands(user: User, groupId: string, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    await this.loadGroup(user, schoolId, groupId);
    return this.demandRepo.find({
      where: { school_id: schoolId, group_id: groupId },
      relations: ['course', 'teacher'],
      order: { created_at: 'ASC' },
    });
  }

  async createDemand(user: User, dto: CreateScheduleLessonDemandDto, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    await this.loadGroup(user, schoolId, dto.group_id);
    await this.assertCourse(schoolId, dto.course_id);
    await this.assertTeacher(schoolId, dto.teacher_id);

    const existing = await this.demandRepo.findOne({
      where: {
        school_id: schoolId,
        group_id: dto.group_id,
        course_id: dto.course_id,
        teacher_id: dto.teacher_id,
      },
    });
    if (existing) {
      throw new ConflictException('DUPLICATE_DEMAND');
    }

    const row = this.demandRepo.create({
      school_id: schoolId,
      group_id: dto.group_id,
      course_id: dto.course_id,
      teacher_id: dto.teacher_id,
      periods_per_week: dto.periods_per_week,
    });
    try {
      const saved = await this.demandRepo.save(row);
      return this.demandRepo.findOne({
        where: { id: saved.id },
        relations: ['course', 'teacher'],
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('DUPLICATE_DEMAND');
      }
      throw error;
    }
  }

  async updateDemand(
    user: User,
    id: string,
    dto: UpdateScheduleLessonDemandDto,
    requestedSchoolId?: string | null,
  ) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    const demand = await this.loadDemand(user, schoolId, id);
    if (dto.course_id) {
      await this.assertCourse(schoolId, dto.course_id);
      demand.course_id = dto.course_id;
    }
    if (dto.teacher_id) {
      await this.assertTeacher(schoolId, dto.teacher_id);
      demand.teacher_id = dto.teacher_id;
    }
    if (dto.periods_per_week != null) {
      demand.periods_per_week = dto.periods_per_week;
    }
    try {
      await this.demandRepo.save(demand);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('DUPLICATE_DEMAND');
      }
      throw error;
    }
    return this.demandRepo.findOne({
      where: { id: demand.id },
      relations: ['course', 'teacher'],
    });
  }

  async deleteDemand(user: User, id: string, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    const demand = await this.loadDemand(user, schoolId, id);
    await this.demandRepo.remove(demand);
  }

  async replaceDemands(
    user: User,
    dto: ReplaceScheduleLessonDemandsDto,
    requestedSchoolId?: string | null,
  ) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    await this.loadGroup(user, schoolId, dto.group_id);

    const seen = new Set<string>();
    for (const item of dto.items || []) {
      const key = `${item.course_id}:${item.teacher_id}`;
      if (seen.has(key)) {
        throw new ConflictException('DUPLICATE_DEMAND');
      }
      seen.add(key);
      await this.assertCourse(schoolId, item.course_id);
      await this.assertTeacher(schoolId, item.teacher_id);
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ScheduleLessonDemand, { school_id: schoolId, group_id: dto.group_id });
      if (!dto.items?.length) return [];
      const rows = dto.items.map((item) =>
        manager.create(ScheduleLessonDemand, {
          school_id: schoolId,
          group_id: dto.group_id,
          course_id: item.course_id,
          teacher_id: item.teacher_id,
          periods_per_week: item.periods_per_week,
        }),
      );
      try {
        await manager.save(rows);
      } catch (error) {
        if (this.isUniqueViolation(error)) {
          throw new ConflictException('DUPLICATE_DEMAND');
        }
        throw error;
      }
      return manager.find(ScheduleLessonDemand, {
        where: { school_id: schoolId, group_id: dto.group_id },
        relations: ['course', 'teacher'],
        order: { created_at: 'ASC' },
      });
    });
  }

  async generate(user: User, dto: GenerateTimetableDto, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    await this.loadGroup(user, schoolId, dto.group_id);

    const demands = await this.demandRepo.find({
      where: { school_id: schoolId, group_id: dto.group_id },
      relations: ['course', 'teacher'],
      order: { created_at: 'ASC' },
    });
    const lessons = this.expandLessons(demands);
    const days = (dto.days?.length ? dto.days : DEFAULT_DAYS).map((day) => day.toLowerCase());
    const slots = await this.resolveSlots(schoolId, days, dto.slots);

    const occupied = await this.occupiedTeacherIntervals(schoolId, dto.group_id);
    const result = solveTimetable({ lessons, slots, occupied });
    if (!result.ok) {
      throw this.solverError(result, demands);
    }

    const placements = this.withRelations(result.placements, demands);
    if (!dto.apply) {
      return { applied: false, placements };
    }

    const saved = await this.applyPlacements(dto.group_id, result.placements);
    return { applied: true, placements: this.withScheduleIds(placements, saved) };
  }

  private expandLessons(demands: ScheduleLessonDemand[]): SolverLesson[] {
    const lessons: SolverLesson[] = [];
    for (const demand of demands) {
      const count = Math.max(0, Number(demand.periods_per_week) || 0);
      for (let i = 0; i < count; i++) {
        lessons.push({
          demand_id: demand.id,
          group_id: demand.group_id,
          course_id: demand.course_id,
          teacher_id: demand.teacher_id,
        });
      }
    }
    return lessons;
  }

  private async resolveSlots(
    schoolId: string,
    days: string[],
    incoming?: { start_time: string; duration_minutes: number }[],
  ): Promise<SolverSlot[]> {
    let periods = (incoming || [])
      .map((slot) => ({
        start_time: minutesToHm(hmToMinutes(slot.start_time)),
        duration_minutes: Number(slot.duration_minutes),
      }))
      .filter((slot) => Number.isFinite(hmToMinutes(slot.start_time)) && slot.duration_minutes > 0);

    if (!periods.length) {
      const settings = await this.classSettings.getAvailableTimeSlots(schoolId);
      const duration = settings.defaultDuration || 45;
      const starts = settings.startTimes.length
        ? settings.startTimes.map((time) => String(time).slice(0, 5))
        : DEFAULT_STARTS;
      periods = starts.map((start_time) => ({
        start_time,
        duration_minutes: duration,
      }));
    }

    const slots: SolverSlot[] = [];
    for (const day of days) {
      for (const period of periods) {
        slots.push({ day, start_time: period.start_time, duration_minutes: period.duration_minutes });
      }
    }
    return slots;
  }

  private async occupiedTeacherIntervals(schoolId: string, groupId: string): Promise<OccupiedInterval[]> {
    const rows = await this.scheduleRepo.find({
      where: { status: 'active' },
      relations: ['group'],
    });
    const occupied: OccupiedInterval[] = [];
    for (const row of rows) {
      if (!row.teacher_id || row.group_id === groupId) continue;
      if (row.group?.school_id && String(row.group.school_id) !== String(schoolId)) continue;
      const start_min = hmToMinutes(String(row.start_time));
      const end_min = hmToMinutes(String(row.end_time));
      if (!Number.isFinite(start_min) || !Number.isFinite(end_min) || end_min <= start_min) continue;
      occupied.push({
        teacher_id: row.teacher_id,
        day: String(row.day_of_week || '').toLowerCase(),
        start_min,
        end_min,
      });
    }
    return occupied;
  }

  private async applyPlacements(groupId: string, placements: SolverPlacement[]): Promise<Schedule[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(Schedule, { group_id: groupId, status: 'active' });
      const rows = placements.map((placement) =>
        manager.create(Schedule, {
          day_of_week: placement.day_of_week,
          start_time: placement.start_time,
          end_time: placement.end_time,
          duration_minutes: placement.duration_minutes,
          group_id: groupId,
          course_id: placement.course_id,
          teacher_id: placement.teacher_id,
          is_recurring: true,
          status: 'active',
        }),
      );
      if (!rows.length) return [];
      return manager.save(rows);
    });
  }

  private withRelations(placements: SolverPlacement[], demands: ScheduleLessonDemand[]) {
    const byId = new Map(demands.map((demand) => [demand.id, demand]));
    return placements.map((placement) => {
      const demand = byId.get(placement.demand_id);
      return {
        ...placement,
        course: demand?.course || null,
        teacher: demand?.teacher || null,
      };
    });
  }

  private withScheduleIds(
    placements: Array<SolverPlacement & { course?: Course | null; teacher?: User | null }>,
    saved: Schedule[],
  ) {
    const used = new Set<string>();
    return placements.map((placement) => {
      const match = saved.find((row) => {
        if (used.has(row.id)) return false;
        return (
          row.day_of_week === placement.day_of_week &&
          String(row.start_time).slice(0, 5) === placement.start_time &&
          row.course_id === placement.course_id &&
          row.teacher_id === placement.teacher_id
        );
      });
      if (match) used.add(match.id);
      return { ...placement, id: match?.id || null };
    });
  }

  private solverError(
    result: Extract<ReturnType<typeof solveTimetable>, { ok: false }>,
    demands: ScheduleLessonDemand[],
  ) {
    if (result.code === 'GROUP_OVERLOAD') {
      return new BadRequestException({
        message: 'GROUP_OVERLOAD',
        needed: result.needed,
        available: result.available,
      });
    }
    if (result.code === 'TEACHER_OVERLOAD') {
      const demand = demands.find((row) => row.teacher_id === result.teacher_id);
      const teacher = demand?.teacher;
      const teacherName = teacher
        ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.email
        : result.teacher_id;
      return new BadRequestException({
        message: 'TEACHER_OVERLOAD',
        teacherName,
        needed: result.needed,
        available: result.available,
      });
    }
    return new BadRequestException({ message: result.code });
  }

  private async loadGroup(user: User, schoolId: string, groupId: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    assertSameSchool(user, group.school_id);
    if (String(group.school_id) !== String(schoolId)) {
      throw new BadRequestException('Group is not in this school');
    }
    return group;
  }

  private async loadDemand(user: User, schoolId: string, id: string): Promise<ScheduleLessonDemand> {
    const demand = await this.demandRepo.findOne({ where: { id } });
    if (!demand) throw new NotFoundException('Demand not found');
    assertSameSchool(user, demand.school_id);
    if (String(demand.school_id) !== String(schoolId)) {
      throw new BadRequestException('Demand is not in this school');
    }
    return demand;
  }

  private async assertCourse(schoolId: string, courseId: string): Promise<Course> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (String(course.school_id) !== String(schoolId)) {
      throw new BadRequestException('Course is not in this school');
    }
    return course;
  }

  private async assertTeacher(schoolId: string, teacherId: string): Promise<User> {
    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.school_id && String(teacher.school_id) !== String(schoolId)) {
      throw new BadRequestException('Teacher is not in this school');
    }
    return teacher;
  }

  private isUniqueViolation(error: unknown): boolean {
    return Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === '23505',
    );
  }
}
