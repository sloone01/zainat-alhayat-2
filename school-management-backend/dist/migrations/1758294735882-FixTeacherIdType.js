"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixTeacherIdType1758294735882 = void 0;
class FixTeacherIdType1758294735882 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "schedules"
            ALTER COLUMN "teacher_id" TYPE varchar USING "teacher_id"::varchar
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "schedules"
            ALTER COLUMN "teacher_id" TYPE integer USING "teacher_id"::integer
        `);
    }
}
exports.FixTeacherIdType1758294735882 = FixTeacherIdType1758294735882;
//# sourceMappingURL=1758294735882-FixTeacherIdType.js.map