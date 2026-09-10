import { MigrationInterface, QueryRunner } from 'typeorm';
import { defaultPlatformNotificationLayoutHtml } from '../notifications/school-notification-branding';

/** Arabic header: pack title to the right and sit the logo at the end of the title. */
export class FikrSystemEmailArabicLogoAfterTitle1792020000000 implements MigrationInterface {
  name = 'FikrSystemEmailArabicLogoAfterTitle1792020000000';

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
