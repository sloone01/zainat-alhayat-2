import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolMessageLetter } from '../entities/school-message-letter.entity';
import { Activity } from '../entities/activity.entity';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { DirectChatMessage } from '../entities/direct-chat-message.entity';
import { applyNotificationTemplateVariables } from './notification-template.service';

export type LetterLocale = 'en' | 'ar';

export type RenderedMessageLetter = {
  locale: LetterLocale;
  subject: string;
  body_html: string;
  body_sms: string;
  preview_text: string;
};

/** Stored on each chat message: letter reference + frozen variables at send time. */
export type MessageLetterChatMetadata = {
  kind: 'message_letter';
  letterId: string;
  letterVariables: Record<string, string>;
  renderedLocale: LetterLocale;
  /** Letter row `updated_at` when the message was sent (detect template edits). */
  letterUpdatedAt: string | null;
  title: string;
  previewText: string;
  requiresApproval?: boolean;
  approval?: { status?: string; resolvedAt?: string; resolverUserId?: string };
  activityId?: string;
  activityTitle?: string;
};

@Injectable()
export class MessageLetterRenderService {
  constructor(
    @InjectRepository(SchoolMessageLetter)
    private readonly letterRepo: Repository<SchoolMessageLetter>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DirectChatMessage)
    private readonly messageRepo: Repository<DirectChatMessage>,
  ) {}

  stripHtml(html: string): string {
    return String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatActivityDateTime(
    activity: Activity,
    locale: LetterLocale,
    kind: 'start' | 'end',
  ): string {
    const loc = locale === 'ar' ? 'ar' : 'en';
    const raw = activity.activity_date;
    const d =
      raw instanceof Date
        ? raw.toISOString().split('T')[0]
        : String(raw ?? '').split('T')[0];
    const time =
      kind === 'end'
        ? activity.end_time || activity.start_time || ''
        : activity.start_time || '';
    const t = time ? String(time).slice(0, 5) : '';
    try {
      const iso = t ? `${d}T${t}:00` : `${d}T12:00:00`;
      return new Date(iso).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return d || '—';
    }
  }

  async buildVariablesForParentUser(
    recipientUserId: string,
    schoolId: number,
    activity?: Activity | null,
  ): Promise<Record<string, string>> {
    const recipient = await this.userRepo.findOne({ where: { id: recipientUserId } });
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    const parentName = recipient
      ? `${recipient.firstName ?? ''} ${recipient.lastName ?? ''}`.trim()
      : '';

    let studentNames: string[] = [];
    if (recipient) {
      const rows: { name: string }[] = await this.userRepo.manager.query(
        `
        SELECT trim(concat(s."firstName", ' ', s."lastName")) AS name
        FROM parents p
        INNER JOIN student_parents sp ON sp.parent_id = p.id
        INNER JOIN students s ON s.id = sp.student_id AND s.school_id = $1
        WHERE p.user_id = $2::uuid
        ${activity?.group_id ? 'AND s.group_id = $3::uuid' : ''}
        ORDER BY s."lastName", s."firstName"
        `,
        activity?.group_id
          ? [schoolId, recipientUserId, activity.group_id]
          : [schoolId, recipientUserId],
      );
      studentNames = rows.map((r) => r.name).filter(Boolean);
    }

    const vars: Record<string, string> = {
      parentName: parentName || 'Parent',
      schoolName: school?.name?.trim() || 'School',
      studentName: studentNames.length ? studentNames.join(', ') : '',
      teacherName: '',
    };

    return vars;
  }

  renderLetter(
    letter: SchoolMessageLetter,
    locale: LetterLocale,
    variables: Record<string, string>,
  ): RenderedMessageLetter {
    const subjectRaw = locale === 'ar' ? letter.subject_ar : letter.subject_en;
    const bodyHtmlRaw = locale === 'ar' ? letter.body_html_ar : letter.body_html_en;
    const bodySmsRaw = locale === 'ar' ? letter.body_sms_ar : letter.body_sms_en;

    const subject = applyNotificationTemplateVariables(subjectRaw, variables);
    const body_html = applyNotificationTemplateVariables(bodyHtmlRaw, variables);
    const body_sms = applyNotificationTemplateVariables(bodySmsRaw ?? '', variables);
    const preview_text = (body_sms.trim() || this.stripHtml(body_html)).slice(0, 500);

    return { locale, subject, body_html, body_sms, preview_text };
  }

  async buildVariablesForLetterRecipient(
    letter: SchoolMessageLetter,
    recipientUserId: string,
    locale: LetterLocale = 'ar',
  ): Promise<Record<string, string>> {
    let activity: Activity | null = null;
    if (letter.activity_id) {
      activity = await this.activityRepo.findOne({ where: { id: letter.activity_id } });
    }
    const vars = await this.buildVariablesForParentUser(
      recipientUserId,
      letter.school_id,
      activity,
    );
    if (activity) {
      vars.activityStartDate = this.formatActivityDateTime(activity, locale, 'start');
      vars.activityEndDate = this.formatActivityDateTime(activity, locale, 'end');
    }
    return vars;
  }

  async renderForRecipient(
    letter: SchoolMessageLetter,
    recipientUserId: string,
    locale: LetterLocale = 'ar',
  ): Promise<RenderedMessageLetter> {
    const vars = await this.buildVariablesForLetterRecipient(letter, recipientUserId, locale);
    return this.renderLetter(letter, locale, vars);
  }

  parseMetadata(meta: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!meta || typeof meta !== 'object') return null;
    return meta;
  }

  parseStoredLetterVariables(meta: Record<string, unknown>): Record<string, string> | null {
    const raw = meta['letterVariables'];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (value == null) continue;
      out[key] = typeof value === 'string' ? value : String(value);
    }
    return Object.keys(out).length ? out : null;
  }

  private async activityTitleForLetter(letter: SchoolMessageLetter): Promise<string | null> {
    if (!letter.activity_id) return null;
    const act = await this.activityRepo.findOne({ where: { id: letter.activity_id } });
    return act?.title ?? null;
  }

  /**
   * Resolve display for a chat message.
   * Legacy rows may still carry a full HTML snapshot; new rows use letterId + letterVariables.
   */
  async resolveDisplayForMessage(
    messageId: string,
    recipientUserId: string,
    locale: LetterLocale = 'ar',
  ): Promise<RenderedMessageLetter & { activity_title: string | null; letter_id: string | null }> {
    const msg = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    const meta =
      msg.metadata && typeof msg.metadata === 'object'
        ? (msg.metadata as Record<string, unknown>)
        : typeof msg.metadata === 'string'
          ? (JSON.parse(msg.metadata) as Record<string, unknown>)
          : null;

    if (meta?.['kind'] !== 'message_letter') {
      throw new NotFoundException('Not a message letter');
    }

    const storedLocale = (meta['renderedLocale'] as LetterLocale) || locale;
    const storedSubject = meta['renderedSubject'] ? String(meta['renderedSubject']) : '';
    const storedHtml = meta['renderedBodyHtml'] ? String(meta['renderedBodyHtml']) : '';
    const storedPreview = meta['renderedPreview'] ? String(meta['renderedPreview']) : '';
    const storedSms = meta['renderedBodySms'] ? String(meta['renderedBodySms']) : '';

    if (storedSubject && storedHtml) {
      return {
        locale: storedLocale,
        subject: storedSubject,
        body_html: storedHtml,
        body_sms: storedSms,
        preview_text: storedPreview || storedSms || this.stripHtml(storedHtml).slice(0, 500),
        activity_title: meta['activityTitle'] ? String(meta['activityTitle']) : null,
        letter_id: meta['letterId'] ? String(meta['letterId']) : null,
      };
    }

    const letterId = meta['letterId'] ? String(meta['letterId']) : '';
    if (!letterId) {
      throw new NotFoundException('Letter not found for this message');
    }
    const letter = await this.letterRepo.findOne({ where: { id: letterId } });
    if (!letter) throw new NotFoundException('Letter not found');

    const storedVariables = this.parseStoredLetterVariables(meta);
    if (storedVariables) {
      const rendered = this.renderLetter(letter, storedLocale, storedVariables);
      const activity_title =
        (meta['activityTitle'] ? String(meta['activityTitle']) : null) ||
        (await this.activityTitleForLetter(letter));
      return {
        ...rendered,
        activity_title,
        letter_id: letter.id,
      };
    }

    const rendered = await this.renderForRecipient(letter, recipientUserId, locale);
    const activity_title =
      (meta['activityTitle'] ? String(meta['activityTitle']) : null) ||
      (await this.activityTitleForLetter(letter));

    return {
      ...rendered,
      activity_title,
      letter_id: letter.id,
    };
  }
}
