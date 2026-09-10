import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedDetails,
  brandedHeading,
  brandedParagraph,
  defaultPlatformNotificationLayoutHtml,
} from '../notifications/school-notification-branding';

/** RTL header cell order + plain (uncolored) inquiry body copy. */
export class FikrSystemEmailRtlAndPlainBody1792010000000 implements MigrationInterface {
  name = 'FikrSystemEmailRtlAndPlainBody1792010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "platform_notification_layouts"
       SET "html_en" = $1, "html_ar" = $2, "updated_at" = now()
       WHERE "is_default" = true OR "name" = 'Default email layout'`,
      [
        defaultPlatformNotificationLayoutHtml('en'),
        defaultPlatformNotificationLayoutHtml('ar'),
      ],
    );

    const inquiryEn =
      brandedHeading('New subscription inquiry') +
      brandedParagraph('A school asked to continue with a FIKR subscription from the marketing site.') +
      brandedDetails([
        ['School', '{{schoolName}}'],
        ['Email', '{{email}}'],
        ['Mobile', '{{phone}}'],
        ['Size', '{{schoolSize}}'],
      ]) +
      brandedParagraph('Please contact them to continue the conversation.');
    const inquiryAr =
      brandedHeading('طلب اشتراك جديد') +
      brandedParagraph('طلبت مدرسة المتابعة للاشتراك في منصة فكر من صفحة التعريف.') +
      brandedDetails([
        ['المدرسة', '{{schoolName}}'],
        ['البريد', '{{email}}'],
        ['الجوال', '{{phone}}'],
        ['الحجم', '{{schoolSize}}'],
      ]) +
      brandedParagraph('يرجى التواصل معهم لمتابعة الطلب.');

    const receivedEn =
      brandedHeading('We received your request') +
      brandedParagraph('Thank you for contacting FIKR about <strong>{{schoolName}}</strong>.') +
      brandedDetails([
        ['School', '{{schoolName}}'],
        ['Email', '{{email}}'],
        ['Mobile', '{{phone}}'],
      ]) +
      brandedParagraph('Our team will communicate with you shortly.');
    const receivedAr =
      brandedHeading('استلمنا طلبك') +
      brandedParagraph('شكراً لتواصلك مع فكر بشأن <strong>{{schoolName}}</strong>.') +
      brandedDetails([
        ['المدرسة', '{{schoolName}}'],
        ['البريد', '{{email}}'],
        ['الجوال', '{{phone}}'],
      ]) +
      brandedParagraph('سيتواصل فريقنا معك قريباً.');

    await queryRunner.query(
      `UPDATE "notification_template_definitions"
       SET "default_body_html" = $2, "default_body_html_ar" = $3,
           "factory_body_html" = $2, "factory_body_html_ar" = $3
       WHERE "template_key" = $1`,
      ['platform.school_inquiry', inquiryEn, inquiryAr],
    );
    await queryRunner.query(
      `UPDATE "notification_template_definitions"
       SET "default_body_html" = $2, "default_body_html_ar" = $3,
           "factory_body_html" = $2, "factory_body_html_ar" = $3
       WHERE "template_key" = $1`,
      ['platform.school_inquiry_received', receivedEn, receivedAr],
    );
  }

  public async down(): Promise<void> {
    // Restyle — revert from git if needed.
  }
}
