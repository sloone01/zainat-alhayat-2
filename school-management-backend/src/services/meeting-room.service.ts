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
import { MeetingRoom } from '../entities/meeting-room.entity';
import { MeetingRoomInvitee } from '../entities/meeting-room-invitee.entity';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { CreateMeetingRoomDto, MeetingRoomInviteDto } from '../dto/meeting-room.dto';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { hasStaffMembership } from '../common/identity/staff-membership';
import { isParentOrStudentActor } from '../common/security/school-access';

@Injectable()
export class MeetingRoomService {
  constructor(
    @InjectRepository(MeetingRoom)
    private readonly roomRepo: Repository<MeetingRoom>,
    @InjectRepository(MeetingRoomInvitee)
    private readonly inviteeRepo: Repository<MeetingRoomInvitee>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    private readonly config: ConfigService,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  private ensureDailyKey(): string {
    const key = this.config.get<string>('DAILY_API_KEY');
    if (!key?.trim()) {
      throw new BadRequestException(
        'Video meetings are not configured. Set DAILY_API_KEY (Daily.co → Developers → API key).',
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

  private assertAdmin(user: User): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage meeting rooms');
    }
  }

  private assertSchoolScope(user: User, schoolId: string): void {
    if (user.school_id == null) return;
    if (String(user.school_id) !== String(schoolId)) {
      throw new ForbiddenException('You can only access meeting rooms for your school');
    }
  }

  private displayName(user: User): string {
    const n = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return (n || user.email || user.username || 'Guest').slice(0, 80);
  }

  /** Resolve user IDs for an audience spec (same rules as meeting room invites). */
  async resolveAudienceUserIds(schoolId: string, invite: MeetingRoomInviteDto): Promise<string[]> {
    const ids = new Set<string>();

    if (invite.allTeachers) {
      const rows = await this.userRepo
        .createQueryBuilder('u')
        .select(['u.id'])
        .innerJoin('staff', 'st', 'st.user_id = u.id AND st.school_id = :sid', { sid: schoolId })
        .where('u.role = :role', { role: 'teacher' })
        .andWhere('u.isActive = :act', { act: true })
        .getMany();
      rows.forEach((r) => ids.add(r.id));
    }

    if (invite.allParents) {
      const rows = await this.userRepo
        .createQueryBuilder('u')
        .select(['u.id'])
        .distinct(true)
        .innerJoin('parents', 'p', 'p.user_id = u.id')
        .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
        .innerJoin('students', 's', 's.id = sp.student_id AND s.school_id = :sid', {
          sid: schoolId,
        })
        .where('u.role = :role', { role: 'parent' })
        .andWhere('u.isActive = :act', { act: true })
        .getMany();
      rows.forEach((r) => ids.add(r.id));
    }

    if (invite.allStudents) {
      const rows = await this.userRepo
        .createQueryBuilder('u')
        .select(['u.id'])
        .distinct(true)
        .leftJoin('students', 'st', 'st.user_id = u.id')
        .where('u.role = :role', { role: 'student' })
        .andWhere('u.isActive = :act', { act: true })
        .andWhere('(u.school_id = :sid OR st.school_id = :sid)', { sid: schoolId })
        .getMany();
      rows.forEach((r) => ids.add(r.id));
    }

    const groupIds = invite.groupIds?.filter(Boolean) ?? [];
    if (groupIds.length > 0) {
      const groups = await this.groupRepo.find({
        where: { id: In(groupIds), school_id: schoolId },
        select: ['id'],
      });
      const validGids = new Set(groups.map((g) => g.id));
      const unknown = groupIds.filter((g) => !validGids.has(g));
      if (unknown.length) {
        throw new BadRequestException(`Unknown or out-of-school group id(s): ${unknown.slice(0, 3).join(', ')}`);
      }

      const parentUsers = await this.userRepo
        .createQueryBuilder('u')
        .distinct(true)
        .innerJoin('parents', 'p', 'p.user_id = u.id')
        .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
        .innerJoin('student_groups', 'sg', 'sg.student_id = sp.student_id')
        .innerJoin(Group, 'g', 'g.id = sg.group_id AND g.school_id = :sid', { sid: schoolId })
        .where('sg.group_id IN (:...gids)', { gids: groupIds })
        .andWhere('u.role = :role', { role: 'parent' })
        .andWhere('u.isActive = :act', { act: true })
        .getMany();

      parentUsers.forEach((u) => ids.add(u.id));
    }

    const explicit = invite.userIds?.filter(Boolean) ?? [];
    if (explicit.length > 0) {
      const users = await this.userRepo.find({
        where: { id: In(explicit), isActive: true },
        select: ['id', 'school_id', 'role'],
      });
      for (const uid of explicit) {
        const u = users.find((x) => x.id === uid);
        if (!u) {
          throw new BadRequestException(`User not found or inactive: ${uid.slice(0, 8)}…`);
        }
        const sameSchool = u.school_id != null && String(u.school_id) === String(schoolId);
        const schoolLess = u.school_id == null;
        const staffHere =
          !sameSchool &&
          (await hasStaffMembership(this.userRepo.manager, u.id, schoolId));
        if (!sameSchool && !schoolLess && !staffHere) {
          throw new BadRequestException(`User ${uid.slice(0, 8)}… is not in this school`);
        }
        ids.add(u.id);
      }
    }

    return [...ids];
  }

  private parseScheduledAt(raw?: string | null): Date | null {
    if (!raw?.trim()) return null;
    const when = new Date(raw);
    if (Number.isNaN(when.getTime())) {
      throw new BadRequestException('Invalid scheduled meeting time.');
    }
    return when;
  }

  private toRoomPayload(meeting: MeetingRoom, inviteeCount: number) {
    return {
      id: meeting.id,
      school_id: meeting.school_id,
      title: meeting.title,
      status: meeting.status,
      invite_spec: meeting.invite_spec ?? null,
      room_url: meeting.room_url,
      room_name: meeting.room_name,
      invitee_count: inviteeCount,
      scheduled_at: meeting.scheduled_at,
      ...this.liveState(meeting),
      created_at: meeting.created_at,
      created_by: meeting.created_by,
    };
  }

  private isStaffHost(user: User): boolean {
    if (isParentOrStudentActor(user)) return false;
    return user.user_type === 'staff' || user.role === 'admin' || user.role === 'teacher';
  }

  private isLive(meeting: Pick<MeetingRoom, 'opened_at' | 'ended_at'>): boolean {
    return Boolean(meeting.opened_at && !meeting.ended_at);
  }

  private liveState(meeting: Pick<MeetingRoom, 'opened_at' | 'ended_at'>) {
    return {
      opened_at: meeting.opened_at,
      ended_at: meeting.ended_at,
      is_open: this.isLive(meeting),
    };
  }

  private async provisionDailyRoom(meeting: MeetingRoom): Promise<void> {
    if (meeting.room_name && meeting.room_url) return;
    const roomName = `mroom${randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const room = await this.dailyApi<{ name: string; url: string }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
      }),
    });
    meeting.room_name = room.name;
    meeting.room_url = room.url;
  }

  private async replaceInvitees(meetingId: string, userIds: string[]): Promise<void> {
    await this.inviteeRepo.delete({ meeting_room_id: meetingId });
    if (!userIds.length) return;
    await this.inviteeRepo.save(
      userIds.map((user_id) => this.inviteeRepo.create({ meeting_room_id: meetingId, user_id })),
    );
  }

  private async persistMeeting(
    user: User,
    existing: MeetingRoom | null,
    dto: CreateMeetingRoomDto,
    asDraft: boolean,
  ) {
    const schoolId = existing?.school_id ?? dto.school_id;
    const title = (dto.title || '').trim();
    if (!title) {
      throw new BadRequestException('Meeting title is required.');
    }

    const userIds = await this.resolveAudienceUserIds(schoolId, dto.invite || {});
    if (!asDraft && userIds.length === 0) {
      throw new BadRequestException(
        'Select at least one audience option or add users so the invite list is not empty.',
      );
    }

    const when = this.parseScheduledAt(dto.scheduled_at);
    if (!asDraft && !when) {
      throw new BadRequestException('Invalid scheduled meeting time.');
    }

    const meeting =
      existing ??
      this.roomRepo.create({
        school_id: schoolId,
        provider: 'daily',
        created_by: user.id,
      });

    const wasDraft = !existing || existing.status === 'draft';
    meeting.title = title;
    meeting.scheduled_at = when;
    meeting.invite_spec = (dto.invite || {}) as unknown as Record<string, unknown>;
    meeting.status = asDraft ? 'draft' : 'scheduled';

    if (!asDraft) {
      await this.provisionDailyRoom(meeting);
    }

    await this.roomRepo.save(meeting);
    await this.replaceInvitees(meeting.id, userIds);

    if (!asDraft && wasDraft && when) {
      void this.notifyMeetingScheduled(meeting.school_id, meeting.title, when, userIds);
    }

    return this.toRoomPayload(meeting, userIds.length);
  }

  async create(user: User, dto: CreateMeetingRoomDto) {
    this.assertAdmin(user);
    this.assertSchoolScope(user, dto.school_id);
    return this.persistMeeting(user, null, dto, !!dto.save_as_draft);
  }

  async update(user: User, id: string, dto: CreateMeetingRoomDto) {
    this.assertAdmin(user);
    const meeting = await this.roomRepo.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting room not found');
    this.assertSchoolScope(user, meeting.school_id);
    if (meeting.status !== 'draft') {
      throw new BadRequestException('Only draft meeting rooms can be updated');
    }
    return this.persistMeeting(user, meeting, { ...dto, school_id: meeting.school_id }, !!dto.save_as_draft);
  }

  async listForAdmin(user: User, schoolId: string) {
    this.assertAdmin(user);
    this.assertSchoolScope(user, schoolId);

    const rooms = await this.roomRepo
      .createQueryBuilder('mr')
      .where('mr.school_id = :sid', { sid: schoolId })
      .orderBy('mr.scheduled_at', 'DESC', 'NULLS LAST')
      .addOrderBy('mr.created_at', 'DESC')
      .take(100)
      .getMany();

    const countMap = new Map<string, number>();
    if (rooms.length > 0) {
      const roomIds = rooms.map((r) => r.id);
      const counts = await this.inviteeRepo
        .createQueryBuilder('i')
        .select('i.meeting_room_id', 'roomId')
        .addSelect('COUNT(*)', 'cnt')
        .where('i.meeting_room_id IN (:...ids)', { ids: roomIds })
        .groupBy('i.meeting_room_id')
        .getRawMany<{ roomId: string; cnt: string }>();
      for (const c of counts) {
        countMap.set(c.roomId, parseInt(c.cnt, 10) || 0);
      }
    }

    return rooms.map((r) => ({
      id: r.id,
      school_id: r.school_id,
      title: r.title,
      status: r.status || 'scheduled',
      invite_spec: r.invite_spec ?? null,
      room_url: r.room_url,
      room_name: r.room_name,
      created_at: r.created_at,
      scheduled_at: r.scheduled_at,
      ...this.liveState(r),
      created_by: r.created_by,
      invitee_count: countMap.get(r.id) ?? 0,
    }));
  }

  async listMine(user: User, schoolId: string | null) {
    if (schoolId != null) {
      this.assertSchoolScope(user, schoolId);
    }

    // Load via invitee rows + relation (avoids fragile QB join/ORDER BY COALESCE on some DB/driver setups).
    const invitees = await this.inviteeRepo.find({
      where: { user_id: user.id },
      relations: ['meetingRoom'],
    });

    const seen = new Set<string>();
    const rooms: MeetingRoom[] = [];
    for (const inv of invitees) {
      const mr = inv.meetingRoom;
      if (!mr || seen.has(mr.id)) continue;
      if (mr.status === 'draft') continue;
      if (schoolId != null && String(mr.school_id) !== String(schoolId)) continue;
      seen.add(mr.id);
      rooms.push(mr);
    }

    rooms.sort((a, b) => {
      const ta = new Date(a.scheduled_at ?? a.created_at).getTime();
      const tb = new Date(b.scheduled_at ?? b.created_at).getTime();
      return tb - ta;
    });

    return rooms.slice(0, 50).map((r) => ({
      id: r.id,
      school_id: r.school_id,
      title: r.title,
      status: r.status || 'scheduled',
      created_at: r.created_at,
      scheduled_at: r.scheduled_at,
      ...this.liveState(r),
    }));
  }

  private async assertCanJoin(user: User, meeting: MeetingRoom): Promise<void> {
    if (meeting.created_by === user.id) return;
    if (user.role === 'admin') {
      if (user.school_id == null || String(user.school_id) === String(meeting.school_id)) return;
    }
    const cnt = await this.inviteeRepo.count({
      where: { meeting_room_id: meeting.id, user_id: user.id },
    });
    if (cnt > 0) return;
    throw new ForbiddenException('You are not invited to this meeting room');
  }

  async getOne(user: User, id: string) {
    const meeting = await this.roomRepo.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting room not found');
    this.assertSchoolScope(user, meeting.school_id);
    await this.assertCanJoin(user, meeting);
    return {
      id: meeting.id,
      title: meeting.title,
      status: meeting.status || 'scheduled',
      room_url: meeting.room_url,
      room_name: meeting.room_name,
      school_id: meeting.school_id,
      created_at: meeting.created_at,
      scheduled_at: meeting.scheduled_at,
      ...this.liveState(meeting),
    };
  }

  async endMeeting(user: User, meetingId: string) {
    const meeting = await this.roomRepo.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting room not found');
    this.assertSchoolScope(user, meeting.school_id);
    if (!this.isStaffHost(user)) {
      throw new ForbiddenException('Only staff can end a meeting room');
    }
    await this.assertCanJoin(user, meeting);
    if (meeting.opened_at && !meeting.ended_at) {
      meeting.ended_at = new Date();
      await this.roomRepo.save(meeting);
    }
    return {
      id: meeting.id,
      ...this.liveState(meeting),
    };
  }

  async mintJoinToken(user: User, meetingId: string) {
    const meeting = await this.roomRepo.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting room not found');

    await this.assertCanJoin(user, meeting);

    if (meeting.status === 'draft' || !meeting.room_name || !meeting.room_url) {
      throw new BadRequestException('This meeting is still a draft');
    }

    const staffHost = this.isStaffHost(user);
    if (!staffHost && !this.isLive(meeting)) {
      throw new BadRequestException({
        code: 'MEETING_NOT_STARTED',
        message: 'MEETING_NOT_STARTED',
      });
    }

    const isOwner = user.role === 'admin' || meeting.created_by === user.id;
    const displayName = this.displayName(user);

    const tokenRes = await this.dailyApi<{ token: string }>('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: meeting.room_name,
          user_name: displayName,
          is_owner: isOwner,
        },
      }),
    });

    if (staffHost && !this.isLive(meeting)) {
      meeting.opened_at = new Date();
      meeting.opened_by = user.id;
      meeting.ended_at = null;
      await this.roomRepo.save(meeting);
      void this.notifyMeetingStarted(meeting);
    }

    return {
      token: tokenRes.token,
      room_url: meeting.room_url,
      meeting_id: meeting.id,
      is_owner: isOwner,
    };
  }

  private async notifyMeetingStarted(meeting: MeetingRoom): Promise<void> {
    const invitees = await this.inviteeRepo.find({
      where: { meeting_room_id: meeting.id },
    });
    const userIds = invitees
      .map((row) => row.user_id)
      .filter((id) => id && id !== meeting.opened_by);
    const recipients = await this.audience.usersByIds(userIds);
    if (!recipients.length) return;
    const appUrl = (this.config.get<string>('PUBLIC_APP_URL') || 'http://localhost:5173').replace(
      /\/$/,
      '',
    );
    await this.notifications.notifySafe({
      schoolId: meeting.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.MEETING_STARTED,
      locale: 'ar',
      variables: {
        title: meeting.title,
        recipientName: recipients[0]?.name || '',
        joinUrl: `${appUrl}/meeting-room/${meeting.id}`,
      },
      recipients,
    });
  }

  private async notifyMeetingScheduled(
    schoolId: string,
    title: string,
    when: Date,
    userIds: string[],
  ): Promise<void> {
    const recipients = await this.audience.usersByIds(userIds);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.MEETING_SCHEDULED,
      locale: 'ar',
      variables: {
        title,
        date: when.toISOString().slice(0, 16).replace('T', ' '),
        recipientName: recipients[0]?.name || '',
      },
      recipients,
    });
  }
}
