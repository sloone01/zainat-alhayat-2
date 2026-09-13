import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutboundMessageTransaction } from '../entities/outbound-message-transaction.entity';
import { getOutboundContext } from './outbound-message-context';

export type SendSmsOptions = {
  to: string;
  body: string;
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(OutboundMessageTransaction)
    private readonly txRepo: Repository<OutboundMessageTransaction>,
  ) {}

  isConfigured(): boolean {
    const provider = this.provider();
    if (provider === 'log') return true;
    if (provider === 'http') return !!this.config.get<string>('SMS_HTTP_URL')?.trim();
    return false;
  }

  private provider(): string {
    return (this.config.get<string>('SMS_PROVIDER') || 'log').trim().toLowerCase();
  }

  async sendSms(options: SendSmsOptions): Promise<void> {
    const to = options.to?.trim();
    const body = options.body?.trim();
    if (!to) throw new Error('Recipient phone is required');
    if (!body) throw new Error('SMS body is required');
    const ctx = getOutboundContext();

    const provider = this.provider();
    if (provider === 'http') {
      const url = this.config.get<string>('SMS_HTTP_URL')?.trim();
      if (!url) {
        this.logger.warn(`SMS skipped (SMS_HTTP_URL missing) to ${to}`);
        await this.persistTx({
          to,
          body,
          status: 'skipped',
          errorMessage: 'SMS_HTTP_URL missing',
          ctx,
        });
        throw new Error('SMS_HTTP_URL missing');
      }
      const token = this.config.get<string>('SMS_HTTP_TOKEN')?.trim();
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ to, body }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`SMS HTTP ${res.status} ${text.slice(0, 200)}`);
        }
        this.logger.log(`SMS sent to ${to} via HTTP`);
        await this.persistTx({ to, body, status: 'sent', errorMessage: null, ctx });
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await this.persistTx({ to, body, status: 'failed', errorMessage: msg, ctx });
        throw err;
      }
    }

    this.logger.log(`[SMS:${provider}] to=${to} body=${body.slice(0, 160)}`);
    await this.persistTx({
      to,
      body,
      status: 'sent',
      errorMessage: null,
      ctx: { ...(ctx ?? {}), source: ctx?.source ?? `sms_${provider}` },
    });
  }

  private async persistTx(input: {
    to: string;
    body: string;
    status: 'sent' | 'failed' | 'skipped';
    errorMessage: string | null;
    ctx: ReturnType<typeof getOutboundContext>;
  }): Promise<void> {
    try {
      await this.txRepo.save(
        this.txRepo.create({
          channel: 'sms',
          status: input.status,
          to_address: input.to,
          subject: null,
          body_html: null,
          body_text: input.body,
          template_key: input.ctx?.templateKey ?? null,
          school_id: input.ctx?.schoolId ?? null,
          recipient_user_id: input.ctx?.recipientUserId ?? null,
          error_message: input.errorMessage,
          provider_message_id: null,
          source: input.ctx?.source ?? null,
          resent_from_id: input.ctx?.resentFromId ?? null,
          sent_at: input.status === 'sent' ? new Date() : null,
        }),
      );
    } catch (logErr) {
      const msg = logErr instanceof Error ? logErr.message : String(logErr);
      this.logger.warn(`Failed to persist SMS transaction log: ${msg}`);
    }
  }
}
