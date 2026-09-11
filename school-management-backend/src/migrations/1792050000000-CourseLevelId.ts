import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseLevelId1792050000000 implements MigrationInterface {
  name = 'CourseLevelId1792050000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "level_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_courses_level_id" ON "courses" ("level_id")`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "courses"
          ADD CONSTRAINT "FK_courses_level"
          FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id")
          ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_courses_level"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_courses_level_id"`);
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN IF EXISTS "level_id"`,
    );
  }
}
