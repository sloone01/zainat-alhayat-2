import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Repository } from 'typeorm';
import { OutboundMessageTransaction } from '../entities/outbound-message-transaction.entity';
import { getOutboundContext, runWithOutboundContext } from '../notifications/outbound-message-context';

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Nodemailer-compatible attachments (path or content). */
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
    cid?: string;
    contentDisposition?: 'inline' | 'attachment';
  }>;
};

export type MailConfigStatus = {
  configured: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  from: string | null;
  user: string | null;
  missing: string[];
};

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private fromAddress = '';

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(OutboundMessageTransaction)
    private readonly txRepo: Repository<OutboundMessageTransaction>,
  ) {}

  onModuleInit(): void {
    const status = this.getStatus();
    if (status.configured) {
      this.logger.log(`SMTP ready (${status.host}:${status.port}, from ${status.from})`);
      void this.warmTransporter();
    } else {
      this.logger.warn(`SMTP not configured — missing: ${status.missing.join(', ')}`);
    }
  }

  getStatus(): MailConfigStatus {
    const host = this.config.get<string>('SMTP_HOST')?.trim() || null;
    const user = this.config.get<string>('SMTP_USER')?.trim() || null;
    const pass = this.normalizePass(this.config.get<string>('SMTP_PASS'));
    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    const secure =
      this.config.get<string>('SMTP_SECURE') === 'true' ||
      this.config.get<string>('SMTP_SECURE') === '1' ||
      port === 465;
    const missing: string[] = [];
    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    return {
      configured: missing.length === 0,
      host,
      port: Number.isNaN(port) ? 587 : port,
      secure,
      from: host && user && pass ? this.getFromAddress() : null,
      user: user ? this.maskEmail(user) : null,
      missing,
    };
  }

  isConfigured(): boolean {
    return this.getStatus().configured;
  }

  getFromAddress(): string {
    if (this.fromAddress) return this.fromAddress;
    const from = this.config.get<string>('EMAIL_FROM')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    this.fromAddress = from || user || 'noreply@school.local';
    return this.fromAddress;
  }

  /** Google app passwords are often copied with spaces — strip them. */
  private normalizePass(raw: string | undefined): string {
    return String(raw ?? '').replace(/\s+/g, '').trim();
  }

  private maskEmail(email: string): string {
    const at = email.indexOf('@');
    if (at < 2) return '***';
    return `${email.slice(0, 2)}***${email.slice(at)}`;
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;
    if (!this.isConfigured()) {
      throw new BadRequestException(
        `SMTP is not configured. Set in school-management-backend/.env: ${this.getStatus().missing.join(', ')}`,
      );
    }
    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    const secure =
      this.config.get<string>('SMTP_SECURE') === 'true' ||
      this.config.get<string>('SMTP_SECURE') === '1' ||
      port === 465;
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST')!.trim(),
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER')!.trim(),
        pass: this.normalizePass(this.config.get<string>('SMTP_PASS')),
      },
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      // Defaults are 2min / 30s / 10min — a blocked Gmail handshake then holds the HTTP request.
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 20_000,
    });
    return this.transporter;
  }

  private async warmTransporter(): Promise<void> {
    const started = Date.now();
    try {
      await this.getTransporter().verify();
      this.logger.log(`SMTP connection ready in ${Date.now() - started}ms`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`SMTP warmup failed after ${Date.now() - started}ms: ${msg}`);
    }
  }

  async verifyConnection(): Promise<void> {
    const transport = this.getTransporter();
    await transport.verify();
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const to = options.to?.trim();
    if (!to) throw new Error('Recipient email is required');
    const ctx = getOutboundContext();
    const text = options.text ?? this.stripHtml(options.html);
    try {
      const transport = this.getTransporter();
      const started = Date.now();
      const info = await transport.sendMail({
        from: this.getFromAddress(),
        to,
        subject: options.subject,
        html: options.html,
        text,
        attachments: options.attachments?.length ? options.attachments : undefined,
      });
      this.logger.log(
        `Email sent to ${to} in ${Date.now() - started}ms (messageId=${info.messageId ?? 'n/a'})`,
      );
      await this.persistTx({
        to,
        subject: options.subject,
        html: options.html,
        text,
        status: 'sent',
        providerMessageId: info.messageId ? String(info.messageId) : null,
        errorMessage: null,
        ctx,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.persistTx({
        to,
        subject: options.subject,
        html: options.html,
        text,
        status: 'failed',
        providerMessageId: null,
        errorMessage: msg,
        ctx,
      });
      throw err;
    }
  }

  async sendTest(to: string, schoolId?: string | null): Promise<void> {
    await this.verifyConnection();
    await runWithOutboundContext(
      { schoolId: schoolId ?? null, source: 'smtp_test', templateKey: null },
      () =>
        this.sendMail({
          to,
          subject: 'Zinat Al-Haya — SMTP test',
          html: '<p>If you received this, outbound email from the school app is working.</p>',
          text: 'If you received this, outbound email from the school app is working.',
        }),
    );
  }

  private async persistTx(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
    status: 'sent' | 'failed';
    providerMessageId: string | null;
    errorMessage: string | null;
    ctx: ReturnType<typeof getOutboundContext>;
  }): Promise<void> {
    try {
      await this.txRepo.save(
        this.txRepo.create({
          channel: 'email',
          status: input.status,
          to_address: input.to,
          subject: input.subject || null,
          body_html: input.html || null,
          body_text: input.text || null,
          template_key: input.ctx?.templateKey ?? null,
          school_id: input.ctx?.schoolId ?? null,
          recipient_user_id: input.ctx?.recipientUserId ?? null,
          error_message: input.errorMessage,
          provider_message_id: input.providerMessageId,
          source: input.ctx?.source ?? null,
          resent_from_id: input.ctx?.resentFromId ?? null,
          sent_at: input.status === 'sent' ? new Date() : null,
        }),
      );
    } catch (logErr) {
      const msg = logErr instanceof Error ? logErr.message : String(logErr);
      this.logger.warn(`Failed to persist email transaction log: ${msg}`);
    }
  }

  private stripHtml(html: string): string {
    return String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
