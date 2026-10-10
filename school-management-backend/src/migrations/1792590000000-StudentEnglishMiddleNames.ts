import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentEnglishMiddleNames1792590000000 implements MigrationInterface {
  name = 'StudentEnglishMiddleNames1792590000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD COLUMN IF NOT EXISTS "second_name_en" character varying(100) NULL,
        ADD COLUMN IF NOT EXISTS "third_name_en" character varying(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
        DROP COLUMN IF EXISTS "second_name_en",
        DROP COLUMN IF EXISTS "third_name_en"
    `);
  }
}
