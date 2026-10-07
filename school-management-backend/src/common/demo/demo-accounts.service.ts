import { ForbiddenException, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, EntityManager } from 'typeorm';
import type { OutboundMessageContext } from '../../notifications/outbound-message-context';

export const DEMO_LOGIN_EMAILS = {
  admin: 'admin@fikr-demo.com',
  teacher: 'teacher@fikr-demo.com',
  driver: 'driver@fikr-demo.com',
  parent: 'parent@fikr-demo.com',
} as const;

const DEMO_SCHOOL_NAME_EN = 'FIKR Demo School';
const DEMO_SCHOOL_NAME_AR = 'مدرسة فكر التجريبية';
const DEMO_LOGO_URL = '/api/public/branding/fikr-logo.png';
const SECOND_DEMO_SLUG = 'fikr-demo-b';
const SCHOOL_IDS_TTL_MS = 10 * 60 * 1000;

/** Existing demo parents whose children already have a class and timetable. */
const PARENT_ADOPT_CANDIDATES = [
  'parent.test@zinat.local',
  'parent_95064063@zinat.local',
  'parent.s1@fikr-demo.com',
  'parent.s3@fikr-demo.com',
];

const PUBLIC_EMAILS = new Set<string>(Object.values(DEMO_LOGIN_EMAILS));

/**
 * Public demo logins on the demo school (`DEMO_SCHOOL_SLUG`).
 * Anyone may sign in, so the logins cannot be changed, nothing real is sent
 * to demo-school people, and the logins + school identity are restored nightly.
 */
@Injectable()
export class DemoAccountsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoAccountsService.name);
  private schoolIds: { at: number; ids: string[] } | null = null;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private enabled(): boolean {
    const flag = (process.env.DEMO_ACCOUNTS_ENABLED ?? 'true').trim().toLowerCase();
    return flag !== 'false' && flag !== '0';
  }

  private demoSlug(): string {
    return (process.env.DEMO_SCHOOL_SLUG || 'zinat-al-haya').trim().toLowerCase();
  }

  private demoPassword(): string {
    return process.env.DEMO_PASSWORD?.trim() || 'DemoPass1';
  }

  isPublicDemoEmail(email?: string | null): boolean {
    return !!email && PUBLIC_EMAILS.has(email.trim().toLowerCase());
  }

  async isPublicDemoUser(userId?: string | null): Promise<boolean> {
    if (!userId || !this.enabled()) return false;
    const rows: Array<{ email: string }> = await this.dataSource.query(
      `SELECT email FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );
    return this.isPublicDemoEmail(rows[0]?.email);
  }

  async assertNotPublicDemoUser(userId?: string | null): Promise<void> {
    if (await this.isPublicDemoUser(userId)) {
      throw new ForbiddenException('Demo accounts cannot be changed');
    }
  }

  async demoSchoolIds(): Promise<string[]> {
    if (this.schoolIds && Date.now() - this.schoolIds.at < SCHOOL_IDS_TTL_MS) {
      return this.schoolIds.ids;
    }
    const rows: Array<{ id: string }> = await this.dataSource.query(
      `SELECT id FROM schools WHERE lower(landing_slug) = ANY($1::text[])`,
      [[this.demoSlug(), SECOND_DEMO_SLUG]],
    );
    const ids = rows.map((r) => r.id);
    this.schoolIds = { at: Date.now(), ids };
    return ids;
  }

  /**
   * True when an email/SMS/WhatsApp must not leave the server: the send runs for a demo
   * school, or the recipient belongs only to demo schools.
   */
  async shouldSuppressOutbound(
    to: string,
    channel: 'email' | 'phone',
    ctx?: OutboundMessageContext | null,
  ): Promise<boolean> {
    if (!this.enabled()) return false;
    try {
      const demo = await this.demoSchoolIds();
      if (!demo.length) return false;
      if (ctx?.schoolId && demo.includes(ctx.schoolId)) return true;
      if (ctx?.recipientUserId && (await this.userIsDemoOnly(ctx.recipientUserId, demo))) return true;
      return channel === 'email'
        ? await this.emailIsDemoOnly(to, demo)
        : await this.phoneIsDemoOnly(to, demo);
    } catch (err) {
      this.logger.warn(`Demo outbound check failed: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }

  /** School ids a user belongs to: staff school, staff memberships, and linked children's schools. */
  private userSchoolsSql(userAlias: string): string {
    return `
      SELECT ${userAlias}.school_id AS sid WHERE ${userAlias}.school_id IS NOT NULL
      UNION SELECT s.school_id FROM staff s WHERE s.user_id = ${userAlias}.id
      UNION SELECT st.school_id FROM parents p
        JOIN student_parents sp ON sp.parent_id = p.id
        JOIN students st ON st.id = sp.student_id
        WHERE p.user_id = ${userAlias}.id
      UNION SELECT st.school_id FROM students st WHERE st.user_id = ${userAlias}.id`;
  }

  private async userIsDemoOnly(userId: string, demo: string[]): Promise<boolean> {
    const rows: Array<{ demo: boolean; other: boolean }> = await this.dataSource.query(
      `SELECT
         bool_or(x.sid = ANY($2::uuid[])) AS demo,
         bool_or(NOT (x.sid = ANY($2::uuid[]))) AS other
       FROM users u
       CROSS JOIN LATERAL (${this.userSchoolsSql('u')}) x
       WHERE u.id = $1`,
      [userId, demo],
    );
    return !!rows[0]?.demo && !rows[0]?.other;
  }

  private async emailIsDemoOnly(to: string, demo: string[]): Promise<boolean> {
    const email = String(to || '').trim().toLowerCase();
    if (!email) return false;
    const rows: Array<{ demo: boolean; other: boolean }> = await this.dataSource.query(
      `WITH hits AS (
         SELECT x.sid FROM users u CROSS JOIN LATERAL (${this.userSchoolsSql('u')}) x
           WHERE lower(u.email) = $1
         UNION ALL
         SELECT COALESCE(st.school_id, p.school_id) FROM parents p
           LEFT JOIN student_parents sp ON sp.parent_id = p.id
           LEFT JOIN students st ON st.id = sp.student_id
           WHERE lower(p.email) = $1
         UNION ALL
         SELECT st.school_id FROM students st WHERE lower(st.email) = $1
       )
       SELECT bool_or(sid = ANY($2::uuid[])) AS demo,
              bool_or(sid IS NOT NULL AND NOT (sid = ANY($2::uuid[]))) AS other
       FROM hits`,
      [email, demo],
    );
    return !!rows[0]?.demo && !rows[0]?.other;
  }

  private async phoneIsDemoOnly(to: string, demo: string[]): Promise<boolean> {
    const digits = String(to || '').replace(/\D/g, '');
    if (digits.length < 8) return false;
    const tail = digits.slice(-8);
    const rows: Array<{ demo: boolean; other: boolean }> = await this.dataSource.query(
      `WITH hits AS (
         SELECT x.sid FROM users u CROSS JOIN LATERAL (${this.userSchoolsSql('u')}) x
           WHERE right(regexp_replace(COALESCE(u.phone, ''), '\\D', '', 'g'), 8) = $1
         UNION ALL
         SELECT COALESCE(st.school_id, p.school_id) FROM parents p
           LEFT JOIN student_parents sp ON sp.parent_id = p.id
           LEFT JOIN students st ON st.id = sp.student_id
           WHERE right(regexp_replace(COALESCE(p.phone, ''), '\\D', '', 'g'), 8) = $1
       )
       SELECT bool_or(sid = ANY($2::uuid[])) AS demo,
              bool_or(sid IS NOT NULL AND NOT (sid = ANY($2::uuid[]))) AS other
       FROM hits`,
      [tail, demo],
    );
    return !!rows[0]?.demo && !rows[0]?.other;
  }

  onApplicationBootstrap(): void {
    if (!this.enabled()) return;
    void this.resetDemo('startup');
  }

  @Cron('0 3 * * *', { timeZone: 'Asia/Muscat' })
  async nightlyReset(): Promise<void> {
    if (!this.enabled()) return;
    await this.resetDemo('nightly');
  }

  /** Restores the four public logins (password, active, school, groups, links) and the school identity. */
  async resetDemo(reason: string): Promise<void> {
    try {
      const schools: Array<{ id: string }> = await this.dataSource.query(
        `SELECT id FROM schools WHERE lower(landing_slug) = $1 LIMIT 1`,
        [this.demoSlug()],
      );
      const schoolId = schools[0]?.id;
      if (!schoolId) {
        this.logger.warn(`Demo reset skipped: no school with slug ${this.demoSlug()}`);
        return;
      }
      const hash = await bcrypt.hash(this.demoPassword(), 10);
      await this.dataSource.transaction(async (m) => {
        await this.resetSchoolIdentity(m, schoolId);
        await this.ensureAdmin(m, schoolId, hash);
        await this.ensureTeacher(m, schoolId, hash);
        await this.ensureDriver(m, schoolId, hash);
        await this.ensureParent(m, schoolId, hash);
      });
      this.schoolIds = null;
      this.logger.log(`Demo accounts reset (${reason})`);
    } catch (err) {
      this.logger.error(`Demo reset failed (${reason}): ${err instanceof Error ? err.message : err}`);
    }
  }

  private async resetSchoolIdentity(m: EntityManager, schoolId: string): Promise<void> {
    await m.query(
      `UPDATE schools SET name = $2, name_en = $2, name_ar = $3, logo_url = $4 WHERE id = $1`,
      [schoolId, DEMO_SCHOOL_NAME_EN, DEMO_SCHOOL_NAME_AR, DEMO_LOGO_URL],
    );
    await m.query(
      `UPDATE school_landing_pages
         SET brand_name_en = $2, brand_name_ar = $3, logo_url = $4, updated_at = NOW()
       WHERE school_id = $1`,
      [schoolId, DEMO_SCHOOL_NAME_EN, DEMO_SCHOOL_NAME_AR, DEMO_LOGO_URL],
    );
  }

  private async findUserId(m: EntityManager, email: string): Promise<string | null> {
    const rows: Array<{ id: string }> = await m.query(
      `SELECT id FROM users WHERE lower(email) = $1 LIMIT 1`,
      [email],
    );
    return rows[0]?.id ?? null;
  }

  private async groupId(
    m: EntityManager,
    where: { schoolId: string; code: string } | { systemKey: string },
  ): Promise<string | null> {
    const rows: Array<{ id: string }> =
      'systemKey' in where
        ? await m.query(`SELECT id FROM rbac_groups WHERE "systemKey" = $1 LIMIT 1`, [where.systemKey])
        : await m.query(
            `SELECT id FROM rbac_groups WHERE "schoolId" = $1 AND code = $2 LIMIT 1`,
            [where.schoolId, where.code],
          );
    return rows[0]?.id ?? null;
  }

  private async ensureMembership(m: EntityManager, userId: string, groupId: string | null) {
    if (!groupId) return;
    await m.query(
      `INSERT INTO rbac_user_group_members ("userId", "groupId", "assignedAt")
       VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
      [userId, groupId],
    );
  }

  private async resetLogin(
    m: EntityManager,
    userId: string,
    hash: string,
    fields: { role: string; userType: string; schoolId: string | null },
  ): Promise<void> {
    await m.query(
      `UPDATE users SET
         password = $2, role = $3, user_type = $4, school_id = $5,
         "isActive" = true, must_change_password = false,
         password_reset_token_hash = NULL, password_reset_expires_at = NULL,
         "updatedAt" = NOW()
       WHERE id = $1`,
      [userId, hash, fields.role, fields.userType, fields.schoolId],
    );
  }

  private async ensureStaffRow(m: EntityManager, userId: string, schoolId: string): Promise<void> {
    await m.query(
      `INSERT INTO staff (user_id, school_id, created_at, updated_at)
       SELECT $1, $2, NOW(), NOW()
       WHERE NOT EXISTS (SELECT 1 FROM staff WHERE user_id = $1 AND school_id = $2)`,
      [userId, schoolId],
    );
  }

  private async createStaffUser(
    m: EntityManager,
    email: string,
    hash: string,
    schoolId: string,
    role: 'admin' | 'teacher',
    names: { firstEn: string; lastEn: string; firstAr: string; lastAr: string },
  ): Promise<string> {
    const rows: Array<{ id: string }> = await m.query(
      `INSERT INTO users (
         email, password, "firstName", "lastName",
         first_name_ar, first_name_en, last_name_ar, last_name_en,
         role, user_type, school_id, "isActive", must_change_password,
         preferred_language, is_system_user, is_super_admin, "createdAt", "updatedAt"
       ) VALUES ($1,$2,$5,$7,$5,$4,$7,$6,$8,'staff',$3,true,false,'ar',false,false,NOW(),NOW())
       RETURNING id`,
      [email, hash, schoolId, names.firstEn, names.firstAr, names.lastEn, names.lastAr, role],
    );
    return rows[0].id;
  }

  private async ensureAdmin(m: EntityManager, schoolId: string, hash: string): Promise<void> {
    const email = DEMO_LOGIN_EMAILS.admin;
    const userId =
      (await this.findUserId(m, email)) ??
      (await this.createStaffUser(m, email, hash, schoolId, 'admin', {
        firstEn: 'Demo',
        lastEn: 'Admin',
        firstAr: 'مدير',
        lastAr: 'تجريبي',
      }));
    await this.resetLogin(m, userId, hash, { role: 'admin', userType: 'staff', schoolId });
    await this.ensureStaffRow(m, userId, schoolId);
    await this.ensureMembership(m, userId, await this.groupId(m, { schoolId, code: 'school_admin' }));
  }

  /** Takes over the demo-school teacher with the most timetable rows so the login opens with real classes. */
  private async ensureTeacher(m: EntityManager, schoolId: string, hash: string): Promise<void> {
    const email = DEMO_LOGIN_EMAILS.teacher;
    let userId = await this.findUserId(m, email);
    if (!userId) {
      const rows: Array<{ id: string }> = await m.query(
        `SELECT u.id FROM users u
           LEFT JOIN schedules s ON s.teacher_id = u.id
         WHERE u.school_id = $1 AND u.role = 'teacher' AND u."isActive" = true
           AND lower(u.email) NOT LIKE '%@fikr-demo.com'
         GROUP BY u.id
         ORDER BY count(s.id) DESC, min(u.email) ASC
         LIMIT 1`,
        [schoolId],
      );
      userId = rows[0]?.id ?? null;
      if (userId) {
        await m.query(`UPDATE users SET email = $2 WHERE id = $1`, [userId, email]);
      } else {
        userId = await this.createStaffUser(m, email, hash, schoolId, 'teacher', {
          firstEn: 'Demo',
          lastEn: 'Teacher',
          firstAr: 'معلمة',
          lastAr: 'تجريبية',
        });
      }
    }
    await this.resetLogin(m, userId, hash, { role: 'teacher', userType: 'staff', schoolId });
    await this.ensureStaffRow(m, userId, schoolId);
    await this.ensureMembership(m, userId, await this.groupId(m, { schoolId, code: 'teacher' }));
  }

  private async ensureDriver(m: EntityManager, schoolId: string, hash: string): Promise<void> {
    const email = DEMO_LOGIN_EMAILS.driver;
    const userId =
      (await this.findUserId(m, email)) ??
      (await this.createStaffUser(m, email, hash, schoolId, 'teacher', {
        firstEn: 'Badr',
        lastEn: 'Al Masoudi',
        firstAr: 'بدر',
        lastAr: 'المسعودي',
      }));
    await this.resetLogin(m, userId, hash, { role: 'teacher', userType: 'staff', schoolId });
    await this.ensureStaffRow(m, userId, schoolId);
    await this.ensureMembership(m, userId, await this.groupId(m, { schoolId, code: 'mod_driver' }));

    const driving: Array<{ id: string }> = await m.query(
      `SELECT id FROM buses WHERE school_id = $1 AND driver_user_id = $2 LIMIT 1`,
      [schoolId, userId],
    );
    if (driving[0]) return;
    const bus: Array<{ id: string }> = await m.query(
      `SELECT id FROM buses WHERE school_id = $1 AND title = 'Demo Bus A' LIMIT 1`,
      [schoolId],
    );
    if (bus[0]) {
      await m.query(
        `UPDATE buses SET driver_user_id = $2, is_active = true, updated_at = NOW() WHERE id = $1`,
        [bus[0].id, userId],
      );
    } else {
      await m.query(
        `INSERT INTO buses (title, driver_name, capacity, is_active, school_id, driver_user_id, created_at, updated_at)
         VALUES ('Demo Bus A', 'بدر المسعودي', 20, true, $1, $2, NOW(), NOW())`,
        [schoolId, userId],
      );
    }
  }

  /** Takes over an existing demo parent whose child already has a class, or creates one linked to a demo child. */
  private async ensureParent(m: EntityManager, schoolId: string, hash: string): Promise<void> {
    const email = DEMO_LOGIN_EMAILS.parent;
    let userId = await this.findUserId(m, email);
    if (!userId) {
      for (const candidate of PARENT_ADOPT_CANDIDATES) {
        const rows: Array<{ id: string }> = await m.query(
          `SELECT u.id FROM users u
             JOIN parents p ON p.user_id = u.id
             JOIN student_parents sp ON sp.parent_id = p.id
             JOIN students st ON st.id = sp.student_id AND st.school_id = $2
           WHERE lower(u.email) = $1
           LIMIT 1`,
          [candidate, schoolId],
        );
        if (rows[0]) {
          userId = rows[0].id;
          await m.query(`UPDATE users SET email = $2 WHERE id = $1`, [userId, email]);
          await m.query(`UPDATE parents SET email = $2 WHERE user_id = $1`, [userId, email]);
          break;
        }
      }
    }
    if (!userId) {
      const created: Array<{ id: string }> = await m.query(
        `INSERT INTO users (
           email, password, "firstName", "lastName",
           first_name_ar, first_name_en, last_name_ar, last_name_en,
           role, user_type, school_id, "isActive", must_change_password,
           preferred_language, is_system_user, is_super_admin, "createdAt", "updatedAt"
         ) VALUES ($1,$2,'ولي','أمر تجريبي','ولي','Demo','أمر تجريبي','Parent','parent','parent',NULL,true,false,'ar',false,false,NOW(),NOW())
         RETURNING id`,
        [email, hash],
      );
      userId = created[0].id;
    }
    await this.resetLogin(m, userId, hash, { role: 'parent', userType: 'parent', schoolId: null });
    await this.ensureMembership(m, userId, await this.groupId(m, { systemKey: 'parent' }));

    let parent: Array<{ id: string }> = await m.query(
      `SELECT id FROM parents WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!parent[0]) {
      parent = await m.query(
        `INSERT INTO parents (
           "firstName", "lastName", email, user_id, school_id,
           first_name_ar, first_name_en, last_name_ar, last_name_en,
           "createdAt", "updatedAt", created_at, updated_at
         ) VALUES ('ولي','أمر تجريبي',$1,$2,NULL,'ولي','Demo','أمر تجريبي','Parent',NOW(),NOW(),NOW(),NOW())
         RETURNING id`,
        [email, userId],
      );
    }
    const linked: Array<{ n: number }> = await m.query(
      `SELECT count(*)::int AS n FROM student_parents sp
         JOIN students st ON st.id = sp.student_id AND st.school_id = $2
       WHERE sp.parent_id = $1`,
      [parent[0].id, schoolId],
    );
    if (linked[0]?.n > 0) return;
    await m.query(
      `INSERT INTO student_parents (student_id, parent_id, relationship)
       SELECT st.id, $1, 'guardian' FROM students st
         JOIN student_groups sg ON sg.student_id = st.id
       WHERE st.school_id = $2
       ORDER BY st.id
       LIMIT 1
       ON CONFLICT DO NOTHING`,
      [parent[0].id, schoolId],
    );
  }
}
