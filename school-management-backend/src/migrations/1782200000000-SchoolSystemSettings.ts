import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolSystemSettings1782200000000 implements MigrationInterface {
  name = 'SchoolSystemSettings1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_system_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" integer NOT NULL,
        "setting_key" character varying(200) NOT NULL,
        "value_json" jsonb NOT NULL,
        "type" character varying(20) NOT NULL DEFAULT 'string',
        "category" character varying(100) NOT NULL,
        "title" character varying(255) NOT NULL DEFAULT '',
        "description" text NOT NULL DEFAULT '',
        "is_public" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_system_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_school_system_settings_school_key" UNIQUE ("school_id", "setting_key"),
        CONSTRAINT "FK_school_system_settings_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_school_system_settings_school_category"
      ON "school_system_settings" ("school_id", "category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_system_settings"`);
  }
}
