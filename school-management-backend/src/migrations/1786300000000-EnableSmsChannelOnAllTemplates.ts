import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SMS default copy was already seeded on every template, but several rows stayed
 * channel = 'email', so the dispatcher skipped SMS and older UI hid the SMS pane.
 * Promote any definition with SMS body text to channel = 'both'.
 */
export class EnableSmsChannelOnAllTemplates1786300000000 implements MigrationInterface {
  name = 'EnableSmsChannelOnAllTemplates1786300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "channel" = 'both',
        "updated_at" = NOW()
      WHERE "channel" <> 'both'
        AND (
          (NULLIF(btrim(COALESCE("default_body_sms", '')), '') IS NOT NULL)
          OR (NULLIF(btrim(COALESCE("default_body_sms_ar", '')), '') IS NOT NULL)
          OR (NULLIF(btrim(COALESCE("factory_body_sms", '')), '') IS NOT NULL)
        )
    `);

    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "factory_body_sms" = "default_body_sms",
        "updated_at" = NOW()
      WHERE NULLIF(btrim(COALESCE("factory_body_sms", '')), '') IS NULL
        AND NULLIF(btrim(COALESCE("default_body_sms", '')), '') IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET "channel" = 'email', "updated_at" = NOW()
      WHERE "template_key" IN (
        'payment.offline_submitted',
        'transfer.pending_school',
        'auth.password_reset',
        'payment.approved_pending',
        'transfer.rejected',
        'auth.account_created',
        'letter.approval_resolved',
        'platform.school_registered',
        'platform.invoice_issued',
        'platform.invoice_paid'
      )
    `);
  }
}
