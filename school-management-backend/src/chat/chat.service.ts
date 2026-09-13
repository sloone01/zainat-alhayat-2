import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Parent } from '../entities/parent.entity';
import { Schedule } from '../entities/schedule.entity';
import { GroupChatMessage } from '../entities/group-chat-message.entity';
import { ChatRoomReadState } from '../entities/chat-room-read-state.entity';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { ChatMessageDto } from './chat-message.types';

export type { ChatMessageDto };

export type ChatLastPreview = {
  at: string;
  preview: string;
  senderName: string;
  senderUserId: string | null;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(GroupChatMessage)
    private readonly messageRepo: Repository<GroupChatMessage>,
    @InjectRepository(ChatRoomReadState)
    private readonly readStateRepo: Repository<ChatRoomReadState>,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  private toDto(row: GroupChatMessage, sender?: User): ChatMessageDto {
    const u = sender || row.user;
    const senderName = u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'User';
    return {
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      body: row.body,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      senderName,
    };
  }

  async canAccessGroup(user: User, groupId: string): Promise<boolean> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) return false;

    if (user.role === 'admin') {
      return true;
    }

    if (user.role === 'teacher') {
      const sched = await this.scheduleRepo.findOne({
        where: { group_id: groupId, teacher_id: user.id },
      });
      return !!sched;
    }

    if (user.role === 'parent') {
      const parent = await this.parentRepo.findOne({
        where: { user_id: user.id },
        relations: ['students', 'students.groups'],
      });
      if (!parent?.students?.length) return false;
      for (const st of parent.students) {
        if (st.groups?.some((g) => g.id === groupId)) return true;
      }
      return false;
    }

    return false;
  }

  async assertCanAccess(user: User, groupId: string): Promise<void> {
    const ok = await this.canAccessGroup(user, groupId);
    if (!ok) {
      throw new ForbiddenException('You do not have access to this group chat');
    }
  }

  async listAccessibleGroups(user: User): Promise<Group[]> {
    try {
      if (user.role === 'admin') {
        const where = user.school_id != null ? { school_id: user.school_id } : {};
        return this.groupRepo.find({
          where,
          relations: ['students'],
          order: { name: 'ASC' },
        });
      }

      if (user.role === 'teacher') {
        const schedules = await this.scheduleRepo.find({
          where: { teacher_id: user.id },
          relations: ['group', 'group.students'],
        });
        const map = new Map<string, Group>();
        for (const s of schedules) {
          if (s.group_id && s.group) {
            map.set(s.group.id, s.group);
          }
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      }

      if (user.role === 'parent') {
        const parent = await this.parentRepo.findOne({
          where: { user_id: user.id },
          relations: ['students', 'students.groups'],
        });
        if (!parent?.students?.length) return [];
        const map = new Map<string, Group>();
        for (const st of parent.students) {
          for (const g of st.groups || []) {
            map.set(g.id, g);
          }
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      }

      return [];
    } catch (e) {
      this.logger.error(`listAccessibleGroups: ${(e as Error).message}`);
      if (e instanceof QueryFailedError) {
        throw new ServiceUnavailableException(
          'Could not load chat groups. Run DB migrations in school-management-backend: npm run migration:run',
        );
      }
      throw e;
    }
  }

  async getRecentMessages(groupId: string, limit = 80): Promise<ChatMessageDto[]> {
    const lim = Math.min(Math.max(limit, 1), 200);
    try {
      const rows = await this.messageRepo
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.user', 'u')
        .where('m.group_id = :gid', { gid: groupId })
        .orderBy('m.created_at', 'DESC')
        .take(lim)
        .getMany();
      return rows.reverse().map((r) => this.toDto(r));
    } catch (e) {
      this.logger.error(`getRecentMessages failed for group ${groupId}: ${(e as Error).message}`);
      if (e instanceof QueryFailedError) {
        const msg = String(e.message || '');
        if (/group_chat_messages|42P01|does not exist/i.test(msg)) {
          throw new ServiceUnavailableException(
            'Chat storage is not initialized. Run database migrations in school-management-backend: npm run migration:run',
          );
        }
      }
      throw e;
    }
  }

  /** Latest message preview per class group for mailbox list rows. */
  async latestPreviewsByGroupIds(groupIds: string[]): Promise<Map<string, ChatLastPreview>> {
    const out = new Map<string, ChatLastPreview>();
    const ids = [...new Set(groupIds.filter(Boolean))];
    if (!ids.length) return out;

    try {
      const rows = await this.messageRepo.query(
        `
        SELECT DISTINCT ON (m.group_id)
          m.group_id AS group_id,
          m.user_id AS user_id,
          m.body AS body,
          m.created_at AS created_at,
          u."firstName" AS first_name,
          u."lastName" AS last_name,
          u.email AS email
        FROM group_chat_messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.group_id = ANY($1::uuid[])
        ORDER BY m.group_id, m.created_at DESC
        `,
        [ids],
      );

      for (const r of rows as Array<{
        group_id: string;
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
        out.set(String(r.group_id), {
          at,
          preview,
          senderName,
          senderUserId: r.user_id ? String(r.user_id) : null,
        });
      }
    } catch (e) {
      this.logger.warn(`latestPreviewsByGroupIds failed: ${(e as Error).message}`);
    }
    return out;
  }

  /** Batch last-read cursors for the actor (one query; O(rooms)). */
  async getLastReadAtMap(userId: string, roomIds: string[]): Promise<Map<string, Date>> {
    const out = new Map<string, Date>();
    const ids = [...new Set(roomIds.filter(Boolean))];
    if (!ids.length) return out;
    try {
      const rows = await this.readStateRepo
        .createQueryBuilder('r')
        .select(['r.room_id', 'r.last_read_at'])
        .where('r.user_id = :userId', { userId })
        .andWhere('r.room_id IN (:...ids)', { ids })
        .getMany();
      for (const row of rows) {
        out.set(String(row.room_id), row.last_read_at);
      }
    } catch (e) {
      this.logger.warn(`getLastReadAtMap failed: ${(e as Error).message}`);
    }
    return out;
  }

  /**
   * Upsert last-read cursor. Cheap: one row per (user, room), no message scans.
   * Call when the user opens a room (or explicitly marks read).
   */
  async markRoomRead(userId: string, roomId: string, at: Date = new Date()): Promise<void> {
    await this.readStateRepo.query(
      `
      INSERT INTO chat_room_read_states (user_id, room_id, last_read_at, updated_at)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (user_id, room_id)
      DO UPDATE SET
        last_read_at = GREATEST(chat_room_read_states.last_read_at, EXCLUDED.last_read_at),
        updated_at = now()
      `,
      [userId, roomId, at],
    );
  }

  static hasUnread(opts: {
    lastMessageAt: string | null | undefined;
    lastMessageUserId: string | null | undefined;
    viewerUserId: string;
    lastReadAt: Date | undefined;
  }): boolean {
    const { lastMessageAt, lastMessageUserId, viewerUserId, lastReadAt } = opts;
    if (!lastMessageAt) return false;
    if (lastMessageUserId && lastMessageUserId === viewerUserId) return false;
    if (!lastReadAt) return true;
    return new Date(lastMessageAt).getTime() > lastReadAt.getTime();
  }

  async saveMessage(user: User, groupId: string, body: string): Promise<ChatMessageDto> {
    await this.assertCanAccess(user, groupId);
    const trimmed = body?.trim() || '';
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }
    if (trimmed.length > 4000) {
      throw new BadRequestException('Message is too long');
    }

    const row = this.messageRepo.create({
      group_id: groupId,
      user_id: user.id,
      body: trimmed,
    });
    const saved = await this.messageRepo.save(row);
    const withUser = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    void this.notifyGroupMessage(user, groupId, trimmed);
    return this.toDto(withUser!);
  }

  private async notifyGroupMessage(sender: User, groupId: string, body: string): Promise<void> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    const { schoolId, recipients } = await this.audience.parentsOfGroup(groupId);
    const others = recipients.filter((r) => r.userId !== sender.id);
    if (!others.length) return;
    const preview = body.length > 80 ? `${body.slice(0, 77)}...` : body;
    const senderName =
      `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.email || 'User';
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.CHAT_GROUP_MESSAGE,
      locale: 'ar',
      variables: {
        title: group?.name || 'Group',
        senderName,
        preview,
      },
      recipients: others,
      channels: ['push'],
    });
  }

  async getGroupOrThrow(groupId: string): Promise<Group> {
    const g = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!g) throw new NotFoundException('Group not found');
    return g;
  }
}
