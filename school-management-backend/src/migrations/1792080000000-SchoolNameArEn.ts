import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolNameArEn1792080000000 implements MigrationInterface {
  name = 'SchoolNameArEn1792080000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
        ADD COLUMN IF NOT EXISTS "name_ar" character varying(200),
        ADD COLUMN IF NOT EXISTS "name_en" character varying(200)
    `);
    await queryRunner.query(`
      UPDATE "schools"
      SET
        "name_ar" = COALESCE(NULLIF(TRIM("name_ar"), ''), "name"),
        "name_en" = COALESCE(NULLIF(TRIM("name_en"), ''), "name")
      WHERE "name_ar" IS NULL OR "name_en" IS NULL
        OR TRIM(COALESCE("name_ar", '')) = ''
        OR TRIM(COALESCE("name_en", '')) = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
        DROP COLUMN IF EXISTS "name_ar",
        DROP COLUMN IF EXISTS "name_en"
    `);
  }
}
