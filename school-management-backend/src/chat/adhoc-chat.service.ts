import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Bus } from '../entities/bus.entity';
import { Student } from '../entities/student.entity';
import { AdhocChatRoom } from '../entities/adhoc-chat-room.entity';
import { AdhocChatRoomMember } from '../entities/adhoc-chat-room-member.entity';
import { AdhocChatMessage } from '../entities/adhoc-chat-message.entity';
import { resolveActorSchoolId, assertSameSchool } from '../common/security/school-access';
import { ChatMessageDto } from './chat-message.types';

export interface ChatRoomSummaryDto {
  id: string;
  name: string;
  description?: string | null;
  kind: 'class' | 'adhoc' | 'bus';
  studentCount?: number;
  memberCount?: number;
  busId?: string | null;
}

export interface ChatMemberCandidateDto {
  user_id: string;
  name: string;
  role: string;
  subtitle: string;
}

@Injectable()
export class AdhocChatService {
  constructor(
    @InjectRepository(AdhocChatRoom)
    private readonly roomRepo: Repository<AdhocChatRoom>,
    @InjectRepository(AdhocChatRoomMember)
    private readonly memberRepo: Repository<AdhocChatRoomMember>,
    @InjectRepository(AdhocChatMessage)
    private readonly messageRepo: Repository<AdhocChatMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Bus)
    private readonly busRepo: Repository<Bus>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  private displayName(u: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User';
  }

  private toMessageDto(row: AdhocChatMessage, sender?: User): ChatMessageDto {
    const u = sender || row.user;
    return {
      id: row.id,
      groupId: row.room_id,
      userId: row.user_id,
      body: row.body,
      createdAt:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      senderName: u ? this.displayName(u) : 'User',
    };
  }

  private requireSchoolId(user: User): string {
    const schoolId = resolveActorSchoolId(user);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  async findRoom(roomId: string): Promise<AdhocChatRoom | null> {
    return this.roomRepo.findOne({ where: { id: roomId } });
  }

  async canAccessRoom(user: User, roomId: string): Promise<boolean> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) return false;
    try {
      assertSameSchool(user, room.school_id);
    } catch {
      return false;
    }
    if (user.role === 'admin' && user.school_id === room.school_id) return true;
    const membership = await this.memberRepo.findOne({
      where: { room_id: roomId, user_id: user.id },
    });
    return !!membership;
  }

  async assertCanAccess(user: User, roomId: string): Promise<AdhocChatRoom> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Chat room not found');
    assertSameSchool(user, room.school_id);
    const ok = await this.canAccessRoom(user, roomId);
    if (!ok) throw new ForbiddenException('You do not have access to this chat room');
    return room;
  }

  async listAccessibleRooms(user: User): Promise<ChatRoomSummaryDto[]> {
    if (user.role === 'student') return [];

    if (user.role === 'admin' && user.school_id != null) {
      const rooms = await this.roomRepo.find({
        where: { school_id: user.school_id },
        relations: ['members'],
        order: { name: 'ASC' },
      });
      return rooms.map((r) => this.toSummary(r));
    }

    const memberships = await this.memberRepo.find({
      where: { user_id: user.id },
      relations: ['room', 'room.members'],
    });
    const map = new Map<string, AdhocChatRoom>();
    for (const m of memberships) {
      if (!m.room) continue;
      try {
        assertSameSchool(user, m.room.school_id);
      } catch {
        continue;
      }
      map.set(m.room.id, m.room);
    }
    return [...map.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => this.toSummary(r));
  }

  private toSummary(room: AdhocChatRoom): ChatRoomSummaryDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      kind: room.kind === 'bus' ? 'bus' : 'adhoc',
      memberCount: room.members?.length ?? 0,
      busId: room.bus_id,
    };
  }

  async listMemberCandidates(actor: User): Promise<ChatMemberCandidateDto[]> {
    const schoolId = this.requireSchoolId(actor);
    const users = await this.userRepo.find({
      where: { school_id: schoolId, isActive: true },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
    return users
      .filter((u) => u.id !== actor.id && u.role !== 'student')
      .map((u) => ({
        user_id: u.id,
        name: this.displayName(u),
        role: u.role,
        subtitle: u.email,
      }));
  }

  private async validateMemberIds(schoolId: string, userIds: string[]): Promise<string[]> {
    const unique = [...new Set(userIds.filter(Boolean))];
    if (!unique.length) return [];
    const found = await this.userRepo.find({
      where: { id: In(unique), school_id: schoolId, isActive: true },
    });
    const allowed = found.filter((u) => u.role !== 'student').map((u) => u.id);
    if (allowed.length !== unique.length) {
      const ok = new Set(allowed);
      const missing = unique.filter((id) => !ok.has(id));
      if (missing.length) {
        throw new BadRequestException('One or more selected users are invalid for this school');
      }
    }
    return allowed;
  }

  private async replaceMembers(roomId: string, userIds: string[]): Promise<void> {
    await this.memberRepo.delete({ room_id: roomId });
    if (!userIds.length) return;
    await this.memberRepo.save(
      userIds.map((user_id) =>
        this.memberRepo.create({
          room_id: roomId,
          user_id,
        }),
      ),
    );
  }

  async createAdhocRoom(
    actor: User,
    body: { name: string; description?: string; userIds?: string[] },
  ): Promise<ChatRoomSummaryDto> {
    const schoolId = this.requireSchoolId(actor);
    const name = (body.name || '').trim();
    if (!name) throw new BadRequestException('name is required');
    if (name.length > 255) throw new BadRequestException('name is too long');

    const memberIds = await this.validateMemberIds(schoolId, body.userIds || []);
    if (!memberIds.includes(actor.id)) memberIds.push(actor.id);

    const room = await this.roomRepo.save(
      this.roomRepo.create({
        school_id: schoolId,
        name,
        description: body.description?.trim() || null,
        kind: 'adhoc',
        bus_id: null,
        created_by_user_id: actor.id,
      }),
    );
    await this.replaceMembers(room.id, memberIds);
    const withMembers = await this.roomRepo.findOne({
      where: { id: room.id },
      relations: ['members'],
    });
    return this.toSummary(withMembers!);
  }

  async createOrOpenBusParentsRoom(actor: User, busId: string): Promise<ChatRoomSummaryDto> {
    const schoolId = this.requireSchoolId(actor);
    const bus = await this.busRepo.findOne({ where: { id: busId } });
    if (!bus) throw new NotFoundException('Bus not found');
    assertSameSchool(actor, bus.school_id);

    const students = await this.studentRepo
      .createQueryBuilder('student')
      .where(
        `EXISTS (SELECT 1 FROM student_buses sb WHERE sb.student_id = student.id AND sb.bus_id = :busId)`,
        { busId },
      )
      .andWhere('student.school_id = :schoolId', { schoolId })
      .leftJoinAndSelect('student.parents', 'parents')
      .getMany();

    const parentUserIds = new Set<string>();
    for (const st of students) {
      for (const p of st.parents || []) {
        if (p.user_id) parentUserIds.add(p.user_id);
      }
    }
    const memberIds = await this.validateMemberIds(schoolId, [...parentUserIds, actor.id]);
    if (!memberIds.includes(actor.id)) memberIds.push(actor.id);

    let room = await this.roomRepo.findOne({
      where: { bus_id: busId },
      relations: ['members'],
    });

    const roomName = `${bus.title} — parents`;
    const description = `Parents of students on bus “${bus.title}”`;

    if (!room) {
      room = await this.roomRepo.save(
        this.roomRepo.create({
          school_id: schoolId,
          name: roomName,
          description,
          kind: 'bus',
          bus_id: busId,
          created_by_user_id: actor.id,
        }),
      );
    } else {
      room.name = roomName;
      room.description = description;
      room.kind = 'bus';
      await this.roomRepo.save(room);
    }

    await this.replaceMembers(room.id, memberIds);
    const withMembers = await this.roomRepo.findOne({
      where: { id: room.id },
      relations: ['members'],
    });
    return this.toSummary(withMembers!);
  }

  async getRecentMessages(roomId: string, limit = 80): Promise<ChatMessageDto[]> {
    const lim = Math.min(Math.max(limit, 1), 200);
    const rows = await this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.room_id = :rid', { rid: roomId })
      .orderBy('m.created_at', 'DESC')
      .take(lim)
      .getMany();
    return rows.reverse().map((r) => this.toMessageDto(r));
  }

  async saveMessage(user: User, roomId: string, body: string): Promise<ChatMessageDto> {
    await this.assertCanAccess(user, roomId);
    const trimmed = body?.trim() || '';
    if (!trimmed) throw new BadRequestException('Message cannot be empty');
    if (trimmed.length > 4000) throw new BadRequestException('Message is too long');

    const row = this.messageRepo.create({
      room_id: roomId,
      user_id: user.id,
      body: trimmed,
    });
    const saved = await this.messageRepo.save(row);
    const withUser = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return this.toMessageDto(withUser!);
  }

  async setMembers(actor: User, roomId: string, userIds: string[]): Promise<ChatRoomSummaryDto> {
    const room = await this.assertCanAccess(actor, roomId);
    if (actor.role !== 'admin' && room.created_by_user_id !== actor.id) {
      throw new ForbiddenException('Only the room creator or an admin can edit members');
    }
    const memberIds = await this.validateMemberIds(room.school_id, userIds || []);
    if (!memberIds.includes(actor.id) && room.created_by_user_id === actor.id) {
      memberIds.push(actor.id);
    }
    if (room.created_by_user_id && !memberIds.includes(room.created_by_user_id)) {
      memberIds.push(room.created_by_user_id);
    }
    await this.replaceMembers(roomId, memberIds);
    const withMembers = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    return this.toSummary(withMembers!);
  }
}
