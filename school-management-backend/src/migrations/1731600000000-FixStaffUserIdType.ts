import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixStaffUserIdType1731600000000 implements MigrationInterface {
    name = 'FixStaffUserIdType1731600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix staff table user_id column to be UUID instead of integer
        await queryRunner.query(`
            -- First, drop the foreign key constraint if it exists
            ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "FK_staff_user_id";
        `);

        await queryRunner.query(`
            -- Change user_id column type from integer to UUID
            ALTER TABLE "staff" ALTER COLUMN "user_id" TYPE uuid USING user_id::text::uuid;
        `);

        await queryRunner.query(`
            -- Re-add the foreign key constraint
            ALTER TABLE "staff" ADD CONSTRAINT "FK_staff_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        `);

        // Ensure we have at least one staff record for testing
        await queryRunner.query(`
            -- Insert a default staff record if none exists
            INSERT INTO "staff" ("user_id", "school_id", "created_at", "updated_at")
            SELECT 
                u.id as user_id,
                1 as school_id,
                NOW() as created_at,
                NOW() as updated_at
            FROM "users" u 
            WHERE u.role IN ('admin', 'teacher') 
            AND NOT EXISTS (SELECT 1 FROM "staff" s WHERE s.user_id = u.id)
            LIMIT 1;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse the changes
        await queryRunner.query(`
            -- Drop the foreign key constraint
            ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "FK_staff_user_id";
        `);

        await queryRunner.query(`
            -- Change user_id column type back to integer
            ALTER TABLE "staff" ALTER COLUMN "user_id" TYPE integer USING user_id::text::integer;
        `);

        await queryRunner.query(`
            -- Re-add the foreign key constraint (this might fail if data is inconsistent)
            ALTER TABLE "staff" ADD CONSTRAINT "FK_staff_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
        `);
    }
}
