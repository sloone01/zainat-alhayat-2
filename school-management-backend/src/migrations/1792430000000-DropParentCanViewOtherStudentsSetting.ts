import { MigrationInterface, QueryRunner } from 'typeorm';

/** Removed product setting — parents must never be granted “view other students”. */
export class DropParentCanViewOtherStudentsSetting1792430000000 implements MigrationInterface {
  name = 'DropParentCanViewOtherStudentsSetting1792430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM school_system_settings
      WHERE setting_key = 'userPermissions.parentCanViewOtherStudents'
    `);
  }

  public async down(): Promise<void> {
    // Intentionally not restored — setting is retired.
  }
}
