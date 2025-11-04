"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAttendanceSchema1696348800000 = void 0;
class FixAttendanceSchema1696348800000 {
    name = 'FixAttendanceSchema1696348800000';
    async up(queryRunner) {
        console.log('Starting FixAttendanceSchema migration...');
        const attendancesTableExists = await queryRunner.hasTable('attendances');
        const attendanceTableExists = await queryRunner.hasTable('attendance');
        if (!attendancesTableExists && !attendanceTableExists) {
            console.log('Neither attendance nor attendances table exists, skipping migration');
            return;
        }
        if (attendanceTableExists && !attendancesTableExists) {
            console.log('Found old "attendance" table, migrating to "attendances" with correct structure...');
            await queryRunner.query(`
        CREATE TABLE "attendances" (
          "id" SERIAL PRIMARY KEY,
          "attendance_date" date NOT NULL,
          "status" character varying(20) NOT NULL DEFAULT 'present',
          "check_in_time" time,
          "check_out_time" time,
          "notes" text,
          "reason" text,
          "is_excused" boolean NOT NULL DEFAULT false,
          "student_id" uuid NOT NULL,
          "group_id" uuid NOT NULL,
          "recorded_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
            const oldTableHasData = await queryRunner.query(`SELECT COUNT(*) as count FROM "attendance"`);
            if (oldTableHasData[0]?.count > 0) {
                console.log('Migrating data from old attendance table...');
                await queryRunner.query(`
          INSERT INTO "attendances" (attendance_date, status, check_in_time, check_out_time, notes, student_id, created_at, updated_at)
          SELECT date, status, check_in_time, check_out_time, notes, student_id, created_at, updated_at
          FROM "attendance"
        `);
            }
            await queryRunner.query(`DROP TABLE "attendance"`);
            console.log('Migrated from "attendance" to "attendances" table');
        }
        if (attendancesTableExists || attendanceTableExists) {
            console.log('Fixing attendances table schema...');
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_e0ff1c3c262fb8b55222e4d8329"`);
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_student_id"`);
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_group_id"`);
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendance_student"`);
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendance_schedule"`);
            await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendance_marked_by"`);
            const table = await queryRunner.getTable('attendances');
            if (!table?.findColumnByName('group_id')) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "group_id" uuid`);
            }
            if (!table?.findColumnByName('recorded_by')) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "recorded_by" integer`);
            }
            if (!table?.findColumnByName('reason')) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "reason" text`);
            }
            if (!table?.findColumnByName('is_excused')) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "is_excused" boolean DEFAULT false`);
            }
            if (table?.findColumnByName('date') && !table?.findColumnByName('attendance_date')) {
                await queryRunner.query(`ALTER TABLE "attendances" RENAME COLUMN "date" TO "attendance_date"`);
            }
            const studentsTableExists = await queryRunner.hasTable('students');
            const groupsTableExists = await queryRunner.hasTable('groups');
            const staffTableExists = await queryRunner.hasTable('staff');
            if (studentsTableExists) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_student_id" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            }
            if (groupsTableExists) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_group_id" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            }
            if (staffTableExists) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_recorded_by" FOREIGN KEY ("recorded_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
            }
            console.log('Attendance schema fix completed successfully');
        }
    }
    async down(queryRunner) {
        console.log('Reverting FixAttendanceSchema migration...');
        const attendancesTableExists = await queryRunner.hasTable('attendances');
        if (!attendancesTableExists) {
            console.log('Attendances table does not exist, skipping down migration');
            return;
        }
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendances_recorded_by"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendances_group_id"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_attendances_student_id"`);
        console.log('Attendance schema constraints reverted (table structure preserved for data safety)');
    }
}
exports.FixAttendanceSchema1696348800000 = FixAttendanceSchema1696348800000;
//# sourceMappingURL=1696348800000-FixAttendanceSchema.js.map