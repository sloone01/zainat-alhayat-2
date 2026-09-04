import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { OnlineVideoSession } from '../entities/online-video-session.entity';
import { OnlineSessionPresence } from '../entities/online-session-presence.entity';
import { Schedule } from '../entities/schedule.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { CreateOnlineSessionDto, ListSessionAttendanceRecordsQueryDto } from '../dto/online-session.dto';
import { OnlineSessionStudentAttendanceService } from './online-session-student-attendance.service';
import { OnlineSessionStudentAttendance } from '../entities/online-session-student-attendance.entity';
import {
  OnlineSessionParticipation,
  normalizeParticipationStatus,
} from '../constants/online-session-participation';

const DAY_ORDER = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

@Injectable()
export class OnlineSessionService {
  constructor(
    @InjectRepository(OnlineVideoSession)
    private readonly sessionRepo: Repository<OnlineVideoSession>,
    @InjectRepository(OnlineSessionPresence)
    private readonly presenceRepo: Repository<OnlineSessionPresence>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(OnlineSessionStudentAttendance)
    private readonly ossaRepo: Repository<OnlineSessionStudentAttendance>,
    private readonly config: ConfigService,
    private readonly onlineStudentAttendance: OnlineSessionStudentAttendanceService,
  ) {}

  private ensureDailyKey(): string {
    const key = this.config.get<string>('DAILY_API_KEY');
    if (!key?.trim()) {
      throw new BadRequestException(
        'Online sessions are not configured. Set DAILY_API_KEY (Daily.co → Developers → API key).',
      );
    }
    return key.trim();
  }

  private async dailyApi<T>(path: string, init?: RequestInit): Promise<T> {
    const key = this.ensureDailyKey();
    const res = await fetch(`https://api.daily.co/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string>),
      },
    });
    const text = await res.text();
    if (!res.ok) {
      throw new BadRequestException(`Daily API ${res.status}: ${text.slice(0, 500)}`);
    }
    return (text ? JSON.parse(text) : {}) as T;
  }

  sessionDateForWeek(weekStart: string, dayOfWeek: string): string {
    const idx = DAY_ORDER.indexOf(dayOfWeek.toLowerCase().trim());
    if (idx < 0) {
      throw new BadRequestException(`Invalid day_of_week: ${dayOfWeek}`);
    }
    const [y, m, d] = weekStart.split('-').map(Number);
    const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    base.setUTCDate(base.getUTCDate() + idx);
    return base.toISOString().slice(0, 10);
  }

  private async assertCanJoin(user: User, schedule: Schedule): Promise<void> {
    if (user.role === 'admin') return;
    if (schedule.teacher_id === user.id) return;
    if (user.role === 'parent' && schedule.group_id) {
      const ok = await this.parentHasStudentInGroup(user.id, schedule.group_id);
      if (ok) return;
    }
    throw new ForbiddenException('You cannot access this online session');
  }

  private async parentHasStudentInGroup(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    const cnt = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g')
      .innerJoin('s.parents', 'p')
      .where('g.id = :gid', { gid: groupId })
      .andWhere('p.user_id = :uid', { uid: userId })
      .getCount();
    return cnt > 0;
  }

  private displayName(user: User): string {
    const n = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return (n || user.email || user.username || 'Guest').slice(0, 80);
  }

  async createOrGetSession(user: User, dto: CreateOnlineSessionDto) {
    const schedule = await this.scheduleRepo.findOne({ where: { id: dto.schedule_id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (!(user.role === 'admin' || schedule.teacher_id === user.id)) {
      throw new ForbiddenException('Only the assigned teacher or admin can create an online room');
    }

    const session_date = this.sessionDateForWeek(dto.week_start_date, schedule.day_of_week);

    let session = await this.sessionRepo.findOne({
      where: { schedule_id: schedule.id, session_date },
    });
    let created = false;

    if (!session) {
      const roomName = `zinat${randomUUID().replace(/-/g, '').slice(0, 20)}`;
      const room = await this.dailyApi<{ name: string; url: string }>('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: roomName,
          privacy: 'private',
        }),
      });

      session = this.sessionRepo.create({
        schedule_id: schedule.id,
        week_start_date: dto.week_start_date,
        session_date,
        provider: 'daily',
        room_name: room.name,
        room_url: room.url,
        created_by: user.id,
      });
      await this.sessionRepo.save(session);
      created = true;
    }

    const tokenPayload = await this.mintJoinToken(user, session.id);

    return {
      created,
      session: {
        id: session.id,
        schedule_id: session.schedule_id,
        week_start_date: session.week_start_date,
        session_date: session.session_date,
        room_url: session.room_url,
        room_name: session.room_name,
      },
      ...tokenPayload,
    };
  }

  async resolve(user: User, scheduleId: string, weekStart: string) {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    await this.assertCanJoin(user, schedule);

    const session_date = this.sessionDateForWeek(weekStart, schedule.day_of_week);
    const session = await this.sessionRepo.findOne({
      where: { schedule_id: scheduleId, session_date },
    });

    return {
      session: session
        ? {
            id: session.id,
            schedule_id: session.schedule_id,
            week_start_date: session.week_start_date,
            session_date: session.session_date,
            room_url: session.room_url,
            room_name: session.room_name,
          }
        : null,
    };
  }

  async mintJoinToken(user: User, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['schedule'],
    });
    if (!session || !session.schedule) {
      throw new NotFoundException('Online session not found');
    }

    await this.assertCanJoin(user, session.schedule);

    const isOwner = user.role === 'admin' || session.schedule.teacher_id === user.id;
    const displayName = this.displayName(user);

    const tokenRes = await this.dailyApi<{ token: string }>('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: session.room_name,
          user_name: displayName,
          is_owner: isOwner,
        },
      }),
    });

    return {
      token: tokenRes.token,
      room_url: session.room_url,
      session_id: session.id,
      is_owner: isOwner,
    };
  }

  async logPresence(user: User, sessionId: string, action: 'join' | 'leave') {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['schedule'],
    });
    if (!session?.schedule) {
      throw new NotFoundException('Online session not found');
    }
    await this.assertCanJoin(user, session.schedule);

    if (action === 'join') {
      const row = this.presenceRepo.create({
        online_session_id: sessionId,
        user_id: user.id,
        display_name: this.displayName(user),
        joined_at: new Date(),
        left_at: null,
      });
      await this.presenceRepo.save(row);
      await this.onlineStudentAttendance.recordPresentForParent(session, session.schedule, user);
    } else {
      await this.presenceRepo
        .createQueryBuilder()
        .update(OnlineSessionPresence)
        .set({ left_at: new Date() })
        .where('online_session_id = :sid', { sid: sessionId })
        .andWhere('user_id = :uid', { uid: user.id })
        .andWhere('left_at IS NULL')
        .execute();
    }

    return { ok: true };
  }

  async getAttendance(user: User, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['schedule'],
    });
    if (!session?.schedule) {
      throw new NotFoundException('Online session not found');
    }
    if (!(user.role === 'admin' || session.schedule.teacher_id === user.id)) {
      throw new ForbiddenException('Only the teacher can view attendance');
    }

    const rows = await this.presenceRepo.find({
      where: { online_session_id: sessionId },
      relations: ['user'],
      order: { joined_at: 'ASC' },
    });

    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      display_name: r.display_name,
      joined_at: r.joined_at,
      left_at: r.left_at,
      email: r.user?.email,
      role: r.user?.role,
    }));
  }

  /** Delegates to automatic student attendance module */
  listStudentRoll(user: User, sessionId: string) {
    return this.onlineStudentAttendance.listStudentAttendanceForSession(user, sessionId);
  }

  /**
   * Online sessions that have at least one student attendance row or a presence join.
   * For admin (school) or assigned teacher only.
   */
  async listAttendanceRecords(user: User, query: ListSessionAttendanceRecordsQueryDto) {
    if (user.role !== 'admin' && user.role !== 'teacher') {
      throw new ForbiddenException('Not allowed to list session attendance');
    }

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.schedule', 'schedule')
      .leftJoinAndSelect('schedule.group', 'group')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('schedule.teacher', 'teacher')
      .where(
        `(
          EXISTS (
            SELECT 1 FROM online_session_student_attendance ossa
            WHERE ossa.online_session_id = session.id
          )
          OR EXISTS (
            SELECT 1 FROM online_session_presence osp
            WHERE osp.online_session_id = session.id
          )
        )`,
      );

    if (user.role === 'teacher') {
      qb.andWhere('schedule.teacher_id = :teacherId', { teacherId: user.id });
    }

    if (query.school_id != null) {
      qb.andWhere('group.school_id = :schoolId', { schoolId: query.school_id });
    }
    if (query.group_id) {
      qb.andWhere('schedule.group_id = :groupId', { groupId: query.group_id });
    }
    if (query.from_date) {
      qb.andWhere('session.session_date >= :fromDate', { fromDate: query.from_date });
    }
    if (query.to_date) {
      qb.andWhere('session.session_date <= :toDate', { toDate: query.to_date });
    }

    qb.orderBy('session.session_date', 'DESC').addOrderBy('schedule.start_time', 'DESC');

    const sessions = await qb.getMany();
    if (!sessions.length) return [];

    const sessionIds = sessions.map((s) => s.id);
    const presenceCounts = await this.presenceRepo
      .createQueryBuilder('p')
      .select('p.online_session_id', 'session_id')
      .addSelect('COUNT(*)', 'cnt')
      .where('p.online_session_id IN (:...sessionIds)', { sessionIds })
      .groupBy('p.online_session_id')
      .getRawMany<{ session_id: string; cnt: string }>();

    const presenceBySession = new Map(
      presenceCounts.map((r) => [r.session_id, Number(r.cnt) || 0]),
    );

    const attendanceRows = await this.ossaRepo.find({
      where: { online_session_id: In(sessionIds) },
    });
    const bySession = new Map<string, OnlineSessionStudentAttendance[]>();
    for (const row of attendanceRows) {
      const list = bySession.get(row.online_session_id) ?? [];
      list.push(row);
      bySession.set(row.online_session_id, list);
    }

    return sessions.map((session) => {
      const sch = session.schedule;
      const finalized = Boolean(session.attendance_finalized_at);
      const rows = bySession.get(session.id) ?? [];
      let attended = 0;
      let notAttended = 0;
      let pending = 0;
      for (const r of rows) {
        const st = normalizeParticipationStatus(r.status, finalized);
        if (st === OnlineSessionParticipation.ATTENDED) attended += 1;
        else if (st === OnlineSessionParticipation.NOT_ATTENDED) notAttended += 1;
        else pending += 1;
      }

      const teacher = sch?.teacher;
      const teacherName = teacher
        ? [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').trim()
        : null;

      return {
        id: session.id,
        session_date: String(session.session_date).slice(0, 10),
        week_start_date: String(session.week_start_date).slice(0, 10),
        schedule_id: session.schedule_id,
        group_id: sch?.group_id ?? null,
        group_name: sch?.group?.name ?? null,
        course_name: sch?.course?.title ?? sch?.course?.name ?? null,
        day_of_week: sch?.day_of_week ?? null,
        start_time: sch?.start_time ?? null,
        end_time: sch?.end_time ?? null,
        teacher_name: teacherName,
        attendance_finalized: finalized,
        presence_join_count: presenceBySession.get(session.id) ?? 0,
        student_record_count: rows.length,
        attended_count: attended,
        not_attended_count: notAttended,
        pending_count: pending,
      };
    });
  }
}
