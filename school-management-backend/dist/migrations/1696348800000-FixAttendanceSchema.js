"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAttendanceSchema1696348800000 = void 0;
class FixAttendanceSchema1696348800000 {
    name = 'FixAttendanceSchema1696348800000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_e0ff1c3c262fb8b55222e4d8329"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_student_id"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "FK_group_id"`);
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "student_id" TYPE uuid USING "student_id"::text::uuid`);
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "group_id" TYPE uuid USING "group_id"::text::uuid`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_student_id" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_group_id" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_attendances_recorded_by" FOREIGN KEY ("recorded_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_recorded_by"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_group_id"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_attendances_student_id"`);
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "group_id" TYPE integer USING "group_id"::text::integer`);
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "student_id" TYPE integer USING "student_id"::text::integer`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_e0ff1c3c262fb8b55222e4d8329" FOREIGN KEY ("recorded_by") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
exports.FixAttendanceSchema1696348800000 = FixAttendanceSchema1696348800000;
//# sourceMappingURL=1696348800000-FixAttendanceSchema.js.map