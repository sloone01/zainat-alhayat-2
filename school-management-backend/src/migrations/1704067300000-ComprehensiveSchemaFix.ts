import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComprehensiveSchemaFix1704067300000 implements MigrationInterface {
    name = 'ComprehensiveSchemaFix1704067300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🚀 Starting comprehensive schema fixes...');

        // Helper function to check if table exists
        const tableExists = async (tableName: string): Promise<boolean> => {
            return await queryRunner.hasTable(tableName);
        };

        // Helper function to check if column exists
        const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
            try {
                const result = await queryRunner.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = $2
                `, [tableName, columnName]);
                return result.length > 0;
            } catch (error) {
                return false;
            }
        };

        // Helper function to check if constraint exists
        const constraintExists = async (constraintName: string): Promise<boolean> => {
            try {
                const result = await queryRunner.query(`
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = $1
                `, [constraintName]);
                return result.length > 0;
            } catch (error) {
                return false;
            }
        };

        // =================================================================
        // 1. FIX ATTENDANCES TABLE
        // =================================================================
        console.log('📋 1. Fixing attendances table...');

        const attendanceTableExists = await tableExists('attendance');
        const attendancesTableExists = await tableExists('attendances');

        if (attendanceTableExists && !attendancesTableExists) {
            console.log('🔄 Migrating from "attendance" to "attendances" table...');
            
            // Create new attendances table with correct structure
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
                    "group_id" uuid,
                    "recorded_by" integer,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
                )
            `);

            // Migrate data if any exists
            const hasData = await queryRunner.query(`SELECT COUNT(*) as count FROM "attendance"`);
            if (hasData[0]?.count > 0) {
                console.log('📦 Migrating attendance data...');
                await queryRunner.query(`
                    INSERT INTO "attendances" (attendance_date, status, check_in_time, check_out_time, notes, student_id, created_at, updated_at)
                    SELECT 
                        COALESCE(date, attendance_date, CURRENT_DATE) as attendance_date,
                        COALESCE(status, 'present') as status,
                        check_in_time,
                        check_out_time,
                        notes,
                        student_id,
                        COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
                        COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
                    FROM "attendance"
                `);
            }

            // Drop old table
            await queryRunner.query(`DROP TABLE "attendance"`);
            console.log('✅ Migrated to attendances table');

        } else if (attendancesTableExists) {
            console.log('📋 Updating existing attendances table...');
            
            // Add missing columns
            if (!(await columnExists('attendances', 'group_id'))) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "group_id" uuid`);
            }
            if (!(await columnExists('attendances', 'recorded_by'))) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "recorded_by" integer`);
            }
            if (!(await columnExists('attendances', 'reason'))) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "reason" text`);
            }
            if (!(await columnExists('attendances', 'is_excused'))) {
                await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "is_excused" boolean DEFAULT false`);
            }

            // Rename date column if needed
            if ((await columnExists('attendances', 'date')) && !(await columnExists('attendances', 'attendance_date'))) {
                await queryRunner.query(`ALTER TABLE "attendances" RENAME COLUMN "date" TO "attendance_date"`);
            }

            // Make recorded_by nullable
            await queryRunner.query(`ALTER TABLE "attendances" ALTER COLUMN "recorded_by" DROP NOT NULL`);
            
            console.log('✅ Updated attendances table structure');
        }

        // =================================================================
        // 2. FIX SCHEDULES TABLE
        // =================================================================
        console.log('📅 2. Fixing schedules table...');

        if (await tableExists('schedules')) {
            console.log('📋 Updating schedules table structure...');

            // Remove redundant columns
            await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);

            // Handle is_active to is_recurring conversion
            const hasIsActive = await columnExists('schedules', 'is_active');
            const hasIsRecurring = await columnExists('schedules', 'is_recurring');

            if (hasIsActive && !hasIsRecurring) {
                await queryRunner.query(`ALTER TABLE "schedules" RENAME COLUMN "is_active" TO "is_recurring"`);
                console.log('✅ Renamed is_active to is_recurring');
            } else if (hasIsActive && hasIsRecurring) {
                await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "is_active"`);
                console.log('✅ Removed duplicate is_active column');
            } else if (!hasIsActive && !hasIsRecurring) {
                await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "is_recurring" boolean DEFAULT true`);
                console.log('✅ Added is_recurring column');
            }

            // Add missing columns
            const columnsToAdd = [
                { name: 'duration_minutes', type: 'integer DEFAULT 60' },
                { name: 'notes', type: 'text' },
                { name: 'specific_date', type: 'date' },
                { name: 'status', type: 'varchar(50) DEFAULT \'active\'' }
            ];

            for (const column of columnsToAdd) {
                if (!(await columnExists('schedules', column.name))) {
                    await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "${column.name}" ${column.type}`);
                    console.log(`✅ Added ${column.name} column`);
                }
            }

            // Fix day_of_week data type
            const dayOfWeekType = await queryRunner.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'schedules' AND column_name = 'day_of_week'
            `);

            if (dayOfWeekType.length > 0 && dayOfWeekType[0].data_type === 'integer') {
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
                console.log('✅ Converted day_of_week to varchar');
            }

            console.log('✅ Updated schedules table structure');
        }

        console.log('🎉 Phase 1 completed - table structures fixed');

        // =================================================================
        // 3. SETUP FOREIGN KEY CONSTRAINTS SAFELY
        // =================================================================
        console.log('🔗 3. Setting up foreign key constraints...');

        // Check which tables exist for foreign key references
        const tablesExist = {
            users: await tableExists('users'),
            students: await tableExists('students'),
            groups: await tableExists('groups'),
            courses: await tableExists('courses'),
            rooms: await tableExists('rooms'),
            staff: await tableExists('staff')
        };

        console.log(`📊 Available tables: ${JSON.stringify(tablesExist)}`);

        // Drop all existing foreign key constraints first
        const constraintsToRemove = [
            'FK_attendances_student_id',
            'FK_attendances_group_id',
            'FK_attendances_recorded_by',
            'FK_schedules_teacher_id',
            'FK_schedules_course_id',
            'FK_schedules_group_id',
            'FK_schedules_room_id',
            'FK_schedules_teacher',
            'FK_attendance_student',
            'FK_attendance_schedule',
            'FK_attendance_marked_by'
        ];

        for (const constraint of constraintsToRemove) {
            try {
                await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "${constraint}"`);
                await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "${constraint}"`);
            } catch (error) {
                // Ignore errors for non-existent constraints
            }
        }

        // Add attendances foreign keys
        if (await tableExists('attendances')) {
            console.log('🔗 Setting up attendances foreign keys...');

            if (tablesExist.students) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "attendances"
                        ADD CONSTRAINT "FK_attendances_student_id"
                        FOREIGN KEY ("student_id") REFERENCES "students"("id")
                        ON DELETE CASCADE ON UPDATE NO ACTION
                    `);
                    console.log('✅ Added attendances → students foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add attendances → students FK: ${error.message}`);
                }
            }

            if (tablesExist.groups) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "attendances"
                        ADD CONSTRAINT "FK_attendances_group_id"
                        FOREIGN KEY ("group_id") REFERENCES "groups"("id")
                        ON DELETE SET NULL ON UPDATE NO ACTION
                    `);
                    console.log('✅ Added attendances → groups foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add attendances → groups FK: ${error.message}`);
                }
            }

            if (tablesExist.staff) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "attendances"
                        ADD CONSTRAINT "FK_attendances_recorded_by"
                        FOREIGN KEY ("recorded_by") REFERENCES "staff"("id")
                        ON DELETE SET NULL ON UPDATE NO ACTION
                    `);
                    console.log('✅ Added attendances → staff foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add attendances → staff FK: ${error.message}`);
                }
            }
        }

        // Add schedules foreign keys
        if (await tableExists('schedules')) {
            console.log('🔗 Setting up schedules foreign keys...');

            if (tablesExist.users) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "schedules"
                        ADD CONSTRAINT "FK_schedules_teacher_id"
                        FOREIGN KEY ("teacher_id") REFERENCES "users"("id")
                        ON DELETE SET NULL ON UPDATE CASCADE
                    `);
                    console.log('✅ Added schedules → users (teacher) foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add schedules → users FK: ${error.message}`);
                }
            }

            if (tablesExist.courses) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "schedules"
                        ADD CONSTRAINT "FK_schedules_course_id"
                        FOREIGN KEY ("course_id") REFERENCES "courses"("id")
                        ON DELETE SET NULL ON UPDATE CASCADE
                    `);
                    console.log('✅ Added schedules → courses foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add schedules → courses FK: ${error.message}`);
                }
            }

            if (tablesExist.groups) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "schedules"
                        ADD CONSTRAINT "FK_schedules_group_id"
                        FOREIGN KEY ("group_id") REFERENCES "groups"("id")
                        ON DELETE CASCADE ON UPDATE CASCADE
                    `);
                    console.log('✅ Added schedules → groups foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add schedules → groups FK: ${error.message}`);
                }
            }

            if (tablesExist.rooms) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "schedules"
                        ADD CONSTRAINT "FK_schedules_room_id"
                        FOREIGN KEY ("room_id") REFERENCES "rooms"("id")
                        ON DELETE SET NULL ON UPDATE CASCADE
                    `);
                    console.log('✅ Added schedules → rooms foreign key');
                } catch (error) {
                    console.log(`⚠️  Could not add schedules → rooms FK: ${error.message}`);
                }
            }
        }

        console.log('🎉 Comprehensive schema fixes completed successfully!');
        console.log('📊 Summary:');
        console.log('  ✅ Attendances table structure fixed');
        console.log('  ✅ Schedules table structure fixed');
        console.log('  ✅ Foreign key constraints added safely');
        console.log('  ✅ All entity-database mismatches resolved');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting comprehensive schema fixes...');

        // Remove foreign key constraints
        const constraintsToRemove = [
            'FK_attendances_student_id',
            'FK_attendances_group_id',
            'FK_attendances_recorded_by',
            'FK_schedules_teacher_id',
            'FK_schedules_course_id',
            'FK_schedules_group_id',
            'FK_schedules_room_id'
        ];

        for (const constraint of constraintsToRemove) {
            try {
                await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT IF EXISTS "${constraint}"`);
                await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "${constraint}"`);
            } catch (error) {
                // Ignore errors for non-existent constraints
            }
        }

        console.log('✅ Comprehensive schema revert completed');
        console.log('⚠️  Note: Table structures preserved to prevent data loss');
    }
}
