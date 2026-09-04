import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearPaymentReceiptTemplateDescription1781050000000 implements MigrationInterface {
  name = 'ClearPaymentReceiptTemplateDescription1781050000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "notification_template_definitions" SET "description" = NULL WHERE "template_key" = 'payment.receipt'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "notification_template_definitions" SET "description" = 'Used when a payment is recorded (email + SMS). Each school can change wording, footer, and layout in HTML.' WHERE "template_key" = 'payment.receipt'`,
    );
  }
}
