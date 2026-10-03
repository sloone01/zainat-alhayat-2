import { MigrationInterface, QueryRunner } from 'typeorm';
import { CLEAR_NOTIFICATION_COPY } from '../notifications/clear-notification-copy';
import {
  defaultPlatformNotificationLayoutHtml,
  refreshNotificationLayoutHtml,
} from '../notifications/school-notification-branding';

/**
 * Split the email header (name at the reading start, logo at the far end)
 * and replace thin stock bodies with a heading, labeled facts, and a next step.
 */
export class ClearerNotificationEmails1792680000000 implements MigrationInterface {
  name = 'ClearerNotificationEmails1792680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schoolLayouts: Array<{ id: string; html_en: string; html_ar: string | null }> =
      await queryRunner.query(
        `SELECT id, html_en, html_ar FROM "school_notification_layouts"`,
      );
    for (const row of schoolLayouts) {
      const htmlEn = refreshNotificationLayoutHtml(row.html_en || '', 'en');
      const htmlAr = refreshNotificationLayoutHtml(row.html_ar || row.html_en || '', 'ar');
      if (htmlEn === (row.html_en || '') && htmlAr === (row.html_ar || '')) continue;
      await queryRunner.query(
        `UPDATE "school_notification_layouts"
         SET html_en = $1, html_ar = $2, updated_at = now()
         WHERE id = $3`,
        [htmlEn, htmlAr, row.id],
      );
    }

    await queryRunner.query(
      `UPDATE "platform_notification_layouts"
       SET html_en = $1, html_ar = $2, updated_at = now()
       WHERE is_default = true OR name = 'Default email layout'`,
      [defaultPlatformNotificationLayoutHtml('en'), defaultPlatformNotificationLayoutHtml('ar')],
    );

    for (const [key, copy] of Object.entries(CLEAR_NOTIFICATION_COPY)) {
      await queryRunner.query(
        `UPDATE "school_notification_templates"
         SET body_html_override = NULL, body_html_override_ar = NULL
         WHERE template_key = $1
           AND (
             COALESCE(body_html_override, '') ILIKE '%schoolLogoHtml%'
             OR COALESCE(body_html_override, '') ILIKE '%<!DOCTYPE%'
             OR COALESCE(body_html_override_ar, '') ILIKE '%schoolLogoHtml%'
             OR COALESCE(body_html_override_ar, '') ILIKE '%<!DOCTYPE%'
           )`,
        [key],
      );

      const sets = [
        `"default_body_html" = $2`,
        `"default_body_html_ar" = $3`,
        `"factory_body_html" = $2`,
        `"factory_body_html_ar" = $3`,
      ];
      const params: unknown[] = [key, copy.htmlEn, copy.htmlAr];
      if (copy.smsEn != null && copy.smsAr != null) {
        sets.push(`"default_body_sms" = $4`, `"default_body_sms_ar" = $5`);
        sets.push(`"factory_body_sms" = $4`, `"factory_body_sms_ar" = $5`);
        params.push(copy.smsEn, copy.smsAr);
      }
      await queryRunner.query(
        `UPDATE "notification_template_definitions" SET ${sets.join(', ')} WHERE "template_key" = $1`,
        params,
      );
    }
  }

  public async down(): Promise<void> {
    // Content refresh — previous bodies remain in git history.
  }
}
