"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeRecordedByNullable1696348900000 = void 0;
class MakeRecordedByNullable1696348900000 {
    name = 'MakeRecordedByNullable1696348900000';
    async up(queryRunner) {
        const tableExists = await queryRunner.hasTable('attendances');
        if (!tableExists) {
            console.log('Attendances table does not exist yet, skipping MakeRecordedByNullable migration');
            return;
        }
        console.log('Making recorded_by column nullable...');
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" DROP NOT NULL`);
        console.log('recorded_by column is now nullable');
    }
    async down(queryRunner) {
        const tableExists = await queryRunner.hasTable('attendances');
        if (!tableExists) {
            console.log('Attendances table does not exist, skipping down migration');
            return;
        }
        console.log('Reverting recorded_by column to not nullable...');
        await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" SET NOT NULL`);
        console.log('recorded_by column is now not nullable');
    }
}
exports.MakeRecordedByNullable1696348900000 = MakeRecordedByNullable1696348900000;
//# sourceMappingURL=1696348900000-MakeRecordedByNullable.js.map