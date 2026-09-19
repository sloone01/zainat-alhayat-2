import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SchoolSystemSetting } from '../entities/school-system-setting.entity';
import { User } from '../entities/user.entity';
import { isParentOrStudentActor } from '../common/security/school-access';

export const CHAT_ADMIN_REVIEW_KEY = 'chat.adminReviewEnabled';

export type ChatReviewKind = 'class' | 'direct' | 'room';

export type ChatReviewHit = {
  kind: ChatReviewKind;
  id: string;
  title: string;
  roomKind: string | null;
  preview: string;
  lastAt: string;
};

export type ChatReviewMessage = {
  id: string;
  userId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

@Injectable()
export class ChatAuditService {
  constructor(
    @InjectRepository(SchoolSystemSetting)
    private readonly settings: Repository<SchoolSystemSetting>,
    private readonly dataSource: DataSource,
  ) {}

  /** Value stamped on a message at send time. Missing setting = off. */
  async flagForSchool(schoolId: string | null | undefined): Promise<boolean> {
    if (!schoolId) return false;
    const row = await this.settings.findOne({
      where: { school_id: schoolId, setting_key: CHAT_ADMIN_REVIEW_KEY },
      select: ['id', 'value_json'],
    });
    return row?.value_json === true;
  }

  async noticeForUser(user: User): Promise<boolean> {
    const schoolIds = new Set<string>();
    if (user.school_id) schoolIds.add(String(user.school_id));
    if (isParentOrStudentActor(user)) {
      if (user.role === 'parent' || user.user_type === 'parent') {
        const rows: { school_id: string }[] = await this.dataSource.query(
          `SELECT DISTINCT st.school_id
           FROM parents p
           INNER JOIN student_parents sp ON sp.parent_id = p.id
           INNER JOIN students st ON st.id = sp.student_id
           WHERE p.user_id = $1 AND st.school_id IS NOT NULL`,
          [user.id],
        );
        for (const row of rows) schoolIds.add(String(row.school_id));
      }
      if (user.role === 'student' || user.user_type === 'student') {
        const rows: { school_id: string }[] = await this.dataSource.query(
          `SELECT school_id FROM students WHERE user_id = $1 AND school_id IS NOT NULL`,
          [user.id],
        );
        for (const row of rows) schoolIds.add(String(row.school_id));
      }
    }
    for (const schoolId of schoolIds) {
      if (await this.flagForSchool(schoolId)) return true;
    }
    return false;
  }

  async search(
    schoolId: string,
    q: string,
    page: number,
    limit: number,
    side?: 'groups' | 'single' | null,
  ): Promise<{ items: ChatReviewHit[]; total: number; page: number; limit: number; pages: number }> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.min(50, Math.max(1, Math.floor(limit))) : 20;
    const offset = (safePage - 1) * safeLimit;
    const trimmed = q.trim();
    const like = trimmed ? `%${trimmed.replace(/[%_\\]/g, '')}%` : null;

    const rows: Array<{
      kind: ChatReviewKind;
      id: string;
      title: string;
      room_kind: string | null;
      preview: string | null;
      last_at: Date | string;
      total: string;
    }> = await this.dataSource.query(
      `
      SELECT kind, id, title, room_kind, preview, last_at, total
      FROM (
        SELECT u.*, COUNT(*) OVER() AS total
        FROM (
          SELECT
            'class'::text AS kind,
            g.id::text AS id,
            g.name AS title,
            NULL::text AS room_kind,
            prev.body AS preview,
            prev.created_at AS last_at
          FROM groups g
          JOIN LATERAL (
            SELECT body, created_at
            FROM group_chat_messages m
            WHERE m.group_id = g.id AND m.admin_review = true
            ORDER BY created_at DESC
            LIMIT 1
          ) prev ON true
          WHERE g.school_id = $1
            AND (
              $2::text IS NULL
              OR g.name ILIKE $2
              OR EXISTS (
                SELECT 1 FROM group_chat_messages m
                WHERE m.group_id = g.id AND m.admin_review = true AND m.body ILIKE $2
              )
            )

          UNION ALL

          SELECT
            'room'::text AS kind,
            r.id::text AS id,
            r.name AS title,
            r.kind AS room_kind,
            prev.body AS preview,
            prev.created_at AS last_at
          FROM adhoc_chat_rooms r
          JOIN LATERAL (
            SELECT body, created_at
            FROM adhoc_chat_messages m
            WHERE m.room_id = r.id AND m.admin_review = true
            ORDER BY created_at DESC
            LIMIT 1
          ) prev ON true
          WHERE r.school_id = $1
            AND (
              $2::text IS NULL
              OR r.name ILIKE $2
              OR EXISTS (
                SELECT 1 FROM adhoc_chat_messages m
                WHERE m.room_id = r.id AND m.admin_review = true AND m.body ILIKE $2
              )
              OR EXISTS (
                SELECT 1
                FROM adhoc_chat_room_members mem
                JOIN users u ON u.id = mem.user_id
                WHERE mem.room_id = r.id
                  AND (
                    u."firstName" ILIKE $2
                    OR u."lastName" ILIKE $2
                    OR concat(u."firstName", ' ', u."lastName") ILIKE $2
                  )
              )
            )

          UNION ALL

          SELECT
            'direct'::text AS kind,
            t.id::text AS id,
            trim(concat(lo."firstName", ' ', lo."lastName", ' · ', hi."firstName", ' ', hi."lastName")) AS title,
            NULL::text AS room_kind,
            prev.body AS preview,
            prev.created_at AS last_at
          FROM direct_chat_threads t
          JOIN users lo ON lo.id = t.user_low_id
          JOIN users hi ON hi.id = t.user_high_id
          JOIN LATERAL (
            SELECT body, created_at
            FROM direct_chat_messages m
            WHERE m.thread_id = t.id AND m.admin_review = true
            ORDER BY created_at DESC
            LIMIT 1
          ) prev ON true
          WHERE t.school_id = $1
            AND (
              $2::text IS NULL
              OR lo."firstName" ILIKE $2
              OR lo."lastName" ILIKE $2
              OR hi."firstName" ILIKE $2
              OR hi."lastName" ILIKE $2
              OR concat(lo."firstName", ' ', lo."lastName") ILIKE $2
              OR concat(hi."firstName", ' ', hi."lastName") ILIKE $2
              OR EXISTS (
                SELECT 1 FROM direct_chat_messages m
                WHERE m.thread_id = t.id AND m.admin_review = true AND m.body ILIKE $2
              )
            )
        ) u
        WHERE $5::text IS NULL
          OR ($5 = 'groups' AND u.kind IN ('class', 'room'))
          OR ($5 = 'single' AND u.kind = 'direct')
      ) numbered
      ORDER BY last_at DESC NULLS LAST
      LIMIT $3 OFFSET $4
      `,
      [schoolId, like, safeLimit, offset, side || null],
    );

    const total = rows.length ? Number(rows[0].total) || 0 : 0;
    const items: ChatReviewHit[] = rows.map((row) => ({
      kind: row.kind,
      id: row.id,
      title: (row.title || '').trim() || '—',
      roomKind: row.room_kind,
      preview: (row.preview || '').slice(0, 160),
      lastAt: row.last_at instanceof Date ? row.last_at.toISOString() : String(row.last_at),
    }));
    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      pages: total ? Math.ceil(total / safeLimit) : 0,
    };
  }

  async messages(schoolId: string, kind: string, id: string): Promise<ChatReviewMessage[]> {
    if (kind !== 'class' && kind !== 'direct' && kind !== 'room') {
      throw new BadRequestException('Unknown conversation');
    }
    const sql =
      kind === 'class'
        ? `
          SELECT m.id, m.user_id, m.body, m.created_at,
                 u."firstName" AS first_name, u."lastName" AS last_name, u.email
          FROM group_chat_messages m
          JOIN groups g ON g.id = m.group_id AND g.school_id = $1
          JOIN users u ON u.id = m.user_id
          WHERE m.group_id = $2 AND m.admin_review = true
          ORDER BY m.created_at ASC
          LIMIT 300
        `
        : kind === 'direct'
          ? `
          SELECT m.id, m.user_id, m.body, m.created_at,
                 u."firstName" AS first_name, u."lastName" AS last_name, u.email
          FROM direct_chat_messages m
          JOIN direct_chat_threads t ON t.id = m.thread_id AND t.school_id = $1
          JOIN users u ON u.id = m.user_id
          WHERE m.thread_id = $2 AND m.admin_review = true
          ORDER BY m.created_at ASC
          LIMIT 300
        `
          : `
          SELECT m.id, m.user_id, m.body, m.created_at,
                 u."firstName" AS first_name, u."lastName" AS last_name, u.email
          FROM adhoc_chat_messages m
          JOIN adhoc_chat_rooms r ON r.id = m.room_id AND r.school_id = $1
          JOIN users u ON u.id = m.user_id
          WHERE m.room_id = $2 AND m.admin_review = true
          ORDER BY m.created_at ASC
          LIMIT 300
        `;
    const rows: Array<{
      id: string;
      user_id: string;
      body: string;
      created_at: Date | string;
      first_name: string;
      last_name: string;
      email: string;
    }> = await this.dataSource.query(sql, [schoolId, id]);
    if (!rows.length) {
      const exists = await this.conversationInSchool(schoolId, kind, id);
      if (!exists) throw new NotFoundException('Conversation not found');
    }
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      senderName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email || '—',
      body: row.body,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }));
  }

  private async conversationInSchool(schoolId: string, kind: ChatReviewKind, id: string): Promise<boolean> {
    const sql =
      kind === 'class'
        ? `SELECT 1 FROM groups WHERE id = $2 AND school_id = $1`
        : kind === 'direct'
          ? `SELECT 1 FROM direct_chat_threads WHERE id = $2 AND school_id = $1`
          : `SELECT 1 FROM adhoc_chat_rooms WHERE id = $2 AND school_id = $1`;
    const rows = await this.dataSource.query(sql, [schoolId, id]);
    return rows.length > 0;
  }
}
