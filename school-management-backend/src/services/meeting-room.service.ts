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

  private assertSchoolScope(user: User, schoolId: number): void {
    if (user.school_id == null) return;
    if (Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only access meeting rooms for your school');
    }
  }

  private displayName(user: User): string {
    const n = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return (n || user.email || user.username || 'Guest').slice(0, 80);
  }

  private async resolveInviteUserIds(
    schoolId: number,
    invite: MeetingRoomInviteDto,
  ): Promise<string[]> {
    const ids = new Set<string>();

    if (invite.allTeachers) {
      const rows = await this.userRepo.find({
        where: { role: 'teacher', school_id: schoolId, isActive: true },
        select: ['id'],
      });
      rows.forEach((r) => ids.add(r.id));
    }

    if (invite.allParents) {
      const rows = await this.userRepo.find({
        where: { role: 'parent', school_id: schoolId, isActive: true },
        select: ['id'],
      });
      rows.forEach((r) => ids.add(r.id));
    }

    if (invite.allStudents) {
      const rows = await this.userRepo.find({
        where: { role: 'student', school_id: schoolId, isActive: true },
        select: ['id'],
      });
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
        if (u.school_id != null && Number(u.school_id) !== Number(schoolId)) {
          throw new BadRequestException(`User ${uid.slice(0, 8)}… is not in this school`);
        }
        ids.add(u.id);
      }
    }

    return [...ids];
  }

  async create(user: User, dto: CreateMeetingRoomDto) {
    this.assertAdmin(user);
    this.assertSchoolScope(user, dto.school_id);

    const userIds = await this.resolveInviteUserIds(dto.school_id, dto.invite);
    if (userIds.length === 0) {
      throw new BadRequestException(
        'Select at least one audience option or add users so the invite list is not empty.',
      );
    }

    const when = new Date(dto.scheduled_at);
    if (Number.isNaN(when.getTime())) {
      throw new BadRequestException('Invalid scheduled meeting time.');
    }

    const roomName = `mroom${randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const room = await this.dailyApi<{ name: string; url: string }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
      }),
    });

    const meeting = this.roomRepo.create({
      school_id: dto.school_id,
      title: dto.title.trim(),
      provider: 'daily',
      room_name: room.name,
      room_url: room.url,
      created_by: user.id,
      scheduled_at: when,
    });
    await this.roomRepo.save(meeting);

    const inviteeRows = userIds.map((user_id) =>
      this.inviteeRepo.create({ meeting_room_id: meeting.id, user_id }),
    );
    await this.inviteeRepo.save(inviteeRows);

    return {
      id: meeting.id,
      school_id: meeting.school_id,
      title: meeting.title,
      room_url: meeting.room_url,
      room_name: meeting.room_name,
      invitee_count: userIds.length,
      scheduled_at: meeting.scheduled_at,
    };
  }

  async listForAdmin(user: User, schoolId: number) {
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
      room_url: r.room_url,
      room_name: r.room_name,
      created_at: r.created_at,
      scheduled_at: r.scheduled_at,
      created_by: r.created_by,
      invitee_count: countMap.get(r.id) ?? 0,
    }));
  }

  async listMine(user: User, schoolId: number) {
    this.assertSchoolScope(user, schoolId);

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
      if (Number(mr.school_id) !== Number(schoolId)) continue;
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
      created_at: r.created_at,
      scheduled_at: r.scheduled_at,
    }));
  }

  private async assertCanJoin(user: User, meeting: MeetingRoom): Promise<void> {
    if (meeting.created_by === user.id) return;
    if (user.role === 'admin') {
      if (user.school_id == null || Number(user.school_id) === Number(meeting.school_id)) return;
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
      room_url: meeting.room_url,
      room_name: meeting.room_name,
      school_id: meeting.school_id,
      created_at: meeting.created_at,
      scheduled_at: meeting.scheduled_at,
    };
  }

  async mintJoinToken(user: User, meetingId: string) {
    const meeting = await this.roomRepo.findOne({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting room not found');

    await this.assertCanJoin(user, meeting);

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

    return {
      token: tokenRes.token,
      room_url: meeting.room_url,
      meeting_id: meeting.id,
      is_owner: isOwner,
    };
  }
}
