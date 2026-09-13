import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformNotificationLayouts1785700000000 implements MigrationInterface {
  name = 'PlatformNotificationLayouts1785700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_notification_layouts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(160) NOT NULL,
        "name_ar" varchar(160) NULL,
        "html_en" text NOT NULL,
        "html_ar" text NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_notification_layouts"`);
  }
}
