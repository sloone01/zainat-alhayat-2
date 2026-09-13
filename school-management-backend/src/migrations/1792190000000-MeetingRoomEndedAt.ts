import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingRoomEndedAt1792190000000 implements MigrationInterface {
  name = 'MeetingRoomEndedAt1792190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ADD COLUMN IF NOT EXISTS "ended_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "ended_at"`);
  }
}
