import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  injectSchoolLogoPlaceholder,
  wrapEmailWithSchoolChrome,
} from '../notifications/school-notification-branding';

export class NotificationTemplateSchoolBranding1785000000000 implements MigrationInterface {
  name = 'NotificationTemplateSchoolBranding1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{
      template_key: string;
      default_body_html: string | null;
      default_body_html_ar: string | null;
    }> = await queryRunner.query(`
      SELECT "template_key", "default_body_html", "default_body_html_ar"
      FROM "notification_template_definitions"
    `);

    for (const row of rows) {
      const en = this.brandHtml(row.default_body_html, 'en');
      const ar = this.brandHtml(row.default_body_html_ar, 'ar');
      await queryRunner.query(
        `
        UPDATE "notification_template_definitions"
        SET "default_body_html" = $1, "default_body_html_ar" = $2
        WHERE "template_key" = $3
        `,
        [en, ar, row.template_key],
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Branding placeholders stay in defaults; rollback would drop school logos from shared HTML.
  }

  private brandHtml(html: string | null, locale: 'en' | 'ar'): string {
    const raw = html ?? '';
    if (!raw.trim()) return raw;
    const subtitle = locale === 'ar' ? 'إشعار من المدرسة' : 'School notification';
    return wrapEmailWithSchoolChrome(injectSchoolLogoPlaceholder(raw), locale, subtitle);
  }
}
