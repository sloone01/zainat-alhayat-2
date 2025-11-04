import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRecordedByNullable1696348900000 implements MigrationInterface {
  name = 'MakeRecordedByNullable1696348900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if attendances table exists
    const tableExists = await queryRunner.hasTable('attendances');

    if (!tableExists) {
      console.log('Attendances table does not exist yet, skipping MakeRecordedByNullable migration');
      return;
    }

    console.log('Making recorded_by column nullable...');
    // Make recorded_by column nullable
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" DROP NOT NULL`);
    console.log('recorded_by column is now nullable');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if attendances table exists
    const tableExists = await queryRunner.hasTable('attendances');

    if (!tableExists) {
      console.log('Attendances table does not exist, skipping down migration');
      return;
    }

    console.log('Reverting recorded_by column to not nullable...');
    // Revert recorded_by column to not nullable
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" SET NOT NULL`);
    console.log('recorded_by column is now not nullable');
  }
}
