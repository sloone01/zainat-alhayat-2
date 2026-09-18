import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPushTokens1792400000000 implements MigrationInterface {
  name = 'UserPushTokens1792400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_push_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" text NOT NULL,
        "platform" varchar(16) NOT NULL,
        "device_id" varchar(128) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_push_tokens_token"
        ON "user_push_tokens" ("token")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_push_tokens_user_id"
        ON "user_push_tokens" ("user_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_push_tokens_user_device"
        ON "user_push_tokens" ("user_id", "device_id")
        WHERE "device_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_push_tokens"`);
  }
}
