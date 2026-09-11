import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OutboundMessageTransaction,
  type OutboundMessageChannel,
  type OutboundMessageStatus,
} from '../entities/outbound-message-transaction.entity';
import { MailService } from '../services/mail.service';
import { SmsService } from '../notifications/sms.service';
import { runWithOutboundContext } from '../notifications/outbound-message-context';
import { isPlatformActor } from '../common/security/school-access';
import type { User } from '../entities/user.entity';

export type RecordOutboundInput = {
  channel: OutboundMessageChannel;
  status: OutboundMessageStatus;
  toAddress: string;
  subject?: string | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
  templateKey?: string | null;
  schoolId?: string | null;
  recipientUserId?: string | null;
  errorMessage?: string | null;
  providerMessageId?: string | null;
  source?: string | null;
  resentFromId?: string | null;
  sentAt?: Date | null;
};

export type OutboundListQuery = {
  schoolId: string | null;
  /** When true, platform may list across schools (schoolId filter optional). */
  platformScope: boolean;
  channel?: OutboundMessageChannel | '';
  status?: OutboundMessageStatus | '';
  search?: string;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class OutboundMessageTransactionService {
  constructor(
    @InjectRepository(OutboundMessageTransaction)
    private readonly repo: Repository<OutboundMessageTransaction>,
    private readonly mail: MailService,
    private readonly sms: SmsService,
  ) {}

  async record(input: RecordOutboundInput): Promise<OutboundMessageTransaction> {
    const row = this.repo.create({
      channel: input.channel,
      status: input.status,
      to_address: input.toAddress.trim(),
      subject: input.subject?.trim() || null,
      body_html: input.bodyHtml ?? null,
      body_text: input.bodyText ?? null,
      template_key: input.templateKey?.trim() || null,
      school_id: input.schoolId ?? null,
      recipient_user_id: input.recipientUserId ?? null,
      error_message: input.errorMessage?.trim() || null,
      provider_message_id: input.providerMessageId?.trim() || null,
      source: input.source?.trim() || null,
      resent_from_id: input.resentFromId ?? null,
      sent_at: input.status === 'sent' ? input.sentAt ?? new Date() : input.sentAt ?? null,
    });
    return this.repo.save(row);
  }

  async list(query: OutboundListQuery): Promise<{
    items: OutboundMessageTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const qb = this.repo
      .createQueryBuilder('t')
      .select([
        't.id',
        't.school_id',
        't.channel',
        't.status',
        't.to_address',
        't.subject',
        't.template_key',
        't.recipient_user_id',
        't.error_message',
        't.provider_message_id',
        't.source',
        't.resent_from_id',
        't.sent_at',
        't.created_at',
        't.updated_at',
      ])
      .orderBy('t.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.platformScope) {
      if (query.schoolId) {
        qb.andWhere('t.school_id = :schoolId', { schoolId: query.schoolId });
      }
    } else {
      if (!query.schoolId) {
        throw new BadRequestException('school_id is required');
      }
      qb.andWhere('t.school_id = :schoolId', { schoolId: query.schoolId });
    }

    if (query.channel === 'email' || query.channel === 'sms') {
      qb.andWhere('t.channel = :channel', { channel: query.channel });
    }
    if (query.status === 'sent' || query.status === 'failed' || query.status === 'skipped') {
      qb.andWhere('t.status = :status', { status: query.status });
    }
    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        `(t.to_address ILIKE :q OR COALESCE(t.subject, '') ILIKE :q OR COALESCE(t.template_key, '') ILIKE :q)`,
        { q: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async getByIdForActor(
    id: string,
    actor: User,
    requestedSchoolId?: string | null,
  ): Promise<OutboundMessageTransaction> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Transaction not found');
    this.assertCanAccess(actor, row, requestedSchoolId);
    return row;
  }

  async resend(
    id: string,
    actor: User,
    requestedSchoolId?: string | null,
  ): Promise<OutboundMessageTransaction> {
    const original = await this.getByIdForActor(id, actor, requestedSchoolId);
    if (original.channel === 'email') {
      const html = (original.body_html || '').trim();
      const subject = (original.subject || '').trim() || '(no subject)';
      if (!html && !(original.body_text || '').trim()) {
        throw new BadRequestException('Cannot resend: message body is empty');
      }
      await runWithOutboundContext(
        {
          schoolId: original.school_id,
          templateKey: original.template_key,
          recipientUserId: original.recipient_user_id,
          source: 'resend',
          resentFromId: original.id,
        },
        () =>
          this.mail.sendMail({
            to: original.to_address,
            subject,
            html: html || `<p>${original.body_text}</p>`,
            text: original.body_text || undefined,
          }),
      );
    } else {
      const body = (original.body_text || '').trim();
      if (!body) {
        throw new BadRequestException('Cannot resend: SMS body is empty');
      }
      await runWithOutboundContext(
        {
          schoolId: original.school_id,
          templateKey: original.template_key,
          recipientUserId: original.recipient_user_id,
          source: 'resend',
          resentFromId: original.id,
        },
        () => this.sms.sendSms({ to: original.to_address, body }),
      );
    }

    const latest = await this.repo.findOne({
      where: { resent_from_id: original.id },
      order: { created_at: 'DESC' },
    });
    if (!latest) {
      throw new BadRequestException('Resend did not produce a transaction log entry');
    }
    return latest;
  }

  private assertCanAccess(
    actor: User,
    row: OutboundMessageTransaction,
    requestedSchoolId?: string | null,
  ): void {
    if (isPlatformActor(actor)) {
      if (requestedSchoolId && row.school_id && row.school_id !== requestedSchoolId) {
        throw new NotFoundException('Transaction not found');
      }
      return;
    }
    const schoolId = actor.school_id;
    if (!schoolId || row.school_id !== schoolId) {
      throw new NotFoundException('Transaction not found');
    }
  }
}
