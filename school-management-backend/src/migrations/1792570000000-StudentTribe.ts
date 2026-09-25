import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentTribe1792570000000 implements MigrationInterface {
  name = 'StudentTribe1792570000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
        ADD COLUMN IF NOT EXISTS "tribe" character varying(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students" DROP COLUMN IF EXISTS "tribe"
    `);
  }
}
