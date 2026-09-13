import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tighten default notification email card margins and lighten the header wash.
 * Updates shared branding defaults (code) are separate; this rewrites stored layout HTML.
 */
export class LightenNotificationLayoutCard1786000000000 implements MigrationInterface {
  name = 'LightenNotificationLayoutCard1786000000000';

  private rewrite(html: string): string {
    return html
      .replaceAll(
        'padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;',
        'padding:12px 16px;background:linear-gradient(135deg,#f5f3ff,#fdf2f8);color:#5b21b6;',
      )
      .replaceAll('padding:24px 28px;', 'padding:12px 16px;')
      .replaceAll(
        'margin:0;padding:24px;background:#f3f4f6;',
        'margin:0;padding:8px;background:#f3f4f6;',
      )
      .replaceAll(
        'padding:16px 28px;border-top:1px solid #e5e7eb;',
        'padding:10px 16px;border-top:1px solid #e5e7eb;',
      )
      .replaceAll('padding:24px;background:#f3f4f6;', 'padding:8px;background:#f3f4f6;');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['school_notification_layouts', 'platform_notification_layouts']) {
      const exists = await queryRunner.query(
        `SELECT to_regclass($1) AS reg`,
        [`public.${table}`],
      );
      if (!exists?.[0]?.reg) continue;
      const rows: Array<{ id: string; html_en: string; html_ar: string }> = await queryRunner.query(
        `SELECT id, html_en, html_ar FROM ${table}`,
      );
      for (const row of rows) {
        await queryRunner.query(
          `UPDATE ${table} SET html_en = $1, html_ar = $2 WHERE id = $3`,
          [this.rewrite(row.html_en || ''), this.rewrite(row.html_ar || ''), row.id],
        );
      }
    }
  }

  public async down(): Promise<void> {
    // Irreversible style rewrite — no-op
  }
}
