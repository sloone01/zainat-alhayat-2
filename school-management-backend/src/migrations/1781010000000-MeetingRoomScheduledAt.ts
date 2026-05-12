import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingRoomScheduledAt1781010000000 implements MigrationInterface {
  name = 'MeetingRoomScheduledAt1781010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
      ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "scheduled_at"
    `);
  }
}
