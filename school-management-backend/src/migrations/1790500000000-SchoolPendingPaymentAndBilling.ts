import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * After platform approval, a school stays pending_payment until the owner
 * pays the first invoice (Thawani). Adds billing page, invoice Thawani columns,
 * and approval-email copy that includes login + pay instructions.
 */
export class SchoolPendingPaymentAndBilling1790500000000 implements MigrationInterface {
  name = 'SchoolPendingPaymentAndBilling1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools" DROP CONSTRAINT IF EXISTS "CHK_schools_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD CONSTRAINT "CHK_schools_status"
      CHECK ("status" IN ('pending', 'pending_payment', 'active', 'suspended', 'rejected'))
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      ADD COLUMN IF NOT EXISTS "thawani_session_id" varchar(128) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      ADD COLUMN IF NOT EXISTS "thawani_invoice" varchar(64) NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_platform_invoices_thawani_session"
      ON "platform_invoices" ("thawani_session_id")
    `);

    const page = RBAC_PAGE_SEED.find((p) => p.key === 'school_billing');
    if (page) {
      await queryRunner.query(
        `INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT ("key") DO UPDATE SET
           "route" = EXCLUDED."route",
           "nameEn" = EXCLUDED."nameEn",
           "nameAr" = EXCLUDED."nameAr",
           "scope" = EXCLUDED."scope",
           "sortOrder" = EXCLUDED."sortOrder",
           "isActive" = true`,
        [page.key, page.route, page.nameEn, page.nameAr, page.scope, page.sortOrder],
      );

      const actionRows: { id: number; code: string }[] = await queryRunner.query(
        `SELECT id, code FROM "rbac_actions"`,
      );
      const actionIdByCode = new Map(actionRows.map((r) => [r.code, r.id]));
      const pageRows: { id: number; key: string }[] = await queryRunner.query(
        `SELECT id, key FROM "rbac_pages" WHERE key = $1`,
        [page.key],
      );
      const pageId = pageRows[0]?.id;
      if (pageId) {
        for (const code of page.actions) {
          const actionId = actionIdByCode.get(code);
          if (!actionId) continue;
          await queryRunner.query(
            `INSERT INTO "rbac_page_actions" ("pageId", "actionId")
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [pageId, actionId],
          );
        }
      }
    }

    await queryRunner.query(`
      UPDATE "platform_modules"
      SET "page_keys" = "page_keys" || '["school_billing"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'dashboard'
        AND NOT ("page_keys" @> '["school_billing"]'::jsonb)
    `);

    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT gp."groupId", dest."id", pa."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'settings'
       JOIN "rbac_pages" dest ON dest.key = 'school_billing'
       JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id
       ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
       SELECT rp."roleId", dest."id", pa."actionId"
       FROM "rbac_role_permissions" rp
       JOIN "rbac_pages" src ON src.id = rp."pageId" AND src.key = 'settings'
       JOIN "rbac_pages" dest ON dest.key = 'school_billing'
       JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id
       ON CONFLICT DO NOTHING`,
    );

    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "description" = 'Sent to the school owner when the platform approves the school: temporary login and a reminder to pay the subscription.',
        "default_subject" = '{{schoolName}} is approved — sign in and pay',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>Registration for <strong>{{schoolName}}</strong> is approved. Your school will stay pending payment until the subscription is paid.</p><p>Sign in with <strong>{{email}}</strong><br/>Temporary password: <strong>{{tempPassword}}</strong></p><p>Plan: <strong>{{planName}}</strong> — amount due: <strong>{{amount}} {{currency}}</strong></p><p>After you sign in, open <strong>Payment</strong> and complete checkout with Thawani.</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>Change the password after you sign in.</p>$html$,
        "default_body_sms" = '{{schoolName}} approved. {{email}} / {{tempPassword}}. Pay {{amount}} {{currency}} after sign-in.',
        "default_subject_ar" = 'تمت الموافقة على {{schoolName}} — سجّل الدخول وادفع',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تمت الموافقة على تسجيل <strong>{{schoolName}}</strong>. تبقى المدرسة قيد الدفع حتى يتم سداد الاشتراك.</p><p>سجّل الدخول بـ <strong>{{email}}</strong><br/>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>الخطة: <strong>{{planName}}</strong> — المبلغ المستحق: <strong>{{amount}} {{currency}}</strong></p><p>بعد تسجيل الدخول افتح <strong>الدفع</strong> وأكمل العملية عبر ثواني.</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>غيّر كلمة المرور بعد تسجيل الدخول.</p>$html$,
        "default_body_sms_ar" = 'تمت الموافقة على {{schoolName}}. {{email}} / {{tempPassword}}. ادفع {{amount}} {{currency}} بعد الدخول.',
        "factory_subject" = '{{schoolName}} is approved — sign in and pay',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>Registration for <strong>{{schoolName}}</strong> is approved. Your school will stay pending payment until the subscription is paid.</p><p>Sign in with <strong>{{email}}</strong><br/>Temporary password: <strong>{{tempPassword}}</strong></p><p>Plan: <strong>{{planName}}</strong> — amount due: <strong>{{amount}} {{currency}}</strong></p><p>After you sign in, open <strong>Payment</strong> and complete checkout with Thawani.</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>Change the password after you sign in.</p>$html$,
        "factory_body_sms" = '{{schoolName}} approved. {{email}} / {{tempPassword}}. Pay {{amount}} {{currency}} after sign-in.',
        "factory_subject_ar" = 'تمت الموافقة على {{schoolName}} — سجّل الدخول وادفع',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تمت الموافقة على تسجيل <strong>{{schoolName}}</strong>. تبقى المدرسة قيد الدفع حتى يتم سداد الاشتراك.</p><p>سجّل الدخول بـ <strong>{{email}}</strong><br/>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>الخطة: <strong>{{planName}}</strong> — المبلغ المستحق: <strong>{{amount}} {{currency}}</strong></p><p>بعد تسجيل الدخول افتح <strong>الدفع</strong> وأكمل العملية عبر ثواني.</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>غيّر كلمة المرور بعد تسجيل الدخول.</p>$html$,
        "factory_body_sms_ar" = 'تمت الموافقة على {{schoolName}}. {{email}} / {{tempPassword}}. ادفع {{amount}} {{currency}} بعد الدخول.',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"},{"name":"email","description":"Login email"},{"name":"tempPassword","description":"Temporary password"},{"name":"schoolName","description":"School name"},{"name":"planName","description":"Selected plan"},{"name":"amount","description":"Invoice amount"},{"name":"currency","description":"Currency code"},{"name":"loginUrl","description":"Sign-in URL"}]'::jsonb
      WHERE "template_key" = 'platform.school_approved'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools" DROP CONSTRAINT IF EXISTS "CHK_schools_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD CONSTRAINT "CHK_schools_status"
      CHECK ("status" IN ('pending', 'active', 'suspended', 'rejected'))
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_platform_invoices_thawani_session"`);
    await queryRunner.query(`ALTER TABLE "platform_invoices" DROP COLUMN IF EXISTS "thawani_invoice"`);
    await queryRunner.query(`ALTER TABLE "platform_invoices" DROP COLUMN IF EXISTS "thawani_session_id"`);
  }
}
