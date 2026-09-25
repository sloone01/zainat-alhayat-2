import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentStatus1792550000000 implements MigrationInterface {
  name = 'StudentStatus1792550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD COLUMN IF NOT EXISTS "status" character varying(24) NOT NULL DEFAULT 'active'
    `);
    await queryRunner.query(`
      UPDATE "students"
      SET "status" = 'active'
      WHERE "status" IS NULL OR "status" = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students" DROP COLUMN IF EXISTS "status"
    `);
  }
}
