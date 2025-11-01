import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixScheduleSchema1704067500000 implements MigrationInterface {
    name = 'FixScheduleSchema1704067500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting schedule schema fixes...');

        // 1. Remove the redundant subject column since we have course_id
        console.log('📝 Removing redundant subject column...');
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "subject"`);

        // 2. Ensure teacher_id is varchar type to match users.id (UUID)
        console.log('🔧 Ensuring teacher_id is varchar type...');
        await queryRunner.query(`ALTER TABLE "schedules" ALTER COLUMN "teacher_id" TYPE varchar USING teacher_id::varchar`);

        // 3. Add foreign key constraint for teacher_id to users table
        console.log('🔗 Adding foreign key constraint for teacher_id...');
        await queryRunner.query(`
            ALTER TABLE "schedules" 
            ADD CONSTRAINT "FK_schedules_teacher_id" 
            FOREIGN KEY ("teacher_id") REFERENCES "users"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        // 4. Ensure course_id has proper foreign key constraint
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

        // 5. Ensure group_id has proper foreign key constraint
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting schedule schema fixes...');

        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_teacher_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_course_id"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT IF EXISTS "FK_schedules_group_id"`);

        // Add back the subject column
        await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN "subject" character varying(255)`);

        console.log('✅ Schedule schema revert completed!');
    }
}
