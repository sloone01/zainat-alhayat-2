"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixScheduleSchema1704067500000 = void 0;
class FixScheduleSchema1704067500000 {
    name = 'FixScheduleSchema1704067500000';
    async up(queryRunner) {
        console.log('🔧 Starting schedule schema fixes...');
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping FixScheduleSchema migration');
            return;
        }
        const usersTableExists = await queryRunner.hasTable('users');
        const coursesTableExists = await queryRunner.hasTable('courses');
        const groupsTableExists = await queryRunner.hasTable('groups');
        const roomsTableExists = await queryRunner.hasTable('rooms');
        console.log(`📊 Table availability: users=${usersTableExists}, courses=${coursesTableExists}, groups=${groupsTableExists}, rooms=${roomsTableExists}`);
        const schedulesTable = await queryRunner.getTable('schedules');
        console.log('📝 Removing redundant subject column...');
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);
        if (!schedulesTable?.findColumnByName('duration_minutes')) {
            console.log('➕ Adding duration_minutes column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "duration_minutes" integer DEFAULT 60`);
        }
        if (!schedulesTable?.findColumnByName('notes')) {
            console.log('➕ Adding notes column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "notes" text`);
        }
        if (!schedulesTable?.findColumnByName('is_recurring')) {
            console.log('➕ Adding is_recurring column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "is_recurring" boolean DEFAULT true`);
        }
        if (!schedulesTable?.findColumnByName('specific_date')) {
            console.log('➕ Adding specific_date column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "specific_date" date`);
        }
        if (!schedulesTable?.findColumnByName('status')) {
            console.log('➕ Adding status column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "status" varchar(50) DEFAULT 'active'`);
        }
        const dayOfWeekColumn = schedulesTable?.findColumnByName('day_of_week');
        if (dayOfWeekColumn && dayOfWeekColumn.type === 'integer') {
            console.log('🔧 Converting day_of_week from integer to varchar...');
            await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "day_of_week" TYPE varchar(20) USING
                CASE
                    WHEN "day_of_week" = 0 THEN 'sunday'
                    WHEN "day_of_week" = 1 THEN 'monday'
                    WHEN "day_of_week" = 2 THEN 'tuesday'
                    WHEN "day_of_week" = 3 THEN 'wednesday'
                    WHEN "day_of_week" = 4 THEN 'thursday'
                    WHEN "day_of_week" = 5 THEN 'friday'
                    WHEN "day_of_week" = 6 THEN 'saturday'
                    ELSE 'monday'
                END`);
        }
        if (schedulesTable?.findColumnByName('is_active') && !schedulesTable?.findColumnByName('is_recurring')) {
            console.log('🔧 Renaming is_active to is_recurring...');
            await queryRunner.query(`ALTER TABLE "schedules" RENAME COLUMN "is_active" TO "is_recurring"`);
        }
        const teacherIdColumn = schedulesTable?.findColumnByName('teacher_id');
        if (teacherIdColumn && teacherIdColumn.type !== 'uuid') {
            console.log('🔧 Ensuring teacher_id is uuid type...');
            await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "teacher_id" TYPE uuid USING teacher_id::uuid`);
        }
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_room_id"`);
        if (usersTableExists) {
            console.log('🔗 Adding foreign key constraint for teacher_id...');
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules"
                    ADD CONSTRAINT "FK_schedules_teacher_id"
                    FOREIGN KEY ("teacher_id") REFERENCES "users"("id")
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
            }
            catch (error) {
                console.log(`⚠️  Could not add teacher_id foreign key: ${error.message}`);
            }
        }
        if (coursesTableExists) {
            console.log('🔗 Adding foreign key constraint for course_id...');
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules"
                    ADD CONSTRAINT "FK_schedules_course_id"
                    FOREIGN KEY ("course_id") REFERENCES "courses"("id")
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
            }
            catch (error) {
                console.log(`⚠️  Could not add course_id foreign key: ${error.message}`);
            }
        }
        if (groupsTableExists) {
            console.log('🔗 Adding foreign key constraint for group_id...');
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules"
                    ADD CONSTRAINT "FK_schedules_group_id"
                    FOREIGN KEY ("group_id") REFERENCES "groups"("id")
                    ON DELETE CASCADE ON UPDATE CASCADE
                `);
            }
            catch (error) {
                console.log(`⚠️  Could not add group_id foreign key: ${error.message}`);
            }
        }
        if (roomsTableExists) {
            console.log('🔗 Adding foreign key constraint for room_id...');
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules"
                    ADD CONSTRAINT "FK_schedules_room_id"
                    FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
            }
            catch (error) {
                console.log(`⚠️  Could not add room_id foreign key: ${error.message}`);
            }
        }
        console.log('✅ Schedule schema fixes completed successfully!');
    }
    async down(queryRunner) {
        console.log('🔄 Reverting schedule schema fixes...');
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping down migration');
            return;
        }
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_room_id"`);
        console.log('✅ Schedule schema constraints reverted (columns preserved for data safety)!');
    }
}
exports.FixScheduleSchema1704067500000 = FixScheduleSchema1704067500000;
//# sourceMappingURL=1704067500000-FixScheduleSchema.js.map