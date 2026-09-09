import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { MailService } from '../../services/mail.service';

export type ErrorAlertSource = 'api' | 'client';

export type ErrorAlertPayload = {
  source: ErrorAlertSource;
  message: string;
  stack?: string;
  statusCode?: number;
  method?: string;
  path?: string;
  userId?: number | string | null;
  schoolId?: number | string | null;
  requestId?: string;
  ticket?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  extra?: Record<string, unknown>;
};

@Injectable()
export class ErrorAlertService {
  private readonly logger = new Logger(ErrorAlertService.name);
  /** fingerprint → last sent epoch ms */
  private readonly recent = new Map<string, number>();
  private sending = false;
  private sentThisHour = 0;
  private hourWindowStart = Date.now();

  constructor(
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  isEnabled(): boolean {
    const flag = this.config.get<string>('ERROR_ALERT_ENABLED');
    if (flag === 'false' || flag === '0') return false;
    return Boolean(this.getRecipients().length) && this.mail.isConfigured();
  }

  getRecipients(): string[] {
    const raw = this.config.get<string>('ERROR_ALERT_EMAIL')?.trim() || '';
    return raw
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  minStatus(): number {
    const n = Number(this.config.get('ERROR_ALERT_MIN_STATUS') ?? 500);
    return Number.isFinite(n) ? n : 500;
  }

  cooldownMs(): number {
    const n = Number(this.config.get('ERROR_ALERT_COOLDOWN_MS') ?? 300_000);
    return Number.isFinite(n) && n >= 0 ? n : 300_000;
  }

  maxPerHour(): number {
    const n = Number(this.config.get('ERROR_ALERT_MAX_PER_HOUR') ?? 30);
    return Number.isFinite(n) && n > 0 ? n : 30;
  }

  /**
   * Fire-and-forget alert. Never throws — must not break the request path.
   * Emails unexpected / high-severity errors (and all client crash reports).
   */
  notify(payload: ErrorAlertPayload): void {
    void this.notifyAsync(payload).catch((err) => {
      this.logger.warn(
        `Error alert email failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }

  private async notifyAsync(payload: ErrorAlertPayload): Promise<void> {
    if (!this.isEnabled()) return;

    const status = payload.statusCode ?? 500;
    if (payload.source === 'api' && status < this.minStatus()) return;

    if (this.sending) {
      this.logger.debug('Skipping nested error alert while another send is in progress');
      return;
    }

    const now = Date.now();
    if (now - this.hourWindowStart > 3_600_000) {
      this.hourWindowStart = now;
      this.sentThisHour = 0;
    }
    if (this.sentThisHour >= this.maxPerHour()) {
      this.logger.warn(
        `Error alert hourly cap (${this.maxPerHour()}) reached — skipping email`,
      );
      return;
    }

    const fingerprint = payload.ticket || this.fingerprint(payload);
    const last = this.recent.get(fingerprint);
    if (last != null && now - last < this.cooldownMs()) {
      this.logger.debug(`Deduped error alert (${fingerprint.slice(0, 8)}…)`);
      return;
    }

    this.sending = true;
    try {
      const recipients = this.getRecipients();
      const subject = this.buildSubject(payload);
      const html = this.buildHtml(payload);
      const text = this.buildText(payload);

      for (const to of recipients) {
        await this.mail.sendMail({ to, subject, html, text });
      }

      this.recent.set(fingerprint, now);
      this.sentThisHour += 1;
      this.pruneRecent(now);
      this.logger.log(
        `Error alert emailed to ${recipients.join(', ')} ticket=${payload.ticket || '—'} [${payload.source}] ${payload.message.slice(0, 120)}`,
      );
    } finally {
      this.sending = false;
    }
  }

  private fingerprint(payload: ErrorAlertPayload): string {
    const key = [
      payload.source,
      payload.statusCode ?? '',
      payload.method ?? '',
      payload.path ?? payload.url ?? '',
      payload.message.slice(0, 200),
      (payload.stack || '').split('\n')[0] ?? '',
    ].join('|');
    return createHash('sha256').update(key).digest('hex');
  }

  private pruneRecent(now: number): void {
    const ttl = Math.max(this.cooldownMs() * 2, 600_000);
    for (const [k, ts] of this.recent) {
      if (now - ts > ttl) this.recent.delete(k);
    }
  }

  private buildSubject(payload: ErrorAlertPayload): string {
    const app = this.config.get<string>('APP_NAME') || 'FIKR';
    const ticket = payload.ticket ? `${payload.ticket} — ` : '';
    const code = payload.statusCode ? ` ${payload.statusCode}` : '';
    const src = payload.source === 'client' ? 'Client' : 'API';
    const short = payload.message.replace(/\s+/g, ' ').slice(0, 80);
    return `[${app}] ${ticket}${src} error${code}: ${short}`;
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildHtml(payload: ErrorAlertPayload): string {
    const rows: [string, string][] = [
      ['Ticket', payload.ticket ?? '—'],
      ['Source', payload.source],
      ['Time (UTC)', new Date().toISOString()],
      ['Status', String(payload.statusCode ?? '—')],
      ['Method', payload.method ?? '—'],
      ['Path', payload.path ?? '—'],
      ['URL', payload.url ?? '—'],
      ['Request ID', payload.requestId ?? '—'],
      ['User ID', payload.userId != null ? String(payload.userId) : '—'],
      ['School ID', payload.schoolId != null ? String(payload.schoolId) : '—'],
      ['Component', payload.component ?? '—'],
      ['User-Agent', payload.userAgent ?? '—'],
      ['Message', payload.message],
    ];

    const table = rows
      .map(
        ([k, v]) =>
          `<tr><th style="text-align:left;padding:6px 10px;background:#f3f4f6;vertical-align:top">${this.escapeHtml(k)}</th><td style="padding:6px 10px;font-family:ui-monospace,monospace;white-space:pre-wrap">${this.escapeHtml(v)}</td></tr>`,
      )
      .join('');

    const stack = payload.stack
      ? `<h3 style="margin:20px 0 8px">Stack trace</h3><pre style="background:#111827;color:#e5e7eb;padding:14px;border-radius:8px;overflow:auto;font-size:12px;line-height:1.45">${this.escapeHtml(payload.stack)}</pre>`
      : '';

    const extra =
      payload.extra && Object.keys(payload.extra).length
        ? `<h3 style="margin:20px 0 8px">Extra</h3><pre style="background:#f9fafb;padding:12px;border-radius:8px;overflow:auto;font-size:12px">${this.escapeHtml(JSON.stringify(payload.extra, null, 2))}</pre>`
        : '';

    return `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:720px">
        <h2 style="margin:0 0 12px;color:#0A2147">Application error${payload.ticket ? ` — ${this.escapeHtml(payload.ticket)}` : ''}</h2>
        <p style="color:#4b5563;margin:0 0 16px">An error was captured by the FIKR error handler. Quote the ticket number when following up.</p>
        <table style="border-collapse:collapse;width:100%;border:1px solid #e5e7eb">${table}</table>
        ${stack}
        ${extra}
      </div>
    `;
  }

  private buildText(payload: ErrorAlertPayload): string {
    const lines = [
      `Ticket: ${payload.ticket ?? '—'}`,
      `Source: ${payload.source}`,
      `Time (UTC): ${new Date().toISOString()}`,
      `Status: ${payload.statusCode ?? '—'}`,
      `Method: ${payload.method ?? '—'}`,
      `Path: ${payload.path ?? '—'}`,
      `URL: ${payload.url ?? '—'}`,
      `Request ID: ${payload.requestId ?? '—'}`,
      `User ID: ${payload.userId ?? '—'}`,
      `School ID: ${payload.schoolId ?? '—'}`,
      `Component: ${payload.component ?? '—'}`,
      `User-Agent: ${payload.userAgent ?? '—'}`,
      `Message: ${payload.message}`,
      '',
      payload.stack ? `Stack:\n${payload.stack}` : '',
      payload.extra ? `Extra:\n${JSON.stringify(payload.extra, null, 2)}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  }
}
