import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DirectChatThread } from '../entities/direct-chat-thread.entity';
import { DirectChatMessage } from '../entities/direct-chat-message.entity';
import { Parent } from '../entities/parent.entity';
import { Schedule } from '../entities/schedule.entity';
import { Student } from '../entities/student.entity';
import {
  MessageLetterRenderService,
  type LetterLocale,
} from '../services/message-letter-render.service';
import {
  MESSAGE_LETTER_SYSTEM_SENDER,
  messageLetterSenderName,
} from '../constants/message-letter-sender';

export interface DirectChatMessageDto {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  createdAt: string;
  senderName: string;
  metadata?: Record<string, unknown> | null;
}

export type ParentTeacherContactRow = {
  student_id: string;
  student_name: string;
  group_id: string;
  group_name: string;
  course_id: string;
  course_name: string;
  teacher_user_id: string;
  teacher_name: string;
};

export type DirectThreadSummary = {
  thread_id: string;
  other_user_id: string;
  other_name: string;
  other_role: string;
  last_message_at: string | null;
  last_message_preview: string | null;
};

export type SuggestedContactRow = {
  user_id: string;
  name: string;
  role: string;
  subtitle: string;
};

export type DirectApprovalInboxRow = {
  message_id: string;
  thread_id: string;
  letter_id: string;
  title: string;
  preview_text: string;
  sent_at: string;
  sender_user_id: string;
  sender_name: string;
  activity_id: string | null;
  activity_title: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_resolved_at: string | null;
  /** True when the inbox user is the recipient and the request is still pending. */
  can_approve: boolean;
};

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

@Injectable()
export class DirectChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DirectChatThread)
    private readonly threadRepo: Repository<DirectChatThread>,
    @InjectRepository(DirectChatMessage)
    private readonly messageRepo: Repository<DirectChatMessage>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly letterRender: MessageLetterRenderService,
  ) {}

  private toDto(row: DirectChatMessage, sender?: User): DirectChatMessageDto {
    const u = sender || row.user;
    const rawName = u
      ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
      : 'User';
    const senderName = messageLetterSenderName(
      row.metadata as Record<string, unknown> | null,
      rawName,
    );
    return {
      id: row.id,
      groupId: row.thread_id,
      userId: row.user_id,
      body: row.body,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      senderName,
      metadata: row.metadata ?? null,
    };
  }

  private sameSchool(a: User, b: User): boolean {
    if (a.school_id == null || b.school_id == null) return true;
    return a.school_id === b.school_id;
  }

  private async parentSharesGroupWithTeacher(
    parentUser: User,
    teacherUser: User,
  ): Promise<boolean> {
    const parent = await this.parentRepo.findOne({
      where: { user_id: parentUser.id },
      relations: ['students', 'students.groups'],
    });
    if (!parent?.students?.length) return false;
    const groupIds = new Set<string>();
    for (const st of parent.students) {
      for (const g of st.groups || []) {
        groupIds.add(g.id);
      }
    }
    if (!groupIds.size) return false;
    const n = await this.scheduleRepo.count({
      where: {
        teacher_id: teacherUser.id,
        group_id: In([...groupIds]),
        status: 'active',
      },
    });
    return n > 0;
  }

  private async teacherTeachesStudentGroup(
    teacherUser: User,
    studentUser: User,
  ): Promise<boolean> {
    const student = await this.studentRepo.findOne({
      where: { user_id: studentUser.id },
      relations: ['groups'],
    });
    if (!student?.groups?.length) return false;
    const gids = student.groups.map((g) => g.id);
    const c = await this.scheduleRepo.count({
      where: { teacher_id: teacherUser.id, group_id: In(gids), status: 'active' },
    });
    return c > 0;
  }

  private async studentSharesGroupWithPeer(a: User, b: User): Promise<boolean> {
    const sa = await this.studentRepo.findOne({
      where: { user_id: a.id },
      relations: ['groups'],
    });
    const sb = await this.studentRepo.findOne({
      where: { user_id: b.id },
      relations: ['groups'],
    });
    if (!sa?.groups?.length || !sb?.groups?.length) return false;
    const idsA = new Set(sa.groups.map((g) => g.id));
    return sb.groups.some((g) => idsA.has(g.id));
  }

  async assertPairCanMessage(requester: User, other: User): Promise<void> {
    if (requester.id === other.id) {
      throw new BadRequestException('Cannot message yourself');
    }
    if (!other.isActive) {
      throw new ForbiddenException('User is not active');
    }

    if (requester.role === 'admin' || other.role === 'admin') {
      if (!this.sameSchool(requester, other)) {
        throw new ForbiddenException('Cross-school messaging is not allowed');
      }
      return;
    }

    if (!this.sameSchool(requester, other)) {
      throw new ForbiddenException('Cross-school messaging is not allowed');
    }

    const r = requester.role;
    const o = other.role;

    if (r === 'teacher' && o === 'teacher') {
      return;
    }

    if (r === 'parent' && o === 'teacher') {
      const ok = await this.parentSharesGroupWithTeacher(requester, other);
      if (!ok) {
        throw new ForbiddenException(
          'You can only message teachers assigned to your children’s classes',
        );
      }
      return;
    }

    if (r === 'teacher' && o === 'parent') {
      // Teachers may start conversations with any parent in the same school.
      return;
    }

    if (r === 'student' && o === 'teacher') {
      const ok = await this.teacherTeachesStudentGroup(other, requester);
      if (!ok) {
        throw new ForbiddenException(
          'You can only message teachers for classes you belong to',
        );
      }
      return;
    }

    if (r === 'teacher' && o === 'student') {
      const ok = await this.teacherTeachesStudentGroup(requester, other);
      if (!ok) {
        throw new ForbiddenException(
          'You can only message students in your assigned groups',
        );
      }
      return;
    }

    if (r === 'student' && o === 'student') {
      const ok = await this.studentSharesGroupWithPeer(requester, other);
      if (!ok) {
        throw new ForbiddenException(
          'You can only message students who share a class with you',
        );
      }
      return;
    }

    throw new ForbiddenException('Direct messaging is not enabled for this pair');
  }

  async getUserOrThrow(id: string): Promise<User> {
    const u = await this.userRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async getOrCreateThread(a: User, b: User): Promise<DirectChatThread> {
    await this.assertPairCanMessage(a, b);
    const [low, high] = orderedPair(a.id, b.id);
    let thread = await this.threadRepo.findOne({
      where: { user_low_id: low, user_high_id: high },
    });
    if (thread) return thread;
    const schoolId = a.school_id ?? b.school_id ?? null;
    thread = this.threadRepo.create({
      user_low_id: low,
      user_high_id: high,
      school_id: schoolId,
    });
    return this.threadRepo.save(thread);
  }

  private async threadHasSchoolMessageLetter(threadId: string): Promise<boolean> {
    const rows: { ok: number }[] = await this.messageRepo.manager.query(
      `
      SELECT 1 AS ok
      FROM direct_chat_messages m
      WHERE m.thread_id = $1
        AND m.metadata->>'kind' = 'message_letter'
      LIMIT 1
      `,
      [threadId],
    );
    return rows.length > 0;
  }

  async assertThreadMember(user: User, threadId: string): Promise<DirectChatThread> {
    const t = await this.threadRepo.findOne({ where: { id: threadId } });
    if (!t) throw new NotFoundException('Thread not found');
    if (t.user_low_id === user.id || t.user_high_id === user.id) {
      return t;
    }
    if (
      user.role === 'admin' &&
      user.school_id != null &&
      t.school_id === user.school_id &&
      (await this.threadHasSchoolMessageLetter(threadId))
    ) {
      return t;
    }
    throw new ForbiddenException('You are not a participant in this conversation');
  }

  private async resolveThreadOtherUserId(
    user: User,
    thread: DirectChatThread,
  ): Promise<string> {
    if (thread.user_low_id === user.id) return thread.user_high_id;
    if (thread.user_high_id === user.id) return thread.user_low_id;

    const [low, high] = await Promise.all([
      this.userRepo.findOne({ where: { id: thread.user_low_id } }),
      this.userRepo.findOne({ where: { id: thread.user_high_id } }),
    ]);
    if (low?.role === 'parent') return low.id;
    if (high?.role === 'parent') return high.id;
    return thread.user_high_id;
  }

  async getThreadPeer(
    user: User,
    threadId: string,
  ): Promise<{ other_user_id: string; other_name: string; other_role: string }> {
    const t = await this.assertThreadMember(user, threadId);
    const otherId = await this.resolveThreadOtherUserId(user, t);
    const other = await this.getUserOrThrow(otherId);
    const name =
      `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.email;
    return {
      other_user_id: other.id,
      other_name: name,
      other_role: other.role,
    };
  }

  async getRecentMessages(threadId: string, limit = 80): Promise<DirectChatMessageDto[]> {
    const lim = Math.min(Math.max(limit, 1), 200);
    const rows = await this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.thread_id = :tid', { tid: threadId })
      .orderBy('m.created_at', 'DESC')
      .take(lim)
      .getMany();
    return rows.reverse().map((r) => this.toDto(r));
  }

  async resolveOfficialLetterSenderUser(schoolId: number): Promise<User> {
    const byUsername = await this.userRepo.findOne({
      where: {
        username: 'Admin',
        role: 'admin',
        school_id: schoolId,
        isActive: true,
      },
    });
    if (byUsername) return byUsername;
    const fallback = await this.userRepo.findOne({
      where: { role: 'admin', school_id: schoolId, isActive: true },
      order: { createdAt: 'ASC' },
    });
    if (!fallback) {
      throw new BadRequestException(
        'No active school admin found. Create a user with username "Admin" or add an admin for this school.',
      );
    }
    return fallback;
  }

  async saveMessage(
    user: User,
    threadId: string,
    body: string,
    metadata?: Record<string, unknown> | null,
  ): Promise<DirectChatMessageDto> {
    await this.assertThreadMember(user, threadId);
    const trimmed = body?.trim() || '';
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }
    if (trimmed.length > 4000) {
      throw new BadRequestException('Message is too long');
    }
    const row = this.messageRepo.create({
      thread_id: threadId,
      user_id: user.id,
      body: trimmed,
      metadata: metadata ?? null,
    });
    const saved = await this.messageRepo.save(row);
    const preview = trimmed.length > 200 ? `${trimmed.slice(0, 197)}...` : trimmed;
    await this.threadRepo.update(
      { id: threadId },
      {
        last_message_at: new Date(),
        last_message_preview: preview,
      },
    );
    const withUser = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return this.toDto(withUser!);
  }

  async listThreads(user: User): Promise<DirectThreadSummary[]> {
    const rows = await this.threadRepo
      .createQueryBuilder('t')
      .where('t.user_low_id = :uid OR t.user_high_id = :uid', { uid: user.id })
      .orderBy('t.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('t.updated_at', 'DESC')
      .getMany();

    const seen = new Set<string>();
    const out: DirectThreadSummary[] = [];

    const appendThread = async (t: DirectChatThread) => {
      if (seen.has(t.id)) return;
      seen.add(t.id);
      const otherId = await this.resolveThreadOtherUserId(user, t);
      const other = await this.userRepo.findOne({ where: { id: otherId } });
      const name = other
        ? `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.email
        : otherId;
      out.push({
        thread_id: t.id,
        other_user_id: otherId,
        other_name: name,
        other_role: other?.role || '',
        last_message_at: t.last_message_at
          ? (t.last_message_at as Date).toISOString()
          : null,
        last_message_preview: t.last_message_preview,
      });
    };

    for (const t of rows) {
      await appendThread(t);
    }

    if (user.role === 'admin' && user.school_id != null) {
      type LetterThreadRow = {
        thread_id: string;
        user_low_id: string;
        user_high_id: string;
        last_message_at: Date | string | null;
        last_message_preview: string | null;
      };
      const letterThreads: LetterThreadRow[] = await this.threadRepo.manager.query(
        `
        SELECT DISTINCT ON (t.id)
          t.id AS thread_id,
          t.user_low_id,
          t.user_high_id,
          t.last_message_at,
          t.last_message_preview
        FROM direct_chat_threads t
        INNER JOIN direct_chat_messages m ON m.thread_id = t.id
        WHERE t.school_id = $1
          AND m.metadata->>'kind' = 'message_letter'
        ORDER BY t.id, t.last_message_at DESC NULLS LAST
        `,
        [user.school_id],
      );
      for (const lr of letterThreads) {
        if (seen.has(lr.thread_id)) continue;
        const t = this.threadRepo.create({
          id: lr.thread_id,
          user_low_id: lr.user_low_id,
          user_high_id: lr.user_high_id,
          school_id: user.school_id,
          last_message_at:
            lr.last_message_at instanceof Date
              ? lr.last_message_at
              : lr.last_message_at
                ? new Date(lr.last_message_at)
                : null,
          last_message_preview: lr.last_message_preview,
        });
        await appendThread(t);
      }
    }

    out.sort((a, b) => {
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return tb - ta;
    });

    return out;
  }

  async listParentTeacherContacts(user: User): Promise<ParentTeacherContactRow[]> {
    if (user.role !== 'parent') {
      throw new ForbiddenException('Only parents use this listing');
    }
    const parent = await this.parentRepo.findOne({
      where: { user_id: user.id },
      relations: ['students', 'students.groups'],
    });
    if (!parent?.students?.length) return [];

    const allGroupIds = new Set<string>();
    for (const st of parent.students) {
      for (const g of st.groups || []) {
        allGroupIds.add(g.id);
      }
    }
    if (!allGroupIds.size) return [];

    const schedules = await this.scheduleRepo.find({
      where: { group_id: In([...allGroupIds]), status: 'active' },
      relations: ['course', 'teacher', 'group'],
    });

    const seen = new Set<string>();
    const out: ParentTeacherContactRow[] = [];

    for (const sch of schedules) {
      if (!sch.teacher_id || !sch.course_id || !sch.group_id) continue;
      for (const st of parent.students) {
        if (!st.groups?.some((g) => g.id === sch.group_id)) continue;
        const key = `${st.id}:${sch.group_id}:${sch.course_id}:${sch.teacher_id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const studentName =
          [st.firstName, st.lastName].filter(Boolean).join(' ').trim() || st.id;
        const teacher = sch.teacher;
        const teacherName = teacher
          ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() ||
            teacher.email
          : sch.teacher_id;
        out.push({
          student_id: st.id,
          student_name: studentName,
          group_id: sch.group_id,
          group_name: sch.group?.name || '',
          course_id: sch.course_id,
          course_name: sch.course?.name || sch.course?.title || '',
          teacher_user_id: sch.teacher_id,
          teacher_name: teacherName,
        });
      }
    }
    return out;
  }

  async listSuggestedContacts(requester: User): Promise<SuggestedContactRow[]> {
    const map = new Map<string, SuggestedContactRow>();

    const addUser = async (id: string, subtitle: string) => {
      if (!id || id === requester.id || map.has(id)) return;
      const u = await this.userRepo.findOne({ where: { id } });
      if (!u?.isActive) return;
      try {
        await this.assertPairCanMessage(requester, u);
      } catch {
        return;
      }
      const name =
        `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
      map.set(id, { user_id: id, name, role: u.role, subtitle });
    };

    if (requester.role === 'admin') {
      const where =
        requester.school_id != null ? { school_id: requester.school_id } : {};
      const users = await this.userRepo.find({
        where,
        take: 300,
        order: { firstName: 'ASC' },
      });
      for (const u of users) {
        await addUser(u.id, u.role);
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (requester.role === 'teacher') {
      const schedules = await this.scheduleRepo
        .createQueryBuilder('sch')
        .leftJoinAndSelect('sch.group', 'g')
        .leftJoinAndSelect('g.students', 'st')
        .leftJoinAndSelect('st.parents', 'par')
        .where('sch.teacher_id = :tid', { tid: requester.id })
        .andWhere('sch.status = :st', { st: 'active' })
        .getMany();
      for (const s of schedules) {
        for (const st of s.group?.students || []) {
          for (const p of st.parents || []) {
            if (p.user_id) await addUser(p.user_id, `Parent · ${st.firstName}`);
          }
          if (st.user_id) await addUser(st.user_id, `Student · ${st.firstName}`);
        }
      }
      const peerQb = this.userRepo
        .createQueryBuilder('u')
        .where('u.role = :r', { r: 'teacher' })
        .andWhere('u.id != :me', { me: requester.id });
      if (requester.school_id != null) {
        peerQb.andWhere('u.school_id = :sid', { sid: requester.school_id });
      }
      const peers = await peerQb.take(200).getMany();
      for (const u of peers) {
        await addUser(u.id, 'Teacher');
      }
      const adminQb = this.userRepo
        .createQueryBuilder('u')
        .where('u.role = :r', { r: 'admin' });
      if (requester.school_id != null) {
        adminQb.andWhere('(u.school_id = :sid OR u.school_id IS NULL)', {
          sid: requester.school_id,
        });
      }
      const admins = await adminQb.take(50).getMany();
      for (const u of admins) {
        await addUser(u.id, 'Admin');
      }

      const parentUsersQb = this.userRepo
        .createQueryBuilder('u')
        .where('u.role = :r', { r: 'parent' })
        .andWhere('u.isActive = true')
        .andWhere('u.id != :me', { me: requester.id });
      if (requester.school_id != null) {
        parentUsersQb.andWhere('u.school_id = :sid', { sid: requester.school_id });
      }
      const parentUsers = await parentUsersQb
        .orderBy('u.firstName', 'ASC')
        .addOrderBy('u.lastName', 'ASC')
        .take(500)
        .getMany();
      for (const u of parentUsers) {
        await addUser(u.id, 'Parent');
      }

      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (requester.role === 'parent') {
      const rows = await this.listParentTeacherContacts(requester);
      for (const r of rows) {
        await addUser(r.teacher_user_id, `${r.course_name} · ${r.student_name}`);
      }
      const adminQb = this.userRepo
        .createQueryBuilder('u')
        .where('u.role = :r', { r: 'admin' });
      if (requester.school_id != null) {
        adminQb.andWhere('(u.school_id = :sid OR u.school_id IS NULL)', {
          sid: requester.school_id,
        });
      }
      const admins = await adminQb.take(50).getMany();
      for (const u of admins) {
        await addUser(u.id, 'Admin');
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (requester.role === 'student') {
      const student = await this.studentRepo.findOne({
        where: { user_id: requester.id },
        relations: ['groups'],
      });
      if (!student?.groups?.length) return [];
      const gids = student.groups.map((g) => g.id);
      const schs = await this.scheduleRepo.find({
        where: { group_id: In(gids), status: 'active' },
        relations: ['teacher', 'course'],
      });
      for (const s of schs) {
        if (s.teacher_id) {
          await addUser(s.teacher_id, s.course?.name || 'Teacher');
        }
      }
      const classmates = await this.studentRepo
        .createQueryBuilder('st')
        .innerJoin('st.groups', 'g', 'g.id IN (:...gids)', { gids })
        .where('st.user_id IS NOT NULL')
        .andWhere('st.id != :sid', { sid: student.id })
        .getMany();
      for (const st of classmates) {
        if (st.user_id) await addUser(st.user_id, `Classmate · ${st.firstName}`);
      }
      const adminQb = this.userRepo
        .createQueryBuilder('u')
        .where('u.role = :r', { r: 'admin' });
      if (requester.school_id != null) {
        adminQb.andWhere('(u.school_id = :sid OR u.school_id IS NULL)', {
          sid: requester.school_id,
        });
      }
      const admins = await adminQb.take(50).getMany();
      for (const u of admins) {
        await addUser(u.id, 'Admin');
      }
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [];
  }

  private parseMessageLetterApproval(metadata: Record<string, unknown> | null): {
    status: 'pending' | 'approved' | 'rejected';
    resolved_at: string | null;
  } {
    const approval = metadata?.['approval'] as { status?: string; resolvedAt?: string } | undefined;
    const raw = approval?.status;
    if (raw === 'approved' || raw === 'rejected') {
      return { status: raw, resolved_at: approval?.resolvedAt ?? null };
    }
    return { status: 'pending', resolved_at: null };
  }

  /** Approval requests received by this user (not sent by them). */
  async listApprovalInbox(user: User, locale: LetterLocale = 'ar'): Promise<DirectApprovalInboxRow[]> {
    type RawRow = {
      message_id: string;
      thread_id: string;
      sender_user_id: string;
      sent_at: Date | string;
      metadata: Record<string, unknown> | null;
      letter_id: string | null;
      letter_title: string | null;
      activity_id: string | null;
      activity_title: string | null;
      sender_first_name: string | null;
      sender_last_name: string | null;
      sender_email: string | null;
    };

    const rows: RawRow[] = await this.messageRepo.manager.query(
      `
      SELECT
        m.id AS message_id,
        m.thread_id AS thread_id,
        m.user_id AS sender_user_id,
        m.created_at AS sent_at,
        m.metadata AS metadata,
        ml.id AS letter_id,
        ml.title AS letter_title,
        ml.activity_id AS activity_id,
        act.title AS activity_title,
        su."firstName" AS sender_first_name,
        su."lastName" AS sender_last_name,
        su.email AS sender_email
      FROM direct_chat_messages m
      INNER JOIN direct_chat_threads t ON t.id = m.thread_id
      LEFT JOIN school_message_letters ml ON ml.id::text = m.metadata->>'letterId'
      LEFT JOIN activities act ON act.id = ml.activity_id
      INNER JOIN users su ON su.id = m.user_id
      WHERE (t.user_low_id = $1 OR t.user_high_id = $1)
        AND m.user_id != $1
        AND m.metadata->>'kind' = 'message_letter'
        AND (
          COALESCE(m.metadata->>'requiresApproval', 'false') = 'true'
          OR (m.metadata->'requiresApproval')::text = 'true'
          OR m.metadata->'approval' IS NOT NULL
        )
      ORDER BY m.created_at DESC
      `,
      [user.id],
    );

    const mapped = rows.map((r) => {
      const meta =
        r.metadata && typeof r.metadata === 'object'
          ? r.metadata
          : typeof r.metadata === 'string'
            ? (JSON.parse(r.metadata) as Record<string, unknown>)
            : null;
      const titleFromMeta = meta ? String(meta['title'] ?? '') : '';
      const previewText = meta ? String(meta['previewText'] ?? '') : '';
      const letterIdFromMeta = meta ? String(meta['letterId'] ?? '') : '';
      const activityIdFromMeta = meta ? String(meta['activityId'] ?? '') : '';
      const { status, resolved_at } = this.parseMessageLetterApproval(meta);
      const senderName = MESSAGE_LETTER_SYSTEM_SENDER;
      const sent =
        r.sent_at instanceof Date ? r.sent_at.toISOString() : String(r.sent_at ?? '');

      return {
        message_id: r.message_id,
        thread_id: r.thread_id,
        letter_id: r.letter_id ?? letterIdFromMeta,
        title: (r.letter_title ?? titleFromMeta) || '—',
        preview_text: previewText,
        sent_at: sent,
        sender_user_id: r.sender_user_id,
        sender_name: senderName,
        activity_id: (r.activity_id ?? activityIdFromMeta) || null,
        activity_title: r.activity_title ?? null,
        approval_status: status,
        approval_resolved_at: resolved_at,
        can_approve: status === 'pending',
      };
    });

    const enriched = await Promise.all(
      mapped.map(async (row) => {
        try {
          const display = await this.letterRender.resolveDisplayForMessage(
            row.message_id,
            user.id,
            locale,
          );
          return {
            ...row,
            title: display.subject,
            preview_text: display.preview_text,
            activity_title: row.activity_title ?? display.activity_title,
          };
        } catch {
          return row;
        }
      }),
    );

    enriched.sort((a, b) => {
      const pendingA = a.approval_status === 'pending' ? 0 : 1;
      const pendingB = b.approval_status === 'pending' ? 0 : 1;
      if (pendingA !== pendingB) return pendingA - pendingB;
      return b.sent_at.localeCompare(a.sent_at);
    });

    return enriched;
  }

  async getRenderedMessageLetter(
    user: User,
    messageId: string,
    locale: LetterLocale = 'ar',
    recipientUserIdOverride?: string,
  ) {
    const msg = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    const thread = await this.threadRepo.findOne({ where: { id: msg.thread_id } });
    if (!thread) throw new NotFoundException('Thread not found');

    const isParticipant =
      thread.user_low_id === user.id || thread.user_high_id === user.id;

    if (!isParticipant && user.role === 'admin') {
      if (!recipientUserIdOverride) {
        throw new BadRequestException('recipient_user_id is required');
      }
      return this.letterRender.resolveDisplayForMessage(
        messageId,
        recipientUserIdOverride,
        locale,
      );
    }

    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this message');
    }

    const recipientUserId = msg.user_id !== user.id ? user.id : recipientUserIdOverride || user.id;

    return this.letterRender.resolveDisplayForMessage(messageId, recipientUserId, locale);
  }

  async resolveMessageLetterApproval(
    actor: User,
    messageId: string,
    decision: 'approve' | 'reject',
  ): Promise<DirectChatMessageDto> {
    const msg = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['user'],
    });
    if (!msg) throw new NotFoundException('Message not found');

    await this.assertThreadMember(actor, msg.thread_id);

    if (msg.user_id === actor.id) {
      throw new ForbiddenException('You cannot respond to your own official message');
    }

    const meta = msg.metadata as Record<string, unknown> | null;
    if (!meta || meta['kind'] !== 'message_letter') {
      throw new BadRequestException('Not an actionable message letter');
    }
    if (meta['requiresApproval'] !== true) {
      throw new BadRequestException('This message does not require approval');
    }
    const prevApproval = meta['approval'] as { status?: string } | undefined;
    if (prevApproval?.status && prevApproval.status !== 'pending') {
      throw new BadRequestException('Already responded');
    }

    meta['approval'] = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      resolvedAt: new Date().toISOString(),
      resolverUserId: actor.id,
    };
    msg.metadata = meta;
    await this.messageRepo.save(msg);

    const withUser = await this.messageRepo.findOne({
      where: { id: msg.id },
      relations: ['user'],
    });
    return this.toDto(withUser!);
  }

  async openThreadWithTarget(
    requester: User,
    targetUserId: string,
  ): Promise<{ thread_id: string }> {
    const other = await this.getUserOrThrow(targetUserId);
    const thread = await this.getOrCreateThread(requester, other);
    return { thread_id: thread.id };
  }

  async openThreadFromCourseContext(
    requester: User,
    dto: { student_id: string; course_id: string; group_id: string },
  ): Promise<{ thread_id: string; teacher_user_id: string }> {
    if (requester.role !== 'parent') {
      throw new ForbiddenException('Only parents can open chats from course context');
    }
    const parent = await this.parentRepo.findOne({
      where: { user_id: requester.id },
      relations: ['students', 'students.groups'],
    });
    if (!parent?.students?.length) {
      throw new ForbiddenException('No linked students');
    }
    const student = parent.students.find((s) => s.id === dto.student_id);
    if (!student?.groups?.some((g) => g.id === dto.group_id)) {
      throw new ForbiddenException('Student is not in this class');
    }
    const sch = await this.scheduleRepo.findOne({
      where: {
        group_id: dto.group_id,
        course_id: dto.course_id,
        status: 'active',
      },
      relations: ['teacher'],
    });
    if (!sch?.teacher_id) {
      throw new NotFoundException('No teacher assigned for this course in this class');
    }
    const teacher = await this.getUserOrThrow(sch.teacher_id);
    const thread = await this.getOrCreateThread(requester, teacher);
    return { thread_id: thread.id, teacher_user_id: teacher.id };
  }
}
