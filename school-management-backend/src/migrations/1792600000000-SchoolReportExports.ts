import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolReportExports1792600000000 implements MigrationInterface {
  name = 'SchoolReportExports1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_report_export_templates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL
          REFERENCES "schools"("id") ON DELETE CASCADE,
        "name" character varying(160) NOT NULL,
        "name_ar" character varying(160) NULL,
        "html_en" text NOT NULL,
        "html_ar" text NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_school_report_export_templates_school"
        ON "school_report_export_templates" ("school_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_report_export_configs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL
          REFERENCES "schools"("id") ON DELETE CASCADE,
        "report_key" character varying(64) NOT NULL,
        "columns" jsonb NOT NULL DEFAULT '[]',
        "template_id" uuid NULL
          REFERENCES "school_report_export_templates"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_school_report_export_configs_school_key"
          UNIQUE ("school_id", "report_key")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_school_report_export_configs_school"
        ON "school_report_export_configs" ("school_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_report_export_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_report_export_templates"`);
  }
}
