import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * students.nationality held the Arabic display label ("عماني") while both student forms
 * use the codes 'omani' / 'expat'. The select could not match the stored value, rendered
 * blank, and saving the form overwrote the real nationality with an empty string.
 */
export class NormaliseStudentNationality1789600000000 implements MigrationInterface {
  name = 'NormaliseStudentNationality1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "students" SET "nationality" = 'omani'
       WHERE btrim("nationality") IN ('عماني', 'عمانية', 'Omani', 'omani')
    `);
    await queryRunner.query(`
      UPDATE "students" SET "nationality" = 'expat'
       WHERE btrim("nationality") IN ('مقيم', 'مقيمة', 'غير عماني', 'Expat', 'expat')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "students" SET "nationality" = 'عماني' WHERE "nationality" = 'omani'`);
    await queryRunner.query(`UPDATE "students" SET "nationality" = 'مقيم' WHERE "nationality" = 'expat'`);
  }
}
