"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeRecordedByNullable1696348900000 = void 0;
class MakeRecordedByNullable1696348900000 {
    name = 'MakeRecordedByNullable1696348900000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" SET NOT NULL`);
    }
}
exports.MakeRecordedByNullable1696348900000 = MakeRecordedByNullable1696348900000;
//# sourceMappingURL=1696348900000-MakeRecordedByNullable.js.map