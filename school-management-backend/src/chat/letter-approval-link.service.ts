import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import {
  appendLetterApprovalActionButtons,
  letterApprovalPageUrls,
  publicAppOrigin,
  signLetterApprovalToken,
  verifyLetterApprovalToken,
} from '../common/security/letter-approval-token';
import { AdhocChatMessage } from '../entities/adhoc-chat-message.entity';
import { DirectChatMessage } from '../entities/direct-chat-message.entity';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { MessageLetterRenderService, type LetterLocale } from '../services/message-letter-render.service';

export type LetterApprovalPublicView = {
  subject: string;
  body_html: string;
  status: 'pending' | 'approved' | 'rejected';
  locale: LetterLocale;
};

@Injectable()
export class LetterApprovalLinkService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AdhocChatMessage)
    private readonly adhocMessageRepo: Repository<AdhocChatMessage>,
    @InjectRepository(DirectChatMessage)
    private readonly dmMessageRepo: Repository<DirectChatMessage>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    private readonly letterRender: MessageLetterRenderService,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  sign(userId: string, messageId: string): string {
    return signLetterApprovalToken(this.jwt, { userId, messageId });
  }

  urlsFor(userId: string, messageId: string): {
    token: string;
    actionUrl: string;
    approveUrl: string;
    rejectUrl: string;
  } {
    const token = this.sign(userId, messageId);
    const origin = publicAppOrigin(this.config.get<string>('PUBLIC_APP_URL'));
    return { token, ...letterApprovalPageUrls(origin, token) };
  }

  emailHtmlWithActions(
    bodyHtml: string,
    urls: { approveUrl: string; rejectUrl: string },
    locale: LetterLocale,
  ): string {
    return appendLetterApprovalActionButtons(bodyHtml, urls, locale);
  }

  async findLatestApprovalMessageId(
    letterId: string,
    recipientUserId: string,
  ): Promise<string | null> {
    const params = [letterId, recipientUserId];
    const adhoc: Array<{ id: string }> = await this.adhocMessageRepo.query(
      `
      SELECT m.id
      FROM adhoc_chat_messages m
      WHERE m.metadata->>'kind' = 'message_letter'
        AND m.metadata->>'letterId' = $1
        AND m.metadata->>'targetUserId' = $2
        AND COALESCE(m.metadata->>'requiresApproval', 'false') = 'true'
      ORDER BY m.created_at DESC
      LIMIT 1
      `,
      params,
    );
    if (adhoc[0]?.id) return adhoc[0].id;
    const dm: Array<{ id: string }> = await this.dmMessageRepo.query(
      `
      SELECT m.id
      FROM direct_chat_messages m
      WHERE m.metadata->>'kind' = 'message_letter'
        AND m.metadata->>'letterId' = $1
        AND COALESCE(m.metadata->>'requiresApproval', 'false') = 'true'
        AND (
          m.metadata->>'targetUserId' = $2
          OR m.metadata->>'targetUserId' IS NULL
        )
      ORDER BY m.created_at DESC
      LIMIT 1
      `,
      params,
    );
    return dm[0]?.id ?? null;
  }

  async preview(token: string): Promise<LetterApprovalPublicView> {
    const loaded = await this.loadFromToken(token);
    return this.toPublicView(loaded);
  }

  async decide(token: string, decision: 'approve' | 'reject'): Promise<LetterApprovalPublicView> {
    const loaded = await this.loadFromToken(token);
    if (loaded.status !== 'pending') {
      throw new BadRequestException('Already responded');
    }
    const meta = loaded.meta;
    meta['approval'] = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      resolvedAt: new Date().toISOString(),
      resolverUserId: loaded.actor.id,
    };
    loaded.row.metadata = meta;
    if (loaded.kind === 'adhoc') {
      await this.adhocMessageRepo.save(loaded.row as AdhocChatMessage);
    } else {
      await this.dmMessageRepo.save(loaded.row as DirectChatMessage);
    }
    await this.notifySchool(loaded, decision);
    loaded.status = decision === 'approve' ? 'approved' : 'rejected';
    return this.toPublicView(loaded);
  }

  private async loadFromToken(token: string): Promise<{
    actor: User;
    kind: 'adhoc' | 'dm';
    row: AdhocChatMessage | DirectChatMessage;
    meta: Record<string, unknown>;
    status: LetterApprovalPublicView['status'];
    schoolId: string | null;
  }> {
    const claims = verifyLetterApprovalToken(this.jwt, token);
    const actor = await this.userRepo.findOne({ where: { id: claims.uid } });
    if (!actor?.isActive) {
      throw new BadRequestException('Invalid or expired approval link');
    }

    const adhoc = await this.adhocMessageRepo.findOne({
      where: { id: claims.mid },
      relations: ['room'],
    });
    const dm = adhoc
      ? null
      : await this.dmMessageRepo.findOne({ where: { id: claims.mid } });
    if (!adhoc && !dm) throw new NotFoundException('Approval request not found');

    const row = (adhoc || dm)!;
    const meta = this.parseMeta(row.metadata);
    if (!meta || meta['kind'] !== 'message_letter' || meta['requiresApproval'] !== true) {
      throw new BadRequestException('Invalid or expired approval link');
    }
    const targetUserId = meta['targetUserId'] ? String(meta['targetUserId']) : '';
    if (targetUserId !== actor.id) {
      throw new BadRequestException('Invalid or expired approval link');
    }
    if (row.user_id === actor.id) {
      throw new BadRequestException('Invalid or expired approval link');
    }

    const prev = meta['approval'] as { status?: string } | undefined;
    const status: LetterApprovalPublicView['status'] =
      prev?.status === 'approved' || prev?.status === 'rejected' ? prev.status : 'pending';

    const schoolId =
      adhoc?.room?.school_id ||
      actor.school_id ||
      null;

    return {
      actor,
      kind: adhoc ? 'adhoc' : 'dm',
      row,
      meta,
      status,
      schoolId,
    };
  }

  private async toPublicView(loaded: {
    actor: User;
    row: AdhocChatMessage | DirectChatMessage;
    meta: Record<string, unknown>;
    status: LetterApprovalPublicView['status'];
  }): Promise<LetterApprovalPublicView> {
    const locale: LetterLocale =
      loaded.actor.preferred_language === 'en' || loaded.actor.preferred_language === 'ar'
        ? loaded.actor.preferred_language
        : loaded.meta['renderedLocale'] === 'en'
          ? 'en'
          : 'ar';
    const rendered = await this.letterRender.resolveDisplayForMessage(
      loaded.row.id,
      loaded.actor.id,
      locale,
    );
    return {
      subject: rendered.subject,
      body_html: rendered.body_html,
      status: loaded.status,
      locale: rendered.locale || locale,
    };
  }

  private parseMeta(raw: unknown): Record<string, unknown> | null {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  private async notifySchool(
    loaded: {
      actor: User;
      meta: Record<string, unknown>;
      schoolId: string | null;
    },
    decision: 'approve' | 'reject',
  ): Promise<void> {
    const letterId = loaded.meta['letterId'] ? String(loaded.meta['letterId']) : '';
    let schoolId = loaded.schoolId;
    if (!schoolId && letterId) {
      const rows: Array<{ school_id: string }> = await this.userRepo.manager.query(
        `SELECT school_id FROM school_message_letters WHERE id = $1::uuid LIMIT 1`,
        [letterId],
      );
      schoolId = rows[0]?.school_id ?? null;
    }
    if (!schoolId) return;
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school?.email && !school?.phone) return;
    const title = String(loaded.meta['title'] || loaded.meta['activityTitle'] || 'Letter');
    const locale: LetterLocale =
      loaded.actor.preferred_language === 'en' || loaded.actor.preferred_language === 'ar'
        ? loaded.actor.preferred_language
        : 'ar';
    await this.notifications.notifySafe({
      schoolId,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.LETTER_APPROVAL_RESOLVED,
      locale,
      variables: {
        recipientName: `${loaded.actor.firstName || ''} ${loaded.actor.lastName || ''}`.trim() || actorEmail(loaded.actor),
        title,
        decision: decision === 'approve' ? (locale === 'ar' ? 'وافق على' : 'approved') : locale === 'ar' ? 'رفض' : 'rejected',
      },
      recipients: [{ email: school.email, phone: school.phone, name: school.name }],
    });
  }
}

function actorEmail(user: User): string {
  return user.email || user.id;
}
