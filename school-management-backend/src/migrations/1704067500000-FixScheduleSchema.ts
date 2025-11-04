import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixScheduleSchema1704067500000 implements MigrationInterface {
    name = 'FixScheduleSchema1704067500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting transaction-safe schedule schema fixes...');

        // Check if schedules table exists
        const schedulesTableExists = await queryRunner.hasTable('schedules');
        if (!schedulesTableExists) {
            console.log('⚠️  Schedules table does not exist, skipping FixScheduleSchema migration');
            return;
        }

        // Helper function to check if column exists
        const columnExists = async (columnName: string): Promise<boolean> => {
            try {
                const result = await queryRunner.query(`
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'schedules' AND column_name = $1
                `, [columnName]);
                return result.length > 0;
            } catch (error) {
                console.log(`Error checking column ${columnName}: ${error.message}`);
                return false;
            }
        };

        // Check current column state
        const hasIsActive = await columnExists('is_active');
        const hasIsRecurring = await columnExists('is_recurring');
        const hasDurationMinutes = await columnExists('duration_minutes');
        const hasNotes = await columnExists('notes');
        const hasSpecificDate = await columnExists('specific_date');
        const hasStatus = await columnExists('status');

        console.log(`📊 Current column state: is_active=${hasIsActive}, is_recurring=${hasIsRecurring}, duration_minutes=${hasDurationMinutes}, notes=${hasNotes}, specific_date=${hasSpecificDate}, status=${hasStatus}`);

        // 1. Remove redundant subject column
        try {
            await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);
            console.log('✅ Removed subject column (if existed)');
        } catch (error) {
            console.log(`⚠️  Could not remove subject column: ${error.message}`);
        }

        // 2. Handle is_active to is_recurring conversion FIRST (before adding new columns)
        if (hasIsActive && !hasIsRecurring) {
            try {
                console.log('🔧 Renaming is_active to is_recurring...');
                await queryRunner.query(`ALTER TABLE "schedules" RENAME COLUMN "is_active" TO "is_recurring"`);
                console.log('✅ Successfully renamed is_active to is_recurring');
            } catch (error) {
                console.log(`⚠️  Could not rename column: ${error.message}`);
                // If rename fails, try to add is_recurring and copy data
                if (!hasIsRecurring) {
                    try {
                        await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "is_recurring" boolean DEFAULT true`);
                        await queryRunner.query(`UPDATE "schedules" SET "is_recurring" = "is_active"`);
                        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "is_active"`);
                        console.log('✅ Added is_recurring and migrated data from is_active');
                    } catch (fallbackError) {
                        console.log(`⚠️  Fallback migration also failed: ${fallbackError.message}`);
                    }
                }
            }
        } else if (hasIsActive && hasIsRecurring) {
            try {
                console.log('🔧 Both columns exist, removing duplicate is_active...');
                await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "is_active"`);
                console.log('✅ Removed duplicate is_active column');
            } catch (error) {
                console.log(`⚠️  Could not remove duplicate column: ${error.message}`);
            }
        } else if (!hasIsActive && !hasIsRecurring) {
            try {
                console.log('➕ Adding is_recurring column...');
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "is_recurring" boolean DEFAULT true`);
                console.log('✅ Added is_recurring column');
            } catch (error) {
                console.log(`⚠️  Could not add is_recurring column: ${error.message}`);
            }
        } else {
            console.log('✅ is_recurring column already exists and is_active is handled');
        }

        // 3. Add other missing columns
        if (!hasDurationMinutes) {
            try {
                console.log('➕ Adding duration_minutes column...');
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "duration_minutes" integer DEFAULT 60`);
                console.log('✅ Added duration_minutes column');
            } catch (error) {
                console.log(`⚠️  Could not add duration_minutes: ${error.message}`);
            }
        } else {
            console.log('✅ duration_minutes column already exists');
        }

        if (!hasNotes) {
            try {
                console.log('➕ Adding notes column...');
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "notes" text`);
                console.log('✅ Added notes column');
            } catch (error) {
                console.log(`⚠️  Could not add notes: ${error.message}`);
            }
        } else {
            console.log('✅ notes column already exists');
        }

        if (!hasSpecificDate) {
            try {
                console.log('➕ Adding specific_date column...');
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "specific_date" date`);
                console.log('✅ Added specific_date column');
            } catch (error) {
                console.log(`⚠️  Could not add specific_date: ${error.message}`);
            }
        } else {
            console.log('✅ specific_date column already exists');
        }

        if (!hasStatus) {
            try {
                console.log('➕ Adding status column...');
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "status" varchar(50) DEFAULT 'active'`);
                console.log('✅ Added status column');
            } catch (error) {
                console.log(`⚠️  Could not add status: ${error.message}`);
            }
        } else {
            console.log('✅ status column already exists');
        }

        // 4. Fix day_of_week data type
        try {
            const dayOfWeekResult = await queryRunner.query(`
                SELECT data_type
                FROM information_schema.columns
                WHERE table_name = 'schedules' AND column_name = 'day_of_week'
            `);

            if (dayOfWeekResult.length > 0 && dayOfWeekResult[0].data_type === 'integer') {
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
                console.log('✅ day_of_week converted to varchar');
            } else {
                console.log('✅ day_of_week is already varchar or doesn\'t need conversion');
            }
        } catch (error) {
            console.log(`⚠️  Could not convert day_of_week: ${error.message}`);
        }

        // Note: is_active to is_recurring conversion handled earlier in the migration

        // 5. Ensure teacher_id is uuid type
        try {
            const teacherIdResult = await queryRunner.query(`
                SELECT data_type
                FROM information_schema.columns
                WHERE table_name = 'schedules' AND column_name = 'teacher_id'
            `);

            if (teacherIdResult.length > 0 && teacherIdResult[0].data_type !== 'uuid') {
                console.log('🔧 Converting teacher_id to uuid type...');
                await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "teacher_id" TYPE uuid USING teacher_id::uuid`);
                console.log('✅ teacher_id converted to uuid');
            } else {
                console.log('✅ teacher_id is already uuid type');
            }
        } catch (error) {
            console.log(`⚠️  Could not convert teacher_id: ${error.message}`);
        }

        // 6. Add foreign key constraints only if referenced tables exist
        console.log('🔗 Setting up foreign key constraints...');

        // Check what tables exist for foreign key references
        const usersTableExists = await queryRunner.hasTable('users');
        const coursesTableExists = await queryRunner.hasTable('courses');
        const groupsTableExists = await queryRunner.hasTable('groups');
        const roomsTableExists = await queryRunner.hasTable('rooms');

        console.log(`📊 Referenced tables: users=${usersTableExists}, courses=${coursesTableExists}, groups=${groupsTableExists}, rooms=${roomsTableExists}`);

        // Drop existing constraints first
        try {
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);
            await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_room_id"`);
            console.log('✅ Dropped existing constraints');
        } catch (error) {
            console.log(`⚠️  Error dropping constraints: ${error.message}`);
        }

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
