import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformCustomPlanRequests1792000000000 implements MigrationInterface {
  name = 'PlatformCustomPlanRequests1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_custom_plan_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "school_name" varchar(200) NOT NULL,
        "email" varchar(255) NOT NULL,
        "phone" varchar(30) NOT NULL,
        "scope" varchar(16) NOT NULL,
        "locale" varchar(8) NOT NULL DEFAULT 'ar',
        "notes" text NULL,
        "module_codes" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "module_labels" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "status" varchar(16) NOT NULL DEFAULT 'new',
        "admin_notes" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_platform_custom_plan_requests_scope"
          CHECK ("scope" IN ('small', 'mid', 'large')),
        CONSTRAINT "CHK_platform_custom_plan_requests_status"
          CHECK ("status" IN ('new', 'contacted', 'closed'))
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_platform_custom_plan_requests_status_created"
        ON "platform_custom_plan_requests" ("status", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_platform_custom_plan_requests_status_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_custom_plan_requests"`);
  }
}
