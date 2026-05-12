import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OnlineVideoSession } from '../entities/online-video-session.entity';
import { OnlineSessionStudentAttendance } from '../entities/online-session-student-attendance.entity';
import { Schedule } from '../entities/schedule.entity';
import { Student } from '../entities/student.entity';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import {
  OnlineSessionParticipation,
  normalizeParticipationStatus,
} from '../constants/online-session-participation';

const FINALIZE_GRACE_MS = 15 * 60 * 1000;
const TICK_MS = 5 * 60 * 1000;

@Injectable()
export class OnlineSessionStudentAttendanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OnlineSessionStudentAttendanceService.name);
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @InjectRepository(OnlineVideoSession)
    private readonly sessionRepo: Repository<OnlineVideoSession>,
    @InjectRepository(OnlineSessionStudentAttendance)
    private readonly ossaRepo: Repository<OnlineSessionStudentAttendance>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => {
      void this.finalizePastSessions().catch((e) =>
        this.logger.warn(`finalizePastSessions: ${e?.message || e}`),
      );
    }, TICK_MS);
    void this.finalizePastSessions().catch(() => undefined);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /** Calendar date + schedule end_time in server local timezone */
  private combineSessionEnd(sessionDate: Date | string, endTime: string): Date {
    const ds =
      typeof sessionDate === 'string'
        ? sessionDate.slice(0, 10)
        : sessionDate.toISOString().slice(0, 10);
    const [y, m, d] = ds.split('-').map(Number);
    const parts = String(endTime).split(':');
    const hh = Number(parts[0] ?? 0);
    const mm = Number(parts[1] ?? 0);
    const ss = Number(parts[2] ?? 0);
    return new Date(y, m - 1, d, hh, mm, ss);
  }

  /** Parent joined call → mark linked students attended for this online session row only */
  async recordPresentForParent(session: OnlineVideoSession, schedule: Schedule, user: User): Promise<void> {
    if (user.role !== 'parent' || !schedule.group_id) return;

    const students = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.parents', 'p')
      .innerJoin('s.groups', 'g')
      .where('p.user_id = :uid', { uid: user.id })
      .andWhere('g.id = :gid', { gid: schedule.group_id })
      .getMany();

    for (const st of students) {
      let row = await this.ossaRepo.findOne({
        where: { online_session_id: session.id, student_id: st.id },
      });
      if (!row) {
        row = this.ossaRepo.create({
          online_session_id: session.id,
          student_id: st.id,
          status: OnlineSessionParticipation.ATTENDED,
        });
      } else {
        row.status = OnlineSessionParticipation.ATTENDED;
      }
      await this.ossaRepo.save(row);
    }
  }

  async finalizePastSessions(): Promise<void> {
    const sessions = await this.sessionRepo.find({
      where: { attendance_finalized_at: IsNull() },
      relations: ['schedule'],
    });

    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);
    const oldest = new Date();
    oldest.setDate(oldest.getDate() - 45);
    const oldestStr = oldest.toISOString().slice(0, 10);

    for (const session of sessions) {
      const sch = session.schedule;
      if (!sch?.group_id || !sch.end_time) continue;

      const sd = String(session.session_date).slice(0, 10);
      if (sd > todayStr || sd < oldestStr) continue;

      const endAt = this.combineSessionEnd(session.session_date, sch.end_time).getTime();
      if (now < endAt + FINALIZE_GRACE_MS) continue;

      const group = await this.groupRepo.findOne({
        where: { id: sch.group_id },
        relations: ['students'],
      });
      const students = group?.students ?? [];

      for (const st of students) {
        const has = await this.ossaRepo.findOne({
          where: { online_session_id: session.id, student_id: st.id },
        });
        if (!has) {
          await this.ossaRepo.save(
            this.ossaRepo.create({
              online_session_id: session.id,
              student_id: st.id,
              status: OnlineSessionParticipation.NOT_ATTENDED,
            }),
          );
        }
      }

      session.attendance_finalized_at = new Date();
      await this.sessionRepo.save(session);
    }
  }

  async listStudentAttendanceForSession(viewer: User, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['schedule'],
    });
    if (!session?.schedule) throw new NotFoundException('Online session not found');
    if (!(viewer.role === 'admin' || session.schedule.teacher_id === viewer.id)) {
      throw new ForbiddenException('Only the teacher can view student attendance');
    }

    const gid = session.schedule.group_id;
    const group = gid
      ? await this.groupRepo.findOne({ where: { id: gid }, relations: ['students'] })
      : null;
    const students = group?.students ?? [];

    const rows = await this.ossaRepo.find({
      where: { online_session_id: sessionId },
      relations: ['student'],
    });
    const byStudent = new Map(rows.map((r) => [r.student_id, r]));

    const finalized = Boolean(session.attendance_finalized_at);

    return students.map((st) => {
      const r = byStudent.get(st.id);
      const status = normalizeParticipationStatus(r?.status, finalized);
      return {
        id: r?.id ?? `pending-${st.id}`,
        student_id: st.id,
        status,
        student_name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || null,
        updated_at: r?.updated_at ?? session.updated_at,
      };
    });
  }
}
