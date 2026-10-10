import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentStatus1792560000000 implements MigrationInterface {
  name = 'ParentStatus1792560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "parents"
        ADD COLUMN IF NOT EXISTS "status" character varying(24) NOT NULL DEFAULT 'active'
    `);
    await queryRunner.query(`
      UPDATE "parents"
      SET "status" = 'active'
      WHERE "status" IS NULL OR "status" = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "parents" DROP COLUMN IF EXISTS "status"
    `);
  }
}
