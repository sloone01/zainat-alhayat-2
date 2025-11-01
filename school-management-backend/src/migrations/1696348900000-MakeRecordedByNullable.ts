import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRecordedByNullable1696348900000 implements MigrationInterface {
  name = 'MakeRecordedByNullable1696348900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make recorded_by column nullable
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert recorded_by column to not nullable
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" SET NOT NULL`);
  }
}
