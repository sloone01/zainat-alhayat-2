import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { SchoolMessageLetter } from '../entities/school-message-letter.entity';
import { Activity } from '../entities/activity.entity';
import { DirectChatMessage } from '../entities/direct-chat-message.entity';
import type {
  CreateSchoolMessageLetterDto,
  DispatchSchoolMessageLetterDto,
  MessageLetterAudiencePreviewDto,
  UpdateSchoolMessageLetterDto,
} from '../dto/message-letter.dto';
import type { MeetingRoomInviteDto } from '../dto/meeting-room.dto';
import { MeetingRoomService } from './meeting-room.service';
import { DirectChatService } from '../chat/direct-chat.service';
import { audienceFromActivity } from './activity-message-letter.helper';
import { MessageLetterRenderService, type LetterLocale } from './message-letter-render.service';
import { MailService } from './mail.service';

export type MessageLetterAudience = MeetingRoomInviteDto;

export type MessageLetterLocaleBlock = {
  subject: string;
  body_html: string;
  body_sms: string | null;
};

export type MessageLetterSource = 'custom' | 'activity';

export type MessageLetterApprovalStatus = 'not_sent' | 'pending' | 'approved' | 'rejected';

export type MessageLetterApprovalStudent = {
  id: string;
  name: string;
};

export type MessageLetterApprovalRecipientRow = {
  message_id: string;
  thread_id: string | null;
  letter_id: string;
  letter_title: string;
  activity_id: string | null;
  activity_title: string | null;
  sent_at: string | null;
  recipient_user_id: string;
  recipient_name: string;
  recipient_phone: string | null;
  students: MessageLetterApprovalStudent[];
  approval_status: MessageLetterApprovalStatus;
  approval_resolved_at: string | null;
};

export type SchoolMessageLetterRow = {
  id: string;
  school_id: number;
  title: string;
  source: MessageLetterSource;
  activity_id: string | null;
  requires_approval: boolean;
  audience: MessageLetterAudience;
  en: MessageLetterLocaleBlock;
  ar: MessageLetterLocaleBlock;
  recipient_count: number;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class MessageLetterService {
  constructor(
    @InjectRepository(SchoolMessageLetter)
    private readonly letterRepo: Repository<SchoolMessageLetter>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(DirectChatMessage)
    private readonly chatMessageRepo: Repository<DirectChatMessage>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly meetingRoomService: MeetingRoomService,
    private readonly directChatService: DirectChatService,
    private readonly letterRender: MessageLetterRenderService,
    private readonly mailService: MailService,
  ) {}

  private assertAdminSchool(user: User, schoolId: number): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage message letters');
    }
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only manage letters for your school');
    }
  }

  private normalizeAudience(raw: Record<string, unknown>): MessageLetterAudience {
    const o = raw && typeof raw === 'object' ? raw : {};
    return {
      allParents: Boolean(o['allParents']),
      allTeachers: Boolean(o['allTeachers']),
      allStudents: Boolean(o['allStudents']),
      groupIds: Array.isArray(o['groupIds']) ? (o['groupIds'] as string[]) : [],
      userIds: Array.isArray(o['userIds']) ? (o['userIds'] as string[]) : [],
    };
  }

  private async recipientCount(schoolId: number, audience: MessageLetterAudience): Promise<number> {
    const ids = await this.meetingRoomService.resolveAudienceUserIds(schoolId, audience);
    return ids.length;
  }

  private toRow(
    entity: SchoolMessageLetter,
    recipient_count: number,
    requires_approval = false,
  ): SchoolMessageLetterRow {
    const aud = this.normalizeAudience(entity.audience);
    return {
      id: entity.id,
      school_id: entity.school_id,
      title: entity.title,
      source: entity.activity_id ? 'activity' : 'custom',
      activity_id: entity.activity_id ?? null,
      requires_approval,
      audience: aud,
      en: {
        subject: entity.subject_en,
        body_html: entity.body_html_en,
        body_sms: entity.body_sms_en,
      },
      ar: {
        subject: entity.subject_ar,
        body_html: entity.body_html_ar,
        body_sms: entity.body_sms_ar,
      },
      recipient_count,
      created_at: entity.created_at?.toISOString?.() ?? '',
      updated_at: entity.updated_at?.toISOString?.() ?? '',
    };
  }

  private async syncLinkedActivityAudience(letter: SchoolMessageLetter): Promise<MessageLetterAudience> {
    if (!letter.activity_id) {
      return this.normalizeAudience(letter.audience);
    }
    const activity = await this.activityRepo.findOne({ where: { id: letter.activity_id } });
    if (!activity) {
      return this.normalizeAudience(letter.audience);
    }
    const audience = audienceFromActivity(activity);
    letter.audience = audience as unknown as Record<string, unknown>;
    letter.title = activity.title.trim();
    await this.letterRepo.save(letter);
    return audience;
  }

  variableHints(): { name: string; description: string }[] {
    return [
      { name: 'schoolName', description: 'School display name' },
      { name: 'studentName', description: 'Student full name' },
      { name: 'parentName', description: 'Parent or guardian name' },
      { name: 'teacherName', description: 'Teacher name' },
      { name: 'activityStartDate', description: 'Activity start date' },
      { name: 'activityEndDate', description: 'Activity end date' },
    ];
  }

  async sampleVariables(user: User, schoolId: number): Promise<Record<string, string>> {
    this.assertAdminSchool(user, schoolId);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return {
      schoolName: school?.name?.trim() || 'Your School',
      studentName: 'Ahmad Ali',
      parentName: 'Fatima Al Kindi',
      teacherName: 'Mr. Hassan',
      activityStartDate: today,
      activityEndDate: today,
    };
  }

  async audiencePreview(user: User, dto: MessageLetterAudiencePreviewDto): Promise<{ count: number }> {
    this.assertAdminSchool(user, dto.school_id);
    const count = await this.recipientCount(dto.school_id, dto.audience);
    return { count };
  }

  private parseApprovalStatus(metadata: Record<string, unknown> | null): {
    status: MessageLetterApprovalStatus;
    resolved_at: string | null;
  } {
    const approval = metadata?.['approval'] as { status?: string; resolvedAt?: string } | undefined;
    const raw = approval?.status;
    if (raw === 'approved' || raw === 'rejected') {
      return { status: raw, resolved_at: approval?.resolvedAt ?? null };
    }
    return { status: 'pending', resolved_at: null };
  }

  private parseStudentsJson(
    raw: MessageLetterApprovalStudent[] | string | null,
  ): MessageLetterApprovalStudent[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .filter((s): s is { id: string; name: string } => {
              return (
                s != null &&
                typeof s === 'object' &&
                typeof (s as { id?: unknown }).id === 'string'
              );
            })
            .map((s) => ({
              id: s.id,
              name: String((s as { name?: unknown }).name ?? '').trim() || s.id,
            }));
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  private async loadAudienceRecipientRows(
    schoolId: number,
    letter: SchoolMessageLetter,
    recipientUserIds: string[],
  ): Promise<MessageLetterApprovalRecipientRow[]> {
    if (!recipientUserIds.length) return [];

    let activityTitle: string | null = null;
    if (letter.activity_id) {
      const act = await this.activityRepo.findOne({
        where: { id: letter.activity_id, school_id: schoolId },
        select: ['title'],
      });
      activityTitle = act?.title ?? null;
    }

    type RawAudienceRow = {
      recipient_user_id: string;
      recipient_first_name: string | null;
      recipient_last_name: string | null;
      recipient_email: string | null;
      recipient_phone: string | null;
      students_json: MessageLetterApprovalStudent[] | string | null;
    };

    const rows: RawAudienceRow[] = await this.chatMessageRepo.manager.query(
      `
      SELECT
        u.id AS recipient_user_id,
        u."firstName" AS recipient_first_name,
        u."lastName" AS recipient_last_name,
        u.email AS recipient_email,
        NULLIF(TRIM(COALESCE(p.phone, u.phone, '')), '') AS recipient_phone,
        COALESCE(st.students_json, '[]'::json) AS students_json
      FROM users u
      LEFT JOIN parents p ON p.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', trim(concat(s."firstName", ' ', s."lastName"))
            )
            ORDER BY s."lastName", s."firstName"
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS students_json
        FROM student_parents sp
        INNER JOIN students s ON s.id = sp.student_id AND s.school_id = $1
        WHERE sp.parent_id = p.id
      ) st ON true
      WHERE u.id = ANY($2::uuid[])
      ORDER BY u."lastName", u."firstName"
      `,
      [schoolId, recipientUserIds],
    );

    return rows.map((r) => {
      const name =
        `${r.recipient_first_name ?? ''} ${r.recipient_last_name ?? ''}`.trim() ||
        r.recipient_email ||
        r.recipient_user_id;
      return {
        message_id: `unsent:${r.recipient_user_id}`,
        thread_id: null,
        letter_id: letter.id,
        letter_title: letter.title,
        activity_id: letter.activity_id ?? null,
        activity_title: activityTitle,
        sent_at: null,
        recipient_user_id: r.recipient_user_id,
        recipient_name: name,
        recipient_phone: r.recipient_phone ?? null,
        students: this.parseStudentsJson(r.students_json),
        approval_status: 'not_sent',
        approval_resolved_at: null,
      };
    });
  }

  private applyApprovalRecipientFilters(
    rows: MessageLetterApprovalRecipientRow[],
    filters?: {
      recipient_user_id?: string;
      student_id?: string;
      activity_id?: string;
      approval_status?: MessageLetterApprovalStatus;
    },
  ): MessageLetterApprovalRecipientRow[] {
    let out = rows;
    if (filters?.recipient_user_id) {
      out = out.filter((r) => r.recipient_user_id === filters.recipient_user_id);
    }
    if (filters?.student_id) {
      out = out.filter((r) => r.students.some((s) => s.id === filters.student_id));
    }
    if (filters?.activity_id) {
      out = out.filter((r) => r.activity_id === filters.activity_id);
    }
    if (filters?.approval_status) {
      out = out.filter((r) => r.approval_status === filters.approval_status);
    }
    return out;
  }

  async listApprovalRecipients(
    user: User,
    schoolId: number,
    filters?: {
      letter_id?: string;
      recipient_user_id?: string;
      student_id?: string;
      activity_id?: string;
      approval_status?: MessageLetterApprovalStatus;
      locale?: LetterLocale;
    },
  ): Promise<MessageLetterApprovalRecipientRow[]> {
    this.assertAdminSchool(user, schoolId);

    type RawRow = {
      message_id: string;
      thread_id: string | null;
      sent_at: Date | string;
      metadata: Record<string, unknown> | null;
      letter_id: string | null;
      letter_title: string | null;
      activity_id: string | null;
      activity_title: string | null;
      recipient_user_id: string;
      recipient_first_name: string | null;
      recipient_last_name: string | null;
      recipient_email: string | null;
      recipient_phone: string | null;
      students_json: MessageLetterApprovalStudent[] | string | null;
    };

    const params: unknown[] = [schoolId];
    let paramIdx = 2;
    let extraWhere = '';

    if (filters?.recipient_user_id) {
      extraWhere += ` AND (
        CASE
          WHEN m.user_id = t.user_low_id THEN t.user_high_id
          ELSE t.user_low_id
        END
      ) = $${paramIdx}`;
      params.push(filters.recipient_user_id);
      paramIdx += 1;
    }

    if (filters?.student_id) {
      extraWhere += ` AND EXISTS (
        SELECT 1
        FROM parents p_f
        INNER JOIN student_parents sp_f ON sp_f.parent_id = p_f.id
        WHERE p_f.user_id = ru.id AND sp_f.student_id = $${paramIdx}::uuid
      )`;
      params.push(filters.student_id);
      paramIdx += 1;
    }

    if (filters?.letter_id) {
      extraWhere += ` AND (ml.id = $${paramIdx}::uuid OR m.metadata->>'letterId' = $${paramIdx}::text)`;
      params.push(filters.letter_id);
      paramIdx += 1;
    }

    if (filters?.activity_id) {
      extraWhere += ` AND (ml.activity_id = $${paramIdx}::uuid OR m.metadata->>'activityId' = $${paramIdx}::text)`;
      params.push(filters.activity_id);
      paramIdx += 1;
    }

    const rows: RawRow[] = await this.chatMessageRepo.manager.query(
      `
      SELECT
        m.id AS message_id,
        m.thread_id AS thread_id,
        m.created_at AS sent_at,
        m.metadata AS metadata,
        ml.id AS letter_id,
        ml.title AS letter_title,
        ml.activity_id AS activity_id,
        act.title AS activity_title,
        CASE
          WHEN m.user_id = t.user_low_id THEN t.user_high_id
          ELSE t.user_low_id
        END AS recipient_user_id,
        ru."firstName" AS recipient_first_name,
        ru."lastName" AS recipient_last_name,
        ru.email AS recipient_email,
        NULLIF(TRIM(COALESCE(p.phone, ru.phone, '')), '') AS recipient_phone,
        COALESCE(st.students_json, '[]'::json) AS students_json
      FROM direct_chat_messages m
      INNER JOIN direct_chat_threads t ON t.id = m.thread_id
      LEFT JOIN school_message_letters ml
        ON ml.id::text = m.metadata->>'letterId'
      LEFT JOIN activities act ON act.id = ml.activity_id
      INNER JOIN users ru ON ru.id = (
        CASE
          WHEN m.user_id = t.user_low_id THEN t.user_high_id
          ELSE t.user_low_id
        END
      )
      LEFT JOIN parents p ON p.user_id = ru.id
      LEFT JOIN LATERAL (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', trim(concat(s."firstName", ' ', s."lastName"))
            )
            ORDER BY s."lastName", s."firstName"
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS students_json
        FROM student_parents sp
        INNER JOIN students s ON s.id = sp.student_id AND s.school_id = $1
        WHERE sp.parent_id = p.id
      ) st ON true
      WHERE t.school_id = $1
        AND m.metadata->>'kind' = 'message_letter'
        AND (
          COALESCE(m.metadata->>'requiresApproval', 'false') = 'true'
          OR (m.metadata->'requiresApproval')::text = 'true'
          OR m.metadata->'approval' IS NOT NULL
        )
        ${extraWhere}
      ORDER BY m.created_at DESC
      `,
      params,
    );

    const mapped = rows.map((r) => {
      const meta =
        r.metadata && typeof r.metadata === 'object'
          ? r.metadata
          : typeof r.metadata === 'string'
            ? (JSON.parse(r.metadata) as Record<string, unknown>)
            : null;
      const titleFromMeta = meta ? String(meta['title'] ?? '') : '';
      const letterIdFromMeta = meta ? String(meta['letterId'] ?? '') : '';
      const { status, resolved_at } = this.parseApprovalStatus(meta);
      const name =
        `${r.recipient_first_name ?? ''} ${r.recipient_last_name ?? ''}`.trim() ||
        r.recipient_email ||
        r.recipient_user_id;
      const sent =
        r.sent_at instanceof Date ? r.sent_at.toISOString() : String(r.sent_at ?? '');

      const students = this.parseStudentsJson(r.students_json);

      return {
        message_id: r.message_id,
        thread_id: r.thread_id ?? null,
        letter_id: r.letter_id ?? letterIdFromMeta,
        letter_title: (r.letter_title ?? titleFromMeta) || '—',
        activity_id: r.activity_id ?? null,
        activity_title: r.activity_title ?? null,
        sent_at: sent,
        recipient_user_id: r.recipient_user_id,
        recipient_name: name,
        recipient_phone: r.recipient_phone ?? null,
        students,
        approval_status: status,
        approval_resolved_at: resolved_at,
      };
    });

    const loc = filters?.locale ?? 'ar';

    if (!filters?.letter_id) {
      const enriched = await this.enrichApprovalRowsWithRendered(mapped, loc);
      return this.applyApprovalRecipientFilters(enriched, filters);
    }

    const letter = await this.letterRepo.findOne({
      where: { id: filters.letter_id, school_id: schoolId },
    });
    if (!letter) {
      return this.applyApprovalRecipientFilters(mapped, filters);
    }

    const audience = await this.syncLinkedActivityAudience(letter);
    const recipientIds = await this.meetingRoomService.resolveAudienceUserIds(schoolId, audience);
    const audienceRows = await this.loadAudienceRecipientRows(schoolId, letter, recipientIds);

    const byRecipient = new Map<string, MessageLetterApprovalRecipientRow>();
    for (const row of audienceRows) {
      byRecipient.set(row.recipient_user_id, row);
    }
    for (const row of mapped) {
      byRecipient.set(row.recipient_user_id, row);
    }

    const merged = [...byRecipient.values()].sort((a, b) => {
      const aUnsent = a.approval_status === 'not_sent';
      const bUnsent = b.approval_status === 'not_sent';
      if (aUnsent !== bUnsent) return aUnsent ? 1 : -1;
      const aSent = a.sent_at ?? '';
      const bSent = b.sent_at ?? '';
      if (aSent !== bSent) return bSent.localeCompare(aSent);
      return a.recipient_name.localeCompare(b.recipient_name);
    });

    const enrichedMerged = await this.enrichApprovalRowsWithRendered(merged, loc);
    return this.applyApprovalRecipientFilters(enrichedMerged, filters);
  }

  private async enrichApprovalRowsWithRendered(
    rows: MessageLetterApprovalRecipientRow[],
    locale: LetterLocale = 'ar',
  ): Promise<MessageLetterApprovalRecipientRow[]> {
    return Promise.all(
      rows.map(async (row) => {
        if (row.message_id && row.approval_status !== 'not_sent') {
          try {
            const display = await this.letterRender.resolveDisplayForMessage(
              row.message_id,
              row.recipient_user_id,
              locale,
            );
            return { ...row, letter_title: display.subject };
          } catch {
            return row;
          }
        }
        if (!row.letter_id) return row;
        try {
          const letter = await this.letterRepo.findOne({ where: { id: row.letter_id } });
          if (!letter) return row;
          const rendered = await this.letterRender.renderForRecipient(
            letter,
            row.recipient_user_id,
            locale,
          );
          return { ...row, letter_title: rendered.subject };
        } catch {
          return row;
        }
      }),
    );
  }

  private async resolveRequiresApprovalFlags(
    schoolId: number,
    letters: SchoolMessageLetter[],
  ): Promise<Map<string, boolean>> {
    const flags = new Map<string, boolean>();
    if (!letters.length) return flags;

    const activityIds = [
      ...new Set(
        letters.map((l) => l.activity_id).filter((id): id is string => Boolean(id)),
      ),
    ];
    const approvalActivityIds = new Set<string>();
    if (activityIds.length) {
      const activities = await this.activityRepo.find({
        where: { id: In(activityIds), school_id: schoolId },
        select: ['id', 'requires_parent_approval'],
      });
      for (const a of activities) {
        if (a.requires_parent_approval) approvalActivityIds.add(a.id);
      }
    }

    const letterIds = letters.map((l) => l.id);
    const sentRows: { letter_id: string }[] = await this.chatMessageRepo.manager.query(
      `
      SELECT DISTINCT m.metadata->>'letterId' AS letter_id
      FROM direct_chat_messages m
      INNER JOIN direct_chat_threads t ON t.id = m.thread_id
      WHERE t.school_id = $1
        AND m.metadata->>'kind' = 'message_letter'
        AND COALESCE(m.metadata->>'requiresApproval', 'false') = 'true'
        AND m.metadata->>'letterId' = ANY($2::text[])
      `,
      [schoolId, letterIds],
    );
    const sentApprovalLetterIds = new Set(
      sentRows.map((r) => r.letter_id).filter((id): id is string => Boolean(id)),
    );

    for (const letter of letters) {
      const fromActivity =
        letter.activity_id != null && approvalActivityIds.has(letter.activity_id);
      flags.set(letter.id, fromActivity || sentApprovalLetterIds.has(letter.id));
    }
    return flags;
  }

  async list(user: User, schoolId: number): Promise<SchoolMessageLetterRow[]> {
    this.assertAdminSchool(user, schoolId);
    const rows = await this.letterRepo.find({
      where: { school_id: schoolId },
      order: { updated_at: 'DESC' },
    });
    const requiresApprovalByLetterId = await this.resolveRequiresApprovalFlags(schoolId, rows);
    const out: SchoolMessageLetterRow[] = [];
    for (const r of rows) {
      const audience = await this.syncLinkedActivityAudience(r);
      const recipient_count = await this.recipientCount(schoolId, audience);
      out.push(
        this.toRow(r, recipient_count, requiresApprovalByLetterId.get(r.id) ?? false),
      );
    }
    return out;
  }

  async getOne(user: User, schoolId: number, id: string): Promise<SchoolMessageLetterRow> {
    this.assertAdminSchool(user, schoolId);
    const row = await this.letterRepo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Message letter not found');
    const audience = await this.syncLinkedActivityAudience(row);
    const recipient_count = await this.recipientCount(schoolId, audience);
    const flags = await this.resolveRequiresApprovalFlags(schoolId, [row]);
    return this.toRow(row, recipient_count, flags.get(row.id) ?? false);
  }

  async create(user: User, dto: CreateSchoolMessageLetterDto): Promise<SchoolMessageLetterRow> {
    this.assertAdminSchool(user, dto.school_id);
    const e = this.letterRepo.create({
      school_id: dto.school_id,
      title: dto.title.trim(),
      audience: dto.audience as unknown as Record<string, unknown>,
      subject_en: dto.en.subject,
      subject_ar: dto.ar.subject,
      body_html_en: dto.en.body_html,
      body_html_ar: dto.ar.body_html,
      body_sms_en: dto.en.body_sms ?? null,
      body_sms_ar: dto.ar.body_sms ?? null,
      activity_id: null,
    });
    await this.letterRepo.save(e);
    const recipient_count = await this.recipientCount(dto.school_id, dto.audience);
    return this.toRow(e, recipient_count);
  }

  async update(user: User, schoolId: number, id: string, dto: UpdateSchoolMessageLetterDto): Promise<SchoolMessageLetterRow> {
    this.assertAdminSchool(user, schoolId);
    const row = await this.letterRepo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Message letter not found');

    row.subject_en = dto.en.subject;
    row.subject_ar = dto.ar.subject;
    row.body_html_en = dto.en.body_html;
    row.body_html_ar = dto.ar.body_html;
    row.body_sms_en = dto.en.body_sms ?? null;
    row.body_sms_ar = dto.ar.body_sms ?? null;

    if (row.activity_id) {
      const activity = await this.activityRepo.findOne({ where: { id: row.activity_id, school_id: schoolId } });
      if (activity) {
        activity.title = dto.title.trim();
        await this.activityRepo.save(activity);
        row.title = activity.title;
        row.audience = audienceFromActivity(activity) as unknown as Record<string, unknown>;
      }
    } else {
      row.title = dto.title.trim();
      row.audience = dto.audience as unknown as Record<string, unknown>;
    }

    await this.letterRepo.save(row);
    const audience = this.normalizeAudience(row.audience);
    const recipient_count = await this.recipientCount(schoolId, audience);
    return this.toRow(row, recipient_count);
  }

  async remove(user: User, schoolId: number, id: string): Promise<void> {
    this.assertAdminSchool(user, schoolId);
    const row = await this.letterRepo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Message letter not found');
    if (row.activity_id) {
      throw new BadRequestException(
        'This letter is linked to an activity. Turn off parent approval or delete the activity instead.',
      );
    }
    await this.letterRepo.delete({ id, school_id: schoolId });
  }

  private stripHtml(html: string): string {
    return String(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async dispatch(
    user: User,
    letterId: string,
    dto: DispatchSchoolMessageLetterDto,
  ): Promise<{
    channel: string;
    recipient_count: number;
    chat_messages_sent?: number;
    chat_errors?: number;
    email_note?: string;
    email_details?: {
      missing_config?: string[];
      smtp_error?: string;
      emails_sent?: number;
      skipped_no_email?: number;
      failures?: Array<{ user_id: string; email?: string; error: string }>;
    };
  }> {
    this.assertAdminSchool(user, dto.school_id);
    const row = await this.letterRepo.findOne({
      where: { id: letterId, school_id: dto.school_id },
    });
    if (!row) throw new NotFoundException('Message letter not found');

    const audience = await this.syncLinkedActivityAudience(row);
    const recipientIds = await this.meetingRoomService.resolveAudienceUserIds(dto.school_id, audience);
    if (!recipientIds.length) {
      throw new BadRequestException('No recipients match this audience');
    }

    if (dto.channel === 'email') {
      const mailStatus = this.mailService.getStatus();
      if (!mailStatus.configured) {
        return {
          channel: 'email',
          recipient_count: recipientIds.length,
          email_note: `SMTP not configured. Add to school-management-backend/.env: ${mailStatus.missing.join(', ')}. Then restart the backend.`,
          email_details: { missing_config: mailStatus.missing },
        };
      }

      try {
        await this.mailService.verifyConnection();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          channel: 'email',
          recipient_count: recipientIds.length,
          email_note: `SMTP login failed: ${msg}. Check SMTP_USER, SMTP_PASS (Google App Password), and restart the server.`,
          email_details: { smtp_error: msg },
        };
      }

      const locale: LetterLocale = 'ar';
      let emails_sent = 0;
      let skipped_no_email = 0;
      const send_failures: { user_id: string; email?: string; error: string }[] = [];

      for (const rid of recipientIds) {
        try {
          const recipient = await this.userRepo.findOne({ where: { id: rid } });
          const email = recipient?.email?.trim();
          if (!email) {
            skipped_no_email++;
            send_failures.push({
              user_id: rid,
              error: 'User has no email on file',
            });
            continue;
          }
          const rendered = await this.letterRender.renderForRecipient(row, rid, locale);
          const html = rendered.body_html?.trim() || `<p>${rendered.preview_text || rendered.subject}</p>`;
          await this.mailService.sendMail({
            to: email,
            subject: rendered.subject || row.title,
            html,
            text: rendered.preview_text,
          });
          emails_sent++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const recipient = await this.userRepo.findOne({ where: { id: rid } });
          send_failures.push({
            user_id: rid,
            email: recipient?.email ?? undefined,
            error: msg,
          });
        }
      }

      const failCount = send_failures.length;
      let email_note: string;
      if (emails_sent > 0) {
        email_note = `Sent ${emails_sent} of ${recipientIds.length} email(s).`;
        if (skipped_no_email) email_note += ` ${skipped_no_email} user(s) have no email.`;
        if (failCount > emails_sent) {
          const first = send_failures.find((f) => f.error !== 'User has no email on file');
          if (first) email_note += ` First error: ${first.error}`;
        }
        email_note += ' Check spam folder if inbox is empty.';
      } else {
        email_note = `No emails sent (${recipientIds.length} recipients). `;
        if (skipped_no_email === recipientIds.length) {
          email_note += 'None of the selected users have an email address in the system.';
        } else if (send_failures[0]) {
          email_note += `Error: ${send_failures[0].error}`;
        } else {
          email_note += 'Check SMTP settings and recipient emails.';
        }
      }

      return {
        channel: 'email',
        recipient_count: recipientIds.length,
        chat_messages_sent: emails_sent,
        chat_errors: failCount,
        email_note,
        email_details: {
          emails_sent,
          skipped_no_email,
          failures: send_failures.slice(0, 5),
        },
      };
    }

    const official = await this.directChatService.resolveOfficialLetterSenderUser(dto.school_id);
    const requiresApproval = dto.channel === 'chat_approval';
    let activity: Activity | null = null;
    if (row.activity_id) {
      activity = await this.activityRepo.findOne({ where: { id: row.activity_id } });
    }

    let chat_messages_sent = 0;
    let chat_errors = 0;

    for (const rid of recipientIds) {
      try {
        const recipient = await this.directChatService.getUserOrThrow(rid);
        const thread = await this.directChatService.getOrCreateThread(official, recipient);
        const locale: LetterLocale = 'ar';
        const letterVariables = await this.letterRender.buildVariablesForLetterRecipient(
          row,
          rid,
          locale,
        );
        const rendered = this.letterRender.renderLetter(row, locale, letterVariables);
        const meta: Record<string, unknown> = {
          kind: 'message_letter',
          letterId: row.id,
          letterVariables,
          letterUpdatedAt: row.updated_at?.toISOString?.() ?? null,
          renderedLocale: locale,
          title: rendered.subject,
          previewText: rendered.preview_text,
          requiresApproval,
        };
        if (row.activity_id) {
          meta['activityId'] = row.activity_id;
          if (activity?.title) meta['activityTitle'] = activity.title;
        }
        if (requiresApproval) {
          meta['approval'] = { status: 'pending' };
        }
        const bodyLine = `📨 ${rendered.subject}\n\n${
          rendered.preview_text.length > 320
            ? `${rendered.preview_text.slice(0, 317)}…`
            : rendered.preview_text
        }`;
        await this.directChatService.saveMessage(official, thread.id, bodyLine, meta);
        chat_messages_sent++;
      } catch {
        chat_errors++;
      }
    }

    return {
      channel: dto.channel,
      recipient_count: recipientIds.length,
      chat_messages_sent,
      chat_errors,
    };
  }
}
