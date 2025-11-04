import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWeeklySessionPlans1730462400000 implements MigrationInterface {
    name = 'CreateWeeklySessionPlans1730462400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🗓️ Creating weekly session plans table...');

        // Create weekly_session_plans table
        await queryRunner.query(`
            CREATE TABLE "weekly_session_plans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "schedule_id" uuid NOT NULL,
                "week_start_date" date NOT NULL,
                "week_end_date" date NOT NULL,
                "task_title" varchar(255) NOT NULL,
                "task_description" text,
                "is_completed" boolean NOT NULL DEFAULT false,
                "completion_date" timestamp,
                "completion_notes" text,
                "created_by" uuid NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "PK_weekly_session_plans" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "weekly_session_plans" 
            ADD CONSTRAINT "FK_weekly_session_plans_schedule" 
            FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "weekly_session_plans" 
            ADD CONSTRAINT "FK_weekly_session_plans_created_by" 
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        // Create index for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_weekly_session_plans_schedule_week" 
            ON "weekly_session_plans" ("schedule_id", "week_start_date")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_weekly_session_plans_week_dates" 
            ON "weekly_session_plans" ("week_start_date", "week_end_date")
        `);

        console.log('✅ Weekly session plans table created successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🗑️ Dropping weekly session plans table...');

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_session_plans_week_dates"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_weekly_session_plans_schedule_week"`);
        await queryRunner.query(`ALTER TABLE "weekly_session_plans" DROP CONSTRAINT IF EXISTS "FK_weekly_session_plans_created_by"`);
        await queryRunner.query(`ALTER TABLE "weekly_session_plans" DROP CONSTRAINT IF EXISTS "FK_weekly_session_plans_schedule"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "weekly_session_plans"`);

        console.log('✅ Weekly session plans table dropped successfully!');
    }
}
