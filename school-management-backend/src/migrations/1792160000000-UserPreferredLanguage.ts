import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPreferredLanguage1792160000000 implements MigrationInterface {
  name = 'UserPreferredLanguage1792160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "preferred_language" varchar(2) NOT NULL DEFAULT 'ar'
    `);
    await queryRunner.query(`
      UPDATE "users"
      SET "preferred_language" = 'ar'
      WHERE "preferred_language" IS NULL OR "preferred_language" NOT IN ('ar', 'en')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "preferred_language"
    `);
  }
}
