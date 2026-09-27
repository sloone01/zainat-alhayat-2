import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationOutbox1792650000000 implements MigrationInterface {
  name = 'NotificationOutbox1792650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_outbox" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "school_id" uuid NULL,
        "template_key" varchar(120) NOT NULL,
        "locale" varchar(8) NOT NULL DEFAULT 'ar',
        "variables" jsonb NOT NULL DEFAULT '{}',
        "recipients" jsonb NOT NULL DEFAULT '[]',
        "channels" jsonb NULL,
        "push_data" jsonb NULL,
        "status" varchar(16) NOT NULL DEFAULT 'pending',
        "attempts" int NOT NULL DEFAULT 0,
        "last_error" text NULL,
        "available_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "claimed_at" TIMESTAMPTZ NULL,
        "sent_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notification_outbox_pending"
        ON "notification_outbox" ("status", "available_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_outbox"`);
  }
}
