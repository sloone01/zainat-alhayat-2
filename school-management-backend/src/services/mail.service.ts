import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Repository } from 'typeorm';
import { OutboundMessageTransaction } from '../entities/outbound-message-transaction.entity';
import { InfobipClient } from '../notifications/infobip.client';
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
  provider: 'infobip' | 'smtp' | null;
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
    private readonly infobip: InfobipClient,
    @InjectRepository(OutboundMessageTransaction)
    private readonly txRepo: Repository<OutboundMessageTransaction>,
  ) {}

  onModuleInit(): void {
    const status = this.getStatus();
    if (status.provider === 'infobip') {
      this.logger.log(`Infobip email ready (from ${status.from})`);
      return;
    }
    if (status.configured) {
      this.logger.log(`SMTP ready (${status.host}:${status.port}, from ${status.from})`);
      void this.warmTransporter();
    } else {
      this.logger.warn(`Email not configured — missing: ${status.missing.join(', ')}`);
    }
  }

  getStatus(): MailConfigStatus {
    if (this.infobip.isConfigured()) {
      return {
        configured: true,
        provider: 'infobip',
        host: this.infobip.baseUrl(),
        port: 443,
        secure: true,
        from: this.getFromAddress(),
        user: 'infobip',
        missing: [],
      };
    }
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
      provider: missing.length === 0 ? 'smtp' : null,
      host,
      port: Number.isNaN(port) ? 587 : port,
      secure,
      from: host && user && pass ? this.getFromAddress() : null,
      user: user ? this.maskEmail(user) : null,
      missing: missing.length ? [...missing, 'INFOBIP_API_KEY'] : [],
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
    if (this.infobip.isConfigured()) {
      throw new BadRequestException('Email is using Infobip, not SMTP');
    }
    if (!this.isConfigured()) {
      throw new BadRequestException(
        `Email is not configured. Set INFOBIP_API_KEY (recommended) or SMTP_HOST/SMTP_USER/SMTP_PASS.`,
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
      // Railway IPv6 to smtp.gmail.com often hangs until timeout; force IPv4.
      family: 4,
      // Defaults are 2min / 30s / 10min — a blocked Gmail handshake then holds the HTTP request.
      connectionTimeout: 15_000,
      greetingTimeout: 12_000,
      socketTimeout: 25_000,
    } as SMTPTransport.Options);
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
    if (this.infobip.isConfigured()) return;
    const transport = this.getTransporter();
    await transport.verify();
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const to = options.to?.trim();
    if (!to) throw new Error('Recipient email is required');
    const ctx = getOutboundContext();
    const text = options.text ?? this.stripHtml(options.html);
    try {
      const started = Date.now();
      const messageId = this.infobip.isConfigured()
        ? (await this.sendViaInfobip(options, to, text)).messageId
        : await this.sendViaSmtp(options, to, text);
      this.logger.log(
        `Email sent to ${to} in ${Date.now() - started}ms (messageId=${messageId ?? 'n/a'})`,
      );
      await this.persistTx({
        to,
        subject: options.subject,
        html: options.html,
        text,
        status: 'sent',
        providerMessageId: messageId,
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

  private async sendViaInfobip(
    options: SendMailOptions,
    to: string,
    text: string,
  ): Promise<{ messageId: string | null }> {
    const attachments = (options.attachments ?? [])
      .map((att) => {
        let content: Buffer | null = null;
        if (att.content) {
          content = Buffer.isBuffer(att.content)
            ? att.content
            : Buffer.from(String(att.content));
        } else if (att.path) {
          try {
            content = readFileSync(att.path);
          } catch {
            return null;
          }
        }
        if (!content) return null;
        return {
          filename: att.filename,
          content,
          contentType: att.contentType,
          cid: att.cid,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
    return this.infobip.sendEmail({
      from: this.getFromAddress(),
      to,
      subject: options.subject,
      html: options.html,
      text,
      attachments,
    });
  }

  private async sendViaSmtp(
    options: SendMailOptions,
    to: string,
    text: string,
  ): Promise<string | null> {
    const transport = this.getTransporter();
    const info = await transport.sendMail({
      from: this.getFromAddress(),
      to,
      subject: options.subject,
      html: options.html,
      text,
      attachments: options.attachments?.length ? options.attachments : undefined,
    });
    return info.messageId ? String(info.messageId) : null;
  }

  async sendTest(to: string, schoolId?: string | null): Promise<void> {
    if (!this.infobip.isConfigured()) {
      await this.verifyConnection();
    }
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
