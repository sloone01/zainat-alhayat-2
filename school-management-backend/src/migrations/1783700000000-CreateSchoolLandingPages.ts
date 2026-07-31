import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchoolLandingPages1783700000000 implements MigrationInterface {
  name = 'CreateSchoolLandingPages1783700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "landing_slug" varchar(80) NULL
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_schools_landing_slug'
        ) THEN
          ALTER TABLE "schools"
          ADD CONSTRAINT "UQ_schools_landing_slug" UNIQUE ("landing_slug");
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_landing_pages" (
        "id" SERIAL PRIMARY KEY,
        "school_id" int NOT NULL UNIQUE REFERENCES "schools"("id") ON DELETE CASCADE,
        "logo_url" text NULL,
        "hero_image_url" text NULL,
        "brand_name_en" varchar(200) NULL,
        "brand_name_ar" varchar(200) NULL,
        "badge_en" varchar(200) NULL,
        "badge_ar" varchar(200) NULL,
        "hero_title_en" varchar(300) NULL,
        "hero_title_ar" varchar(300) NULL,
        "hero_subtitle_en" text NULL,
        "hero_subtitle_ar" text NULL,
        "cta_primary_en" varchar(120) NULL,
        "cta_primary_ar" varchar(120) NULL,
        "cta_secondary_en" varchar(120) NULL,
        "cta_secondary_ar" varchar(120) NULL,
        "features" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "testimonials" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "phone" varchar(40) NULL,
        "email" varchar(120) NULL,
        "address_en" text NULL,
        "address_ar" text NULL,
        "is_published" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Default slug + empty published shell for lowest school id (legacy single-tenant)
    await queryRunner.query(`
      UPDATE "schools"
      SET "landing_slug" = 'default'
      WHERE "id" = (SELECT MIN(id) FROM "schools")
        AND ("landing_slug" IS NULL OR "landing_slug" = '')
    `);

    await queryRunner.query(`
      INSERT INTO "school_landing_pages" ("school_id", "is_published")
      SELECT s.id, false
      FROM "schools" s
      WHERE s.id = (SELECT MIN(id) FROM "schools")
      ON CONFLICT ("school_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_landing_pages"`);
    await queryRunner.query(`
      ALTER TABLE "schools" DROP CONSTRAINT IF EXISTS "UQ_schools_landing_slug"
    `);
    await queryRunner.query(`
      ALTER TABLE "schools" DROP COLUMN IF EXISTS "landing_slug"
    `);
  }
}
