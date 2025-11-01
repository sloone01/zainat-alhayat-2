import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAttendanceSchema1696348800000 implements MigrationInterface {
  name = 'FixAttendanceSchema1696348800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_e0ff1c3c262fb8b55222e4d8329"`);
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_student_id"`);
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_group_id"`);

    // Change column types from integer to UUID
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "student_id" TYPE uuid USING "student_id"::text::uuid`);
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "group_id" TYPE uuid USING "group_id"::text::uuid`);
    
    // Keep recorded_by as integer since it references staff table which uses integer IDs
    // But we need to ensure there are staff records first
    
    // Add foreign key constraints with proper references
    await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_student_id" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_group_id" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_recorded_by" FOREIGN KEY ("recorded_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new foreign key constraints
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_recorded_by"`);
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_group_id"`);
    await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_student_id"`);

    // Revert column types back to integer
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "group_id" TYPE integer USING "group_id"::text::integer`);
    await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "student_id" TYPE integer USING "student_id"::text::integer`);

    // Add back the original foreign key constraints (if they existed)
    await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_e0ff1c3c262fb8b55222e4d8329" FOREIGN KEY ("recorded_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }
}
