import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSchoolStatus1783500000000 implements MigrationInterface {
  name = 'AddSchoolStatus1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'active'
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'CHK_schools_status'
        ) THEN
          ALTER TABLE "schools"
          ADD CONSTRAINT "CHK_schools_status"
          CHECK ("status" IN ('pending', 'active', 'suspended', 'rejected'));
        END IF;
      END $$;
    `);

    // Existing schools are live
    await queryRunner.query(`
      UPDATE "schools" SET "status" = 'active' WHERE "status" IS NULL OR "status" = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools" DROP CONSTRAINT IF EXISTS "CHK_schools_status"
    `);
    await queryRunner.query(`
      ALTER TABLE "schools" DROP COLUMN IF EXISTS "status"
    `);
  }
}
