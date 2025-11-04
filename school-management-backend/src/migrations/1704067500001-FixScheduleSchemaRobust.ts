import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixScheduleSchemaRobust1704067500001 implements MigrationInterface {
    name = 'FixScheduleSchemaRobust1704067500001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting robust schedule schema fixes...');

        // Check if schedules table exists
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping migration');
            return;
        }

        // Get current table structure
        const schedulesTable = await queryRunner.getTable('schedules');
        console.log('📊 Analyzing current schedules table structure...');

        // Helper function to check if column exists
        const columnExists = async (columnName: string): Promise<boolean> => {
            const result = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'schedules' AND column_name = $1
            `, [columnName]);
            return result.length > 0;
        };

        // 1. Remove redundant subject column
        if (await columnExists('subject')) {
            console.log('📝 Removing redundant subject column...');
            await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "subject"`);
        }

        // 2. Add missing columns with existence checks
        console.log('➕ Adding missing columns...');

        if (!(await columnExists('duration_minutes'))) {
            console.log('  → Adding duration_minutes column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "duration_minutes" integer DEFAULT 60`);
        } else {
            console.log('  ✅ duration_minutes already exists');
        }

        if (!(await columnExists('notes'))) {
            console.log('  → Adding notes column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "notes" text`);
        } else {
            console.log('  ✅ notes already exists');
        }

        if (!(await columnExists('is_recurring'))) {
            console.log('  → Adding is_recurring column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "is_recurring" boolean DEFAULT true`);
        } else {
            console.log('  ✅ is_recurring already exists');
        }

        if (!(await columnExists('specific_date'))) {
            console.log('  → Adding specific_date column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "specific_date" date`);
        } else {
            console.log('  ✅ specific_date already exists');
        }

        if (!(await columnExists('status'))) {
            console.log('  → Adding status column...');
            await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "status" varchar(50) DEFAULT 'active'`);
        } else {
            console.log('  ✅ status already exists');
        }

        // 3. Handle is_active to is_recurring conversion
        const hasIsActive = await columnExists('is_active');
        const hasIsRecurring = await columnExists('is_recurring');

        if (hasIsActive && !hasIsRecurring) {
            console.log('🔧 Renaming is_active to is_recurring...');
            await queryRunner.query(`ALTER TABLE "schedules" RENAME COLUMN "is_active" TO "is_recurring"`);
        } else if (hasIsActive && hasIsRecurring) {
            console.log('🔧 Removing duplicate is_active column...');
            await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "is_active"`);
        }

        // 4. Fix day_of_week data type
        const dayOfWeekColumn = schedulesTable?.findColumnByName('day_of_week');
        if (dayOfWeekColumn && (dayOfWeekColumn.type === 'integer' || dayOfWeekColumn.type === 'int4')) {
            console.log('🔧 Converting day_of_week from integer to varchar...');
            await queryRunner.query(`
                ALTER TABLE "schedules" ALTER COLUMN "day_of_week" TYPE varchar(20) USING 
                CASE 
                    WHEN "day_of_week" = 0 THEN 'sunday'
                    WHEN "day_of_week" = 1 THEN 'monday'
                    WHEN "day_of_week" = 2 THEN 'tuesday'
                    WHEN "day_of_week" = 3 THEN 'wednesday'
                    WHEN "day_of_week" = 4 THEN 'thursday'
                    WHEN "day_of_week" = 5 THEN 'friday'
                    WHEN "day_of_week" = 6 THEN 'saturday'
                    ELSE 'monday'
                END
            `);
        }

        // 5. Add foreign key constraints safely
        console.log('🔗 Setting up foreign key constraints...');
        
        // Check what tables exist
        const usersTableExists = await queryRunner.hasTable('users');
        const coursesTableExists = await queryRunner.hasTable('courses');
        const groupsTableExists = await queryRunner.hasTable('groups');
        const roomsTableExists = await queryRunner.hasTable('rooms');

        // Drop existing constraints first
        const constraints = ['FK_schedules_teacher_id', 'FK_schedules_course_id', 'FK_schedules_group_id', 'FK_schedules_room_id'];
        for (const constraint of constraints) {
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "${constraint}"`);
        }

        // Add constraints only if target tables exist
        if (usersTableExists) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules" 
                    ADD CONSTRAINT "FK_schedules_teacher_id" 
                    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") 
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
                console.log('  ✅ teacher_id foreign key added');
            } catch (error) {
                console.log(`  ⚠️  Could not add teacher_id foreign key: ${error.message}`);
            }
        }

        if (coursesTableExists) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules" 
                    ADD CONSTRAINT "FK_schedules_course_id" 
                    FOREIGN KEY ("course_id") REFERENCES "courses"("id") 
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
                console.log('  ✅ course_id foreign key added');
            } catch (error) {
                console.log(`  ⚠️  Could not add course_id foreign key: ${error.message}`);
            }
        }

        if (groupsTableExists) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules" 
                    ADD CONSTRAINT "FK_schedules_group_id" 
                    FOREIGN KEY ("group_id") REFERENCES "groups"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE
                `);
                console.log('  ✅ group_id foreign key added');
            } catch (error) {
                console.log(`  ⚠️  Could not add group_id foreign key: ${error.message}`);
            }
        }

        if (roomsTableExists) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "schedules" 
                    ADD CONSTRAINT "FK_schedules_room_id" 
                    FOREIGN KEY ("room_id") REFERENCES "rooms"("id") 
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
                console.log('  ✅ room_id foreign key added');
            } catch (error) {
                console.log(`  ⚠️  Could not add room_id foreign key: ${error.message}`);
            }
        }

        console.log('✅ Robust schedule schema fixes completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting robust schedule schema fixes...');
        
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping down migration');
            return;
        }

        // Remove foreign key constraints
        const constraints = ['FK_schedules_teacher_id', 'FK_schedules_course_id', 'FK_schedules_group_id', 'FK_schedules_room_id'];
        for (const constraint of constraints) {
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "${constraint}"`);
        }

        console.log('✅ Robust schedule schema constraints reverted!');
    }
}
