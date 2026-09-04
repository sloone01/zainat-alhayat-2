import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Store parent-approval letter content only in school_message_letters.
 * Activities link via school_message_letters.activity_id (one letter per activity).
 */
export class ActivityMessageLetterUnified1782900000000 implements MigrationInterface {
  name = 'ActivityMessageLetterUnified1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "school_message_letters"
      ADD COLUMN IF NOT EXISTS "activity_id" uuid NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_school_message_letters_activity_id"
      ON "school_message_letters" ("activity_id")
      WHERE "activity_id" IS NOT NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "school_message_letters"
        ADD CONSTRAINT "FK_school_message_letters_activity"
        FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Migrate legacy JSON on activities into school_message_letters rows.
    await queryRunner.query(`
      INSERT INTO "school_message_letters" (
        "school_id",
        "title",
        "audience",
        "subject_en",
        "subject_ar",
        "body_html_en",
        "body_html_ar",
        "body_sms_en",
        "body_sms_ar",
        "activity_id"
      )
      SELECT
        a."school_id",
        a."title",
        CASE
          WHEN a."group_id" IS NOT NULL THEN jsonb_build_object('groupIds', jsonb_build_array(a."group_id"::text))
          ELSE jsonb_build_object('allParents', true)
        END,
        COALESCE(a."parent_approval_letter"->'en'->>'subject', a."title"),
        COALESCE(a."parent_approval_letter"->'ar'->>'subject', a."title"),
        COALESCE(a."parent_approval_letter"->'en'->>'body_html', ''),
        COALESCE(a."parent_approval_letter"->'ar'->>'body_html', ''),
        a."parent_approval_letter"->'en'->>'body_sms',
        a."parent_approval_letter"->'ar'->>'body_sms',
        a."id"
      FROM "activities" a
      WHERE a."requires_parent_approval" = true
        AND a."parent_approval_letter" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "school_message_letters" ml WHERE ml."activity_id" = a."id"
        )
    `);

    // Activities marked for approval but without legacy JSON still get a letter row.
    await queryRunner.query(`
      INSERT INTO "school_message_letters" (
        "school_id",
        "title",
        "audience",
        "subject_en",
        "subject_ar",
        "body_html_en",
        "body_html_ar",
        "body_sms_en",
        "body_sms_ar",
        "activity_id"
      )
      SELECT
        a."school_id",
        a."title",
        CASE
          WHEN a."group_id" IS NOT NULL THEN jsonb_build_object('groupIds', jsonb_build_array(a."group_id"::text))
          ELSE jsonb_build_object('allParents', true)
        END,
        a."title",
        a."title",
        '',
        '',
        NULL,
        NULL,
        a."id"
      FROM "activities" a
      WHERE a."requires_parent_approval" = true
        AND NOT EXISTS (
          SELECT 1 FROM "school_message_letters" ml WHERE ml."activity_id" = a."id"
        )
    `);

    await queryRunner.query(`
      ALTER TABLE "activities" DROP COLUMN IF EXISTS "parent_approval_letter"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activities"
      ADD COLUMN IF NOT EXISTS "parent_approval_letter" jsonb NULL
    `);

    await queryRunner.query(`
      UPDATE "activities" a
      SET "parent_approval_letter" = jsonb_build_object(
        'en', jsonb_build_object(
          'subject', ml."subject_en",
          'body_html', ml."body_html_en",
          'body_sms', COALESCE(ml."body_sms_en", '')
        ),
        'ar', jsonb_build_object(
          'subject', ml."subject_ar",
          'body_html', ml."body_html_ar",
          'body_sms', COALESCE(ml."body_sms_ar", '')
        )
      )
      FROM "school_message_letters" ml
      WHERE ml."activity_id" = a."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "school_message_letters" DROP CONSTRAINT IF EXISTS "FK_school_message_letters_activity"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_school_message_letters_activity_id"`);
    await queryRunner.query(`
      ALTER TABLE "school_message_letters" DROP COLUMN IF EXISTS "activity_id"
    `);
  }
}
