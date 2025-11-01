"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixScheduleSchema1704067500000 = void 0;
class FixScheduleSchema1704067500000 {
    name = 'FixScheduleSchema1704067500000';
    async up(queryRunner) {
        console.log('🔧 Starting schedule schema fixes...');
        console.log('📝 Removing redundant subject column...');
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);
        console.log('🔧 Ensuring teacher_id is varchar type...');
        await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "teacher_id" TYPE varchar USING teacher_id::varchar`);
        console.log('🔗 Adding foreign key constraint for teacher_id...');
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            ADD CONSTRAINT "FK_schedules_teacher_id" 
            FOREIGN KEY ("teacher_id") REFERENCES "users"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
        console.log('🔗 Ensuring course_id foreign key constraint...');
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            ADD CONSTRAINT "FK_schedules_course_id" 
            FOREIGN KEY ("course_id") REFERENCES "courses"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
        console.log('🔗 Ensuring group_id foreign key constraint...');
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            ADD CONSTRAINT "FK_schedules_group_id" 
            FOREIGN KEY ("group_id") REFERENCES "groups"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log('✅ Schedule schema fixes completed successfully!');
    }
    async down(queryRunner) {
        console.log('🔄 Reverting schedule schema fixes...');
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "subject" character varying(255)`);
        console.log('✅ Schedule schema revert completed!');
    }
}
exports.FixScheduleSchema1704067500000 = FixScheduleSchema1704067500000;
//# sourceMappingURL=1704067500000-FixScheduleSchema.js.map