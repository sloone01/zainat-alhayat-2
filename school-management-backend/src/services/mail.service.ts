import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const status = this.getStatus();
    if (status.configured) {
      this.logger.log(`SMTP ready (${status.host}:${status.port}, from ${status.from})`);
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
    });
    return this.transporter;
  }

  async verifyConnection(): Promise<void> {
    const transport = this.getTransporter();
    await transport.verify();
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const to = options.to?.trim();
    if (!to) throw new Error('Recipient email is required');
    const transport = this.getTransporter();
    const info = await transport.sendMail({
      from: this.getFromAddress(),
      to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? this.stripHtml(options.html),
    });
    this.logger.log(`Email sent to ${to} (messageId=${info.messageId ?? 'n/a'})`);
  }

  async sendTest(to: string): Promise<void> {
    await this.verifyConnection();
    await this.sendMail({
      to,
      subject: 'Zinat Al-Haya — SMTP test',
      html: '<p>If you received this, outbound email from the school app is working.</p>',
      text: 'If you received this, outbound email from the school app is working.',
    });
  }

  private stripHtml(html: string): string {
    return String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
