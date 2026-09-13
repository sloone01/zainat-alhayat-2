import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingRoomDraftStatus1792150000000 implements MigrationInterface {
  name = 'MeetingRoomDraftStatus1792150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ADD COLUMN IF NOT EXISTS "status" character varying(24) NOT NULL DEFAULT 'scheduled'
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ADD COLUMN IF NOT EXISTS "invite_spec" jsonb NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ALTER COLUMN "room_name" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ALTER COLUMN "room_url" DROP NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "meeting_rooms"
      SET "status" = 'scheduled'
      WHERE "status" IS NULL OR "status" = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "meeting_rooms" WHERE "status" = 'draft'
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ALTER COLUMN "room_name" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ALTER COLUMN "room_url" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "invite_spec"
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "status"
    `);
  }
}
