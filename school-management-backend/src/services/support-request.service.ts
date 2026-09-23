import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import sanitizeHtml = require('sanitize-html');
import {
  SupportRequest,
  type SupportRequestContext,
  type SupportRequestStatus,
} from '../entities/support-request.entity';
import { MailService, type SendMailOptions } from './mail.service';
import { runWithOutboundContext } from '../notifications/outbound-message-context';
import { uploadsRoot } from '../common/security/runtime-secrets';

/** Who submitted the request, as shown in the notification email. */
export type SupportSubmitter = {
  name: string;
  email: string | null;
  username: string | null;
  role: string | null;
};

/** Only images uploaded through POST /support-requests/images may be embedded. */
const SUPPORT_IMAGE_SRC = /^\/api\/files\/support\/[A-Za-z0-9_.-]+$/;

export function sanitizeSupportHtml(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && !SUPPORT_IMAGE_SRC.test(String(frame.attribs?.src ?? '')),
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  }).trim();
}

/** True when the sanitized HTML has no visible text and no image. */
function isEmptyHtml(html: string): boolean {
  if (/<img\b/i.test(html)) return false;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/&nbsp;/g, ' ').trim() === '';
}

const SUPPORT_IMAGE_FILENAME = /\/api\/files\/support\/([A-Za-z0-9_.-]+)/g;

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Keep only the known context fields (drops class-transformer metadata and empties). */
function normalizeContext(ctx: SupportRequestContext | null | undefined): SupportRequestContext | null {
  if (!ctx) return null;
  const out: SupportRequestContext = {};
  for (const key of ['page_url', 'user_agent', 'viewport', 'language', 'captured_at', 'screenshot_url'] as const) {
    const v = typeof ctx[key] === 'string' ? ctx[key]!.trim() : '';
    if (v) out[key] = v;
  }
  const errors = (ctx.console_errors ?? []).filter((e) => typeof e === 'string' && e.trim());
  if (errors.length) out.console_errors = errors;
  return Object.keys(out).length ? out : null;
}

@Injectable()
export class SupportRequestService {
  private readonly logger = new Logger(SupportRequestService.name);

  constructor(
    @InjectRepository(SupportRequest)
    private readonly repo: Repository<SupportRequest>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(input: {
    userId: string;
    schoolId: string | null;
    title: string;
    descriptionHtml: string;
    context?: SupportRequestContext | null;
    submitter?: SupportSubmitter;
  }): Promise<SupportRequest> {
    const title = (input.title ?? '').trim();
    if (!title) throw new BadRequestException('Title is required');
    const description = sanitizeSupportHtml(input.descriptionHtml);
    if (isEmptyHtml(description)) throw new BadRequestException('Description is required');
    const row = this.repo.create({
      user_id: input.userId,
      school_id: input.schoolId,
      title,
      description_html: description,
      context: normalizeContext(input.context),
      status: 'open',
    });
    const saved = await this.repo.save(row);
    // Fire-and-forget: a mail outage must never fail the user's submission.
    void this.notifyNewRequest(saved, input.submitter);
    return saved;
  }

  /** Emails SUPPORT_NOTIFY_EMAIL about a new request. Never throws. */
  private async notifyNewRequest(row: SupportRequest, submitter?: SupportSubmitter): Promise<void> {
    const to = this.config.get<string>('SUPPORT_NOTIFY_EMAIL')?.trim();
    if (!to) {
      this.logger.debug(`SUPPORT_NOTIFY_EMAIL not set — no email for support request ${row.id}`);
      return;
    }
    try {
      const { html, attachments } = this.buildNotification(row, submitter);
      await runWithOutboundContext(
        { schoolId: row.school_id ?? null, source: 'support_request', templateKey: null },
        () =>
          this.mail.sendMail({
            to,
            subject: `[Support] ${row.title}`.slice(0, 200),
            html,
            attachments,
          }),
      );
      this.logger.log(`Support request ${row.id} emailed to ${to}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Support request ${row.id} saved, but notification email failed: ${msg}`);
    }
  }

  private buildNotification(
    row: SupportRequest,
    submitter?: SupportSubmitter,
  ): { html: string; attachments: NonNullable<SendMailOptions['attachments']> } {
    const ctx = row.context ?? {};
    const attachments: NonNullable<SendMailOptions['attachments']> = [];
    const cidFor = new Map<string, string>();

    // Embed every uploaded image (description images + screenshot) as an inline attachment;
    // /api/files/... URLs need a login, so they would not render in a mail client.
    const filenames = new Set<string>();
    for (const m of row.description_html.matchAll(SUPPORT_IMAGE_FILENAME)) filenames.add(m[1]);
    const screenshotName = ctx.screenshot_url?.split('/').pop();
    if (screenshotName) filenames.add(screenshotName);
    for (const name of filenames) {
      const path = join(uploadsRoot(), 'support', name);
      if (!existsSync(path)) continue;
      const cid = `support-${cidFor.size + 1}@fikr`;
      cidFor.set(name, cid);
      attachments.push({ filename: name, path, cid, contentDisposition: 'inline' });
    }
    const description = row.description_html.replace(SUPPORT_IMAGE_FILENAME, (full, name: string) =>
      cidFor.has(name) ? `cid:${cidFor.get(name)}` : full,
    );

    const who = submitter
      ? [submitter.name, submitter.email, submitter.username && `@${submitter.username}`, submitter.role]
          .filter(Boolean)
          .join(' · ')
      : row.user_id;
    const fields: Array<[string, string | undefined]> = [
      ['Request ID', row.id],
      ['Submitted by', who],
      ['Submitted at', new Date(row.created_at).toISOString()],
      ['School ID', row.school_id ?? undefined],
      ['Page URL', ctx.page_url],
      ['Browser', ctx.user_agent],
      ['Viewport', ctx.viewport],
      ['Language', ctx.language],
      ['Captured at', ctx.captured_at],
    ];
    const rows = fields
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>` +
          `<td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
      )
      .join('');
    const errors = ctx.console_errors?.length
      ? `<h3 style="margin:20px 0 8px">Console errors (${ctx.console_errors.length})</h3>` +
        `<pre style="background:#f3f4f6;padding:12px;border-radius:6px;white-space:pre-wrap;font-size:12px">${escapeHtml(
          ctx.console_errors.join('\n\n'),
        )}</pre>`
      : '';
    const screenshot =
      screenshotName && cidFor.has(screenshotName) && !row.description_html.includes(screenshotName)
        ? `<h3 style="margin:20px 0 8px">Screenshot</h3><img src="cid:${cidFor.get(screenshotName)}" style="max-width:100%;border:1px solid #e5e7eb" />`
        : '';

    const html =
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111827">` +
      `<h2 style="margin:0 0 12px">New support request: ${escapeHtml(row.title)}</h2>` +
      `<table style="border-collapse:collapse;margin-bottom:16px">${rows}</table>` +
      `<h3 style="margin:20px 0 8px">Description</h3>` +
      `<div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px">${description}</div>` +
      screenshot +
      errors +
      `</div>`;
    return { html, attachments };
  }

  findForUser(userId: string): Promise<SupportRequest[]> {
    return this.repo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  findAll(status?: SupportRequestStatus): Promise<SupportRequest[]> {
    const qb = this.repo
      .createQueryBuilder('sr')
      .leftJoin('sr.user', 'user')
      .addSelect([
        'user.id',
        'user.username',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.first_name_ar',
        'user.first_name_en',
        'user.last_name_ar',
        'user.last_name_en',
        'user.role',
      ])
      .orderBy('sr.created_at', 'DESC');
    if (status) qb.where('sr.status = :status', { status });
    return qb.getMany();
  }

  async findOne(id: string): Promise<SupportRequest> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Support request not found');
    return row;
  }

  async updateStatus(id: string, status: SupportRequestStatus): Promise<SupportRequest> {
    const row = await this.findOne(id);
    row.status = status;
    return this.repo.save(row);
  }

  /** Toggle the "fixed" flag; also stamps fixed_at, and flips status to resolved when marked fixed. */
  async updateFixed(id: string, fixed: boolean): Promise<SupportRequest> {
    const row = await this.findOne(id);
    row.fixed = fixed;
    row.fixed_at = fixed ? new Date() : null;
    if (fixed && (row.status === 'open' || row.status === 'in_progress')) {
      row.status = 'resolved';
    }
    return this.repo.save(row);
  }
}
