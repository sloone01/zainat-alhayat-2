import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixScheduleSchema1704067500000 implements MigrationInterface {
    name = 'FixScheduleSchema1704067500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting schedule schema fixes...');

        // Check if schedules table exists
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping FixScheduleSchema migration');
            return;
        }

        // Check what tables exist for foreign key references
        const usersTableExists = await queryRunner.hasTable('users');
        const coursesTableExists = await queryRunner.hasTable('courses');
        const groupsTableExists = await queryRunner.hasTable('groups');
        const roomsTableExists = await queryRunner.hasTable('rooms');

        console.log(`📊 Table availability: users=${usersTableExists}, courses=${coursesTableExists}, groups=${groupsTableExists}, rooms=${roomsTableExists}`);

        // Get current table structure
        const schedulesTable = await queryRunner.getTable('schedules');

        // 1. Remove the redundant subject column since we have course_id
        console.log('📝 Removing redundant subject column...');
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);

        // 2. Add missing columns if they don't exist (based on entity)
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

        // 3. Fix column types and names
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

        // Rename is_active to match entity if needed
        if (schedulesTable?.findColumnByName('is_active') && !schedulesTable?.findColumnByName('is_recurring')) {
            console.log('🔧 Renaming is_active to is_recurring...');
            await queryRunner.query(`ALTER TABLE "schedules" RENAME COLUMN "is_active" TO "is_recurring"`);
        }

        // 4. Ensure teacher_id is uuid type to match users.id
        const teacherIdColumn = schedulesTable?.findColumnByName('teacher_id');
        if (teacherIdColumn && teacherIdColumn.type !== 'uuid') {
            console.log('🔧 Ensuring teacher_id is uuid type...');
            await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "teacher_id" TYPE uuid USING teacher_id::uuid`);
        }

        // 5. Add foreign key constraints only if referenced tables exist

        // Drop existing constraints first
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
            } catch (error) {
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
            } catch (error) {
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
            } catch (error) {
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
            } catch (error) {
                console.log(`⚠️  Could not add room_id foreign key: ${error.message}`);
            }
        }

        console.log('✅ Schedule schema fixes completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting schedule schema fixes...');

        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping down migration');
            return;
        }

        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_room_id"`);

        // Note: We don't revert column changes to avoid data loss
        console.log('✅ Schedule schema constraints reverted (columns preserved for data safety)!');
    }
}
