import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutboundMessageTransaction } from '../entities/outbound-message-transaction.entity';
import { InfobipClient } from './infobip.client';
import { getOutboundContext } from './outbound-message-context';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly infobip: InfobipClient,
    @InjectRepository(OutboundMessageTransaction)
    private readonly txRepo: Repository<OutboundMessageTransaction>,
  ) {}

  isConfigured(): boolean {
    return this.infobip.isConfigured() && Boolean(this.infobip.whatsappFrom());
  }

  /** When true, SMS notifications also go out on WhatsApp (same phone + SMS body). */
  mirrorSms(): boolean {
    if (!this.isConfigured()) return false;
    const flag = this.config.get<string>('INFOBIP_WHATSAPP_MIRROR_SMS')?.trim();
    return flag === 'true' || flag === '1';
  }

  async sendText(options: { to: string; body: string }): Promise<void> {
    const to = options.to?.trim();
    const body = options.body?.trim();
    if (!to) throw new Error('Recipient phone is required');
    if (!body) throw new Error('WhatsApp body is required');
    const ctx = getOutboundContext();
    try {
      const sent = await this.infobip.sendWhatsAppText({ to, body });
      this.logger.log(`WhatsApp sent to ${to}`);
      await this.persistTx({
        to,
        body,
        status: 'sent',
        errorMessage: null,
        providerMessageId: sent.messageId,
        ctx,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.persistTx({ to, body, status: 'failed', errorMessage: msg, ctx });
      throw err;
    }
  }

  private async persistTx(input: {
    to: string;
    body: string;
    status: 'sent' | 'failed';
    errorMessage: string | null;
    providerMessageId?: string | null;
    ctx: ReturnType<typeof getOutboundContext>;
  }): Promise<void> {
    try {
      await this.txRepo.save(
        this.txRepo.create({
          channel: 'whatsapp',
          status: input.status,
          to_address: input.to,
          subject: null,
          body_html: null,
          body_text: input.body,
          template_key: input.ctx?.templateKey ?? null,
          school_id: input.ctx?.schoolId ?? null,
          recipient_user_id: input.ctx?.recipientUserId ?? null,
          error_message: input.errorMessage,
          provider_message_id: input.providerMessageId ?? null,
          source: input.ctx?.source ?? null,
          resent_from_id: input.ctx?.resentFromId ?? null,
          sent_at: input.status === 'sent' ? new Date() : null,
        }),
      );
    } catch (logErr) {
      const msg = logErr instanceof Error ? logErr.message : String(logErr);
      this.logger.warn(`Failed to persist WhatsApp transaction log: ${msg}`);
    }
  }
}
