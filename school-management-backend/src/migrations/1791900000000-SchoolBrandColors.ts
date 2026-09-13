import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolBrandColors1791900000000 implements MigrationInterface {
  name = 'SchoolBrandColors1791900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "school_landing_pages"
        ADD COLUMN IF NOT EXISTS "brand_primary_color" varchar(7) NULL,
        ADD COLUMN IF NOT EXISTS "brand_accent_color" varchar(7) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "school_landing_pages"
        DROP COLUMN IF EXISTS "brand_accent_color",
        DROP COLUMN IF EXISTS "brand_primary_color"
    `);
  }
}
