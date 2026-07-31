import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformBilling1783600000000 implements MigrationInterface {
  name = 'CreatePlatformBilling1783600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plans" (
        "id" SERIAL PRIMARY KEY,
        "code" varchar(64) NOT NULL UNIQUE,
        "name_en" varchar(120) NOT NULL,
        "name_ar" varchar(120) NOT NULL,
        "description_en" text NULL,
        "description_ar" text NULL,
        "included_student_seats" int NOT NULL DEFAULT 50,
        "overage_per_student_omr" numeric(10,3) NOT NULL DEFAULT 0,
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plan_prices" (
        "id" SERIAL PRIMARY KEY,
        "plan_id" int NOT NULL REFERENCES "platform_plans"("id") ON DELETE CASCADE,
        "billing_period" varchar(32) NOT NULL,
        "amount_omr" numeric(12,3) NOT NULL,
        CONSTRAINT "UQ_platform_plan_prices_plan_period" UNIQUE ("plan_id", "billing_period"),
        CONSTRAINT "CHK_platform_plan_prices_period" CHECK (
          "billing_period" IN ('monthly', 'semester', 'yearly', 'summer')
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plan_features" (
        "id" SERIAL PRIMARY KEY,
        "plan_id" int NOT NULL REFERENCES "platform_plans"("id") ON DELETE CASCADE,
        "feature_key" varchar(64) NOT NULL,
        CONSTRAINT "UQ_platform_plan_features_plan_key" UNIQUE ("plan_id", "feature_key")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_addons" (
        "id" SERIAL PRIMARY KEY,
        "code" varchar(64) NOT NULL UNIQUE,
        "name_en" varchar(120) NOT NULL,
        "name_ar" varchar(120) NOT NULL,
        "amount_omr" numeric(12,3) NOT NULL,
        "feature_key" varchar(64) NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_platform_subscriptions" (
        "id" SERIAL PRIMARY KEY,
        "school_id" int NOT NULL UNIQUE REFERENCES "schools"("id") ON DELETE CASCADE,
        "plan_id" int NOT NULL REFERENCES "platform_plans"("id") ON DELETE RESTRICT,
        "billing_period" varchar(32) NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "period_start" date NOT NULL,
        "period_end" date NOT NULL,
        "included_student_seats_override" int NULL,
        "notes" text NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_school_platform_sub_period" CHECK (
          "billing_period" IN ('monthly', 'semester', 'yearly', 'summer')
        ),
        CONSTRAINT "CHK_school_platform_sub_status" CHECK (
          "status" IN ('draft', 'active', 'past_due', 'cancelled')
        )
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_platform_subscription_addons" (
        "id" SERIAL PRIMARY KEY,
        "subscription_id" int NOT NULL REFERENCES "school_platform_subscriptions"("id") ON DELETE CASCADE,
        "addon_id" int NOT NULL REFERENCES "platform_addons"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_school_platform_sub_addon" UNIQUE ("subscription_id", "addon_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_invoices" (
        "id" SERIAL PRIMARY KEY,
        "school_id" int NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
        "subscription_id" int NOT NULL REFERENCES "school_platform_subscriptions"("id") ON DELETE CASCADE,
        "billing_period" varchar(32) NOT NULL,
        "period_start" date NOT NULL,
        "period_end" date NOT NULL,
        "base_amount" numeric(12,3) NOT NULL DEFAULT 0,
        "seats_included" int NOT NULL DEFAULT 0,
        "seats_used" int NOT NULL DEFAULT 0,
        "overage_amount" numeric(12,3) NOT NULL DEFAULT 0,
        "addons_amount" numeric(12,3) NOT NULL DEFAULT 0,
        "total_amount" numeric(12,3) NOT NULL DEFAULT 0,
        "status" varchar(32) NOT NULL DEFAULT 'issued',
        "paid_at" TIMESTAMPTZ NULL,
        "paid_note" text NULL,
        "line_items" jsonb NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_platform_invoices_period" CHECK (
          "billing_period" IN ('monthly', 'semester', 'yearly', 'summer')
        ),
        CONSTRAINT "CHK_platform_invoices_status" CHECK (
          "status" IN ('draft', 'issued', 'paid', 'void')
        )
      )
    `);

    // Seed plans
    await queryRunner.query(`
      INSERT INTO "platform_plans"
        ("code", "name_en", "name_ar", "description_en", "description_ar",
         "included_student_seats", "overage_per_student_omr", "sort_order", "is_active")
      VALUES
        ('essential', 'Essential', 'الأساسية',
         'Core records, attendance, and parent updates.',
         'السجلات الأساسية والحضور وتحديثات أولياء الأمور.',
         50, 0.500, 1, true),
        ('standard', 'Standard', 'القياسية',
         'Rich communication and academic tracking — best fit for most kindergartens.',
         'تواصل غني وتتبع أكاديمي — الأنسب لمعظم الروضات.',
         150, 0.400, 2, true),
        ('complete', 'Complete', 'المتكاملة',
         'Video sessions, enrollment tools, and priority support.',
         'جلسات فيديو وأدوات تسجيل ودعم ذو أولوية.',
         500, 0.300, 3, true)
      ON CONFLICT ("code") DO NOTHING
    `);

    // Prices: monthly base; semester×5; yearly×10; summer×3
    await queryRunner.query(`
      INSERT INTO "platform_plan_prices" ("plan_id", "billing_period", "amount_omr")
      SELECT p.id, v.period, v.amount
      FROM "platform_plans" p
      CROSS JOIN (VALUES
        ('essential', 'monthly', 45.000),
        ('essential', 'semester', 225.000),
        ('essential', 'yearly', 450.000),
        ('essential', 'summer', 135.000),
        ('standard', 'monthly', 80.000),
        ('standard', 'semester', 400.000),
        ('standard', 'yearly', 800.000),
        ('standard', 'summer', 240.000),
        ('complete', 'monthly', 125.000),
        ('complete', 'semester', 625.000),
        ('complete', 'yearly', 1250.000),
        ('complete', 'summer', 375.000)
      ) AS v(code, period, amount)
      WHERE p.code = v.code
      ON CONFLICT ("plan_id", "billing_period") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "platform_plan_features" ("plan_id", "feature_key")
      SELECT p.id, f.feature_key
      FROM "platform_plans" p
      CROSS JOIN (VALUES
        ('essential', 'roster'),
        ('essential', 'attendance'),
        ('essential', 'schedules'),
        ('essential', 'parent_portal'),
        ('standard', 'roster'),
        ('standard', 'attendance'),
        ('standard', 'schedules'),
        ('standard', 'parent_portal'),
        ('standard', 'messaging'),
        ('standard', 'graded_courses'),
        ('standard', 'transportation'),
        ('standard', 'photo_sharing'),
        ('complete', 'roster'),
        ('complete', 'attendance'),
        ('complete', 'schedules'),
        ('complete', 'parent_portal'),
        ('complete', 'messaging'),
        ('complete', 'graded_courses'),
        ('complete', 'transportation'),
        ('complete', 'photo_sharing'),
        ('complete', 'video_sessions'),
        ('complete', 'enrollment'),
        ('complete', 'group_chat')
      ) AS f(code, feature_key)
      WHERE p.code = f.code
      ON CONFLICT ("plan_id", "feature_key") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "platform_addons" ("code", "name_en", "name_ar", "amount_omr", "feature_key", "is_active")
      VALUES
        ('transportation', 'Transportation', 'النقل المدرسي', 15.000, 'transportation', true),
        ('video_sessions', 'Video sessions', 'جلسات الفيديو', 25.000, 'video_sessions', true),
        ('sms', 'SMS notifications', 'إشعارات الرسائل النصية', 20.000, 'sms', true)
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_invoices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_platform_subscription_addons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_platform_subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_addons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_plan_features"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_plan_prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_plans"`);
  }
}
