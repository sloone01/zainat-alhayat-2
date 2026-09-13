import { MigrationInterface, QueryRunner } from 'typeorm';
import { defaultPlatformNotificationLayoutHtml } from '../notifications/school-notification-branding';

/** Title at reading start, logo at the far end (EN left/right swap; AR opposite ends). */
export class FikrSystemEmailHeaderEnds1792040000000 implements MigrationInterface {
  name = 'FikrSystemEmailHeaderEnds1792040000000';

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
    // Chrome tweak — revert from git if needed.
  }
}
