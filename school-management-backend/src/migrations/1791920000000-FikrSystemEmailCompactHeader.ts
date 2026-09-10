import { MigrationInterface, QueryRunner } from 'typeorm';
import { defaultPlatformNotificationLayoutHtml } from '../notifications/school-notification-branding';

/** Compact logo + title on the opposite side; no white plate behind the mark. */
export class FikrSystemEmailCompactHeader1791920000000 implements MigrationInterface {
  name = 'FikrSystemEmailCompactHeader1791920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "platform_notification_layouts"
       SET "html_en" = $1, "html_ar" = $2, "updated_at" = now()
       WHERE "is_default" = true OR "name" = 'Default email layout'`,
      [
        defaultPlatformNotificationLayoutHtml('en'),
        defaultPlatformNotificationLayoutHtml('ar'),
      ],
    );
  }

  public async down(): Promise<void> {
    // Chrome restyle — revert from git if needed.
  }
}
