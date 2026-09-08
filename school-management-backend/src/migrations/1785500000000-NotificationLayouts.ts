import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationLayouts1785500000000 implements MigrationInterface {
  name = 'NotificationLayouts1785500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_notification_layouts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "name" varchar(160) NOT NULL,
        "name_ar" varchar(160) NULL,
        "html_en" text NOT NULL,
        "html_ar" text NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_school_notification_layouts_school"
          FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_school_notification_layouts_school"
        ON "school_notification_layouts" ("school_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "school_notification_templates"
        ADD COLUMN IF NOT EXISTS "layout_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "school_notification_templates"
          ADD CONSTRAINT "FK_school_notification_templates_layout"
          FOREIGN KEY ("layout_id") REFERENCES "school_notification_layouts"("id")
          ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "school_notification_templates"
        DROP CONSTRAINT IF EXISTS "FK_school_notification_templates_layout"
    `);
    await queryRunner.query(`
      ALTER TABLE "school_notification_templates"
        DROP COLUMN IF EXISTS "layout_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_notification_layouts"`);
  }
}
