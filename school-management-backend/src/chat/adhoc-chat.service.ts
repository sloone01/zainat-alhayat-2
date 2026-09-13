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
import { Parent } from '../entities/parent.entity';
import { AdhocChatRoom, AdhocChatRoomKind } from '../entities/adhoc-chat-room.entity';
import { AdhocChatRoomMember } from '../entities/adhoc-chat-room-member.entity';
import { AdhocChatMessage } from '../entities/adhoc-chat-message.entity';
import {
  resolveActorSchoolId,
  assertSameSchool,
  isPlatformActor,
  isParentOrStudentActor,
} from '../common/security/school-access';
import { ChatMessageDto } from './chat-message.types';

export interface ChatRoomSummaryDto {
  id: string;
  name: string;
  description?: string | null;
  kind: 'class' | 'adhoc' | 'bus' | 'approvals';
  studentCount?: number;
  memberCount?: number;
  busId?: string | null;
  last_message_at?: string | null;
  last_message_preview?: string | null;
  last_message_sender_name?: string | null;
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
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
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
      metadata: row.metadata ?? null,
    };
  }

  private requireSchoolId(user: User): string {
    const schoolId = resolveActorSchoolId(user);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  private isParentActor(user: User): boolean {
    return isParentOrStudentActor(user) && (user.role === 'parent' || user.user_type === 'parent');
  }

  private async parentLinkedToSchool(parentUserId: string, schoolId: string): Promise<boolean> {
    const n = await this.parentRepo
      .createQueryBuilder('p')
      .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
      .innerJoin('students', 'st', 'st.id = sp.student_id')
      .where('p.user_id = :uid', { uid: parentUserId })
      .andWhere('st.school_id = :schoolId', { schoolId })
      .getCount();
    return n > 0;
  }

  async findRoom(roomId: string): Promise<AdhocChatRoom | null> {
    return this.roomRepo.findOne({ where: { id: roomId } });
  }

  async findMessage(messageId: string): Promise<AdhocChatMessage | null> {
    return this.messageRepo.findOne({ where: { id: messageId }, relations: ['user', 'room'] });
  }

  async canAccessRoom(user: User, roomId: string): Promise<boolean> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) return false;
    if (isPlatformActor(user)) return true;
    if (
      user.role === 'admin' &&
      user.school_id != null &&
      String(user.school_id) === String(room.school_id)
    ) {
      return true;
    }

    const membership = await this.memberRepo.findOne({
      where: { room_id: roomId, user_id: user.id },
    });
    if (!membership) return false;

    if (user.school_id != null) {
      return String(user.school_id) === String(room.school_id);
    }

    if (this.isParentActor(user)) {
      return this.parentLinkedToSchool(user.id, room.school_id);
    }
    return false;
  }

  async assertCanAccess(user: User, roomId: string): Promise<AdhocChatRoom> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Chat room not found');
    const ok = await this.canAccessRoom(user, roomId);
    if (!ok) throw new ForbiddenException('You do not have access to this chat room');
    return room;
  }

  async listAccessibleRooms(user: User): Promise<ChatRoomSummaryDto[]> {
    if (user.role === 'student' || user.user_type === 'student') return [];

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
      if (user.school_id != null) {
        if (String(user.school_id) !== String(m.room.school_id)) continue;
      } else if (this.isParentActor(user)) {
        const linked = await this.parentLinkedToSchool(user.id, m.room.school_id);
        if (!linked) continue;
      } else {
        continue;
      }
      map.set(m.room.id, m.room);
    }
    return [...map.values()]
      .sort((a, b) => {
        if (a.kind === 'approvals' && b.kind !== 'approvals') return -1;
        if (b.kind === 'approvals' && a.kind !== 'approvals') return 1;
        return a.name.localeCompare(b.name);
      })
      .map((r) => this.toSummary(r));
  }

  private toSummary(room: AdhocChatRoom): ChatRoomSummaryDto {
    const kind: ChatRoomSummaryDto['kind'] =
      room.kind === 'bus' ? 'bus' : room.kind === 'approvals' ? 'approvals' : 'adhoc';
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      kind,
      memberCount: room.members?.length ?? 0,
      busId: room.bus_id,
      last_message_at: null,
      last_message_preview: null,
      last_message_sender_name: null,
    };
  }

  /** One Approvals room per school for message letters / approval posts. */
  async getOrCreateApprovalsRoom(actor: User, schoolId: string): Promise<AdhocChatRoom> {
    if (!isPlatformActor(actor) && actor.school_id != null) {
      assertSameSchool(actor, schoolId);
    }
    let room = await this.roomRepo.findOne({
      where: { school_id: schoolId, kind: 'approvals' as AdhocChatRoomKind },
    });
    if (room) return room;

    room = await this.roomRepo.save(
      this.roomRepo.create({
        school_id: schoolId,
        name: 'Approvals',
        description: null,
        kind: 'approvals',
        bus_id: null,
        created_by_user_id: actor.id,
      }),
    );
    return room;
  }

  async addMembers(roomId: string, userIds: string[]): Promise<void> {
    const unique = [...new Set(userIds.filter(Boolean))];
    if (!unique.length) return;
    const existing = await this.memberRepo.find({
      where: { room_id: roomId, user_id: In(unique) },
    });
    const have = new Set(existing.map((m) => m.user_id));
    const toAdd = unique.filter((id) => !have.has(id));
    if (!toAdd.length) return;
    await this.memberRepo.save(
      toAdd.map((user_id) =>
        this.memberRepo.create({
          room_id: roomId,
          user_id,
        }),
      ),
    );
  }

  async saveMessageWithMetadata(
    user: User,
    roomId: string,
    body: string,
    metadata?: Record<string, unknown> | null,
  ): Promise<ChatMessageDto> {
    await this.assertCanAccess(user, roomId);
    const trimmed = body?.trim() || '';
    if (!trimmed) throw new BadRequestException('Message cannot be empty');
    if (trimmed.length > 4000) throw new BadRequestException('Message is too long');

    const row = this.messageRepo.create({
      room_id: roomId,
      user_id: user.id,
      body: trimmed,
      metadata: metadata ?? null,
    });
    const saved = await this.messageRepo.save(row);
    const withUser = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return this.toMessageDto(withUser!);
  }

  /** Latest message preview per room for mailbox list rows. */
  async latestPreviewsByRoomIds(
    roomIds: string[],
    viewer?: User,
  ): Promise<
    Map<string, { at: string; preview: string; senderName: string; senderUserId: string | null }>
  > {
    const out = new Map<
      string,
      { at: string; preview: string; senderName: string; senderUserId: string | null }
    >();
    const ids = [...new Set(roomIds.filter(Boolean))];
    if (!ids.length) return out;

    const parentFilter = viewer && this.isParentActor(viewer);
    const rows = await this.messageRepo.query(
      parentFilter
        ? `
      SELECT DISTINCT ON (m.room_id)
        m.room_id AS room_id,
        m.user_id AS user_id,
        m.body AS body,
        m.created_at AS created_at,
        u."firstName" AS first_name,
        u."lastName" AS last_name,
        u.email AS email
      FROM adhoc_chat_messages m
      LEFT JOIN users u ON u.id = m.user_id
      LEFT JOIN adhoc_chat_rooms r ON r.id = m.room_id
      WHERE m.room_id = ANY($1::uuid[])
        AND (
          r.kind <> 'approvals'
          OR m.metadata IS NULL
          OR m.metadata->>'kind' IS DISTINCT FROM 'message_letter'
          OR m.metadata->>'targetUserId' = $2
        )
      ORDER BY m.room_id, m.created_at DESC
      `
        : `
      SELECT DISTINCT ON (m.room_id)
        m.room_id AS room_id,
        m.user_id AS user_id,
        m.body AS body,
        m.created_at AS created_at,
        u."firstName" AS first_name,
        u."lastName" AS last_name,
        u.email AS email
      FROM adhoc_chat_messages m
      LEFT JOIN users u ON u.id = m.user_id
      WHERE m.room_id = ANY($1::uuid[])
      ORDER BY m.room_id, m.created_at DESC
      `,
      parentFilter ? [ids, viewer!.id] : [ids],
    );

    for (const r of rows as Array<{
      room_id: string;
      user_id: string | null;
      body: string;
      created_at: Date | string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }>) {
      const raw = String(r.body || '').replace(/\s+/g, ' ').trim();
      const preview = raw.length > 120 ? `${raw.slice(0, 117)}…` : raw;
      const senderName =
        `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || 'User';
      const at =
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : new Date(r.created_at).toISOString();
      out.set(String(r.room_id), {
        at,
        preview,
        senderName,
        senderUserId: r.user_id ? String(r.user_id) : null,
      });
    }
    return out;
  }

  /**
   * Staff: JWT school or staff membership. Parents: a child in this school
   * (users.school_id is null for parent logins).
   */
  private schoolPeopleQb(schoolId: string) {
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.isActive = :active', { active: true })
      .andWhere(`u.role <> 'student'`)
      .andWhere(`(u.user_type IS NULL OR u.user_type <> 'student')`)
      .andWhere(
        `(
          u.school_id = :schoolId
          OR EXISTS (
            SELECT 1 FROM staff s
            WHERE s.user_id = u.id AND s.school_id = :schoolId
          )
          OR EXISTS (
            SELECT 1 FROM parents p
            INNER JOIN student_parents sp ON sp.parent_id = p.id
            INNER JOIN students st ON st.id = sp.student_id
            WHERE p.user_id = u.id AND st.school_id = :schoolId
          )
        )`,
        { schoolId },
      );
  }

  async listMemberCandidates(actor: User): Promise<ChatMemberCandidateDto[]> {
    const schoolId = this.requireSchoolId(actor);
    const users = await this.schoolPeopleQb(schoolId)
      .orderBy('u."lastName"', 'ASC')
      .addOrderBy('u."firstName"', 'ASC')
      .take(500)
      .getMany();
    return users.map((u) => ({
      user_id: u.id,
      name: this.displayName(u),
      role: u.role,
      subtitle: u.email,
    }));
  }

  private async validateMemberIds(schoolId: string, userIds: string[]): Promise<string[]> {
    const unique = [...new Set(userIds.filter(Boolean))];
    if (!unique.length) return [];
    const found = await this.schoolPeopleQb(schoolId)
      .andWhere('u.id IN (:...ids)', { ids: unique })
      .getMany();
    const allowed = found.map((u) => u.id);
    if (allowed.length !== unique.length) {
      throw new BadRequestException('One or more selected users are invalid for this school');
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

  async getRecentMessages(
    roomId: string,
    limit = 80,
    viewer?: User,
  ): Promise<ChatMessageDto[]> {
    const lim = Math.min(Math.max(limit, 1), 200);
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.room_id = :rid', { rid: roomId });

    if (room?.kind === 'approvals' && viewer && this.isParentActor(viewer)) {
      qb.andWhere(
        `(
          m.metadata IS NULL
          OR m.metadata->>'kind' IS DISTINCT FROM 'message_letter'
          OR m.metadata->>'targetUserId' = :vid
        )`,
        { vid: viewer.id },
      );
    }

    const rows = await qb.orderBy('m.created_at', 'DESC').take(lim).getMany();
    return rows.reverse().map((r) => this.toMessageDto(r));
  }

  async saveMessage(user: User, roomId: string, body: string): Promise<ChatMessageDto> {
    const room = await this.assertCanAccess(user, roomId);
    if (room.kind === 'approvals' && this.isParentActor(user)) {
      throw new ForbiddenException('Parents cannot post free-form messages in Approvals');
    }
    return this.saveMessageWithMetadata(user, roomId, body, null);
  }

  async setMembers(actor: User, roomId: string, userIds: string[]): Promise<ChatRoomSummaryDto> {
    const room = await this.assertCanAccess(actor, roomId);
    if (room.kind === 'approvals') {
      throw new ForbiddenException('Approvals room members are managed by letter dispatch');
    }
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

  async resolveMessageLetterApproval(
    actor: User,
    messageId: string,
    decision: 'approve' | 'reject',
  ): Promise<ChatMessageDto> {
    const msg = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['user', 'room'],
    });
    if (!msg) throw new NotFoundException('Message not found');

    await this.assertCanAccess(actor, msg.room_id);

    const meta = (msg.metadata || null) as Record<string, unknown> | null;
    if (!meta || meta['kind'] !== 'message_letter') {
      throw new BadRequestException('Not an actionable message letter');
    }
    if (meta['requiresApproval'] !== true) {
      throw new BadRequestException('This message does not require approval');
    }

    const targetUserId = meta['targetUserId'] ? String(meta['targetUserId']) : null;
    if (this.isParentActor(actor) && targetUserId && targetUserId !== actor.id) {
      throw new ForbiddenException('You can only respond to your own approval request');
    }
    if (msg.user_id === actor.id) {
      throw new ForbiddenException('You cannot respond to your own official message');
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
    return this.toMessageDto(withUser!);
  }
}
