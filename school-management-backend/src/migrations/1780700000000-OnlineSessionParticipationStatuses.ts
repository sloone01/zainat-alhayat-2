import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Online-class participation is separate from daily attendances.
 * Use attended | not_attended (plus legacy present/absent normalized in code until this runs).
 */
export class OnlineSessionParticipationStatuses1780700000000 implements MigrationInterface {
  name = 'OnlineSessionParticipationStatuses1780700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "online_session_student_attendance"
      SET status = 'attended'
      WHERE status = 'present';
    `);
    await queryRunner.query(`
      UPDATE "online_session_student_attendance"
      SET status = 'not_attended'
      WHERE status = 'absent';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "online_session_student_attendance"
      SET status = 'present'
      WHERE status = 'attended';
    `);
    await queryRunner.query(`
      UPDATE "online_session_student_attendance"
      SET status = 'absent'
      WHERE status = 'not_attended';
    `);
  }
}
