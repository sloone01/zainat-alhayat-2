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

export interface ChatMessageDto {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  createdAt: string;
  senderName: string;
}

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
    return this.toDto(withUser!);
  }

  async getGroupOrThrow(groupId: string): Promise<Group> {
    const g = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!g) throw new NotFoundException('Group not found');
    return g;
  }
}
