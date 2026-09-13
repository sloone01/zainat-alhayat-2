import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Refresh platform.invoice_paid copy so the owner email acts as a payment
 * receipt (paid amount + period; uploaded file attached by the send path).
 */
export class PlatformInvoicePaidReceiptEmail1790900000000 implements MigrationInterface {
  name = 'PlatformInvoicePaidReceiptEmail1790900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "display_name" = 'Platform invoice paid (receipt)',
        "description" = 'Payment receipt emailed to the school owner when a platform invoice is marked paid. Uploaded receipt files are attached to the email.',
        "default_subject" = 'Payment receipt {{reference}} — {{schoolName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>This is your payment receipt for <strong>{{schoolName}}</strong>.</p><p>Invoice: <strong>{{reference}}</strong><br/>Period: {{periodStart}} → {{periodEnd}}<br/>Invoice total: <strong>{{invoiceTotal}} {{currency}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p>If a receipt file was uploaded, it is attached to this email.</p>$html$,
        "default_body_sms" = '{{schoolName}}: receipt {{reference}} paid {{amount}} {{currency}}.',
        "default_subject_ar" = 'إيصال سداد {{reference}} — {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>هذا إيصال سداد اشتراك <strong>{{schoolName}}</strong>.</p><p>الفاتورة: <strong>{{reference}}</strong><br/>الفترة: {{periodStart}} → {{periodEnd}}<br/>إجمالي الفاتورة: <strong>{{invoiceTotal}} {{currency}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p>إذا تم رفع ملف إيصال فهو مرفق بهذا البريد.</p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: إيصال {{reference}} بمبلغ {{amount}} {{currency}}.',
        "factory_subject" = 'Payment receipt {{reference}} — {{schoolName}}',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>This is your payment receipt for <strong>{{schoolName}}</strong>.</p><p>Invoice: <strong>{{reference}}</strong><br/>Period: {{periodStart}} → {{periodEnd}}<br/>Invoice total: <strong>{{invoiceTotal}} {{currency}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p>If a receipt file was uploaded, it is attached to this email.</p>$html$,
        "factory_body_sms" = '{{schoolName}}: receipt {{reference}} paid {{amount}} {{currency}}.',
        "factory_subject_ar" = 'إيصال سداد {{reference}} — {{schoolName}}',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>هذا إيصال سداد اشتراك <strong>{{schoolName}}</strong>.</p><p>الفاتورة: <strong>{{reference}}</strong><br/>الفترة: {{periodStart}} → {{periodEnd}}<br/>إجمالي الفاتورة: <strong>{{invoiceTotal}} {{currency}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p>إذا تم رفع ملف إيصال فهو مرفق بهذا البريد.</p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: إيصال {{reference}} بمبلغ {{amount}} {{currency}}.',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"},{"name":"reference","description":"Short invoice id"},{"name":"amount","description":"Amount paid"},{"name":"invoiceTotal","description":"Invoice total"},{"name":"currency","description":"Currency"},{"name":"periodStart","description":"Period start"},{"name":"periodEnd","description":"Period end"},{"name":"paidNote","description":"Optional payment note"},{"name":"schoolName","description":"School name"}]'::jsonb
      WHERE "template_key" = 'platform.invoice_paid'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "display_name" = 'Platform invoice paid',
        "description" = 'Sent to the school owner when a platform invoice is marked paid.',
        "default_subject" = 'Invoice {{reference}} paid — {{schoolName}}',
        "default_body_html" = '<p>Dear {{recipientName}},</p><p>Invoice {{reference}} ({{amount}} {{currency}}) is marked paid.</p>',
        "default_body_sms" = '{{schoolName}}: invoice {{reference}} is paid.',
        "default_subject_ar" = 'سداد الفاتورة {{reference}} — {{schoolName}}',
        "default_body_html_ar" = '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تعليم الفاتورة {{reference}} ({{amount}} {{currency}}) كمدفوعة.</p>',
        "default_body_sms_ar" = '{{schoolName}}: تم سداد الفاتورة {{reference}}.',
        "factory_subject" = 'Invoice {{reference}} paid — {{schoolName}}',
        "factory_body_html" = '<p>Dear {{recipientName}},</p><p>Invoice {{reference}} ({{amount}} {{currency}}) is marked paid.</p>',
        "factory_body_sms" = '{{schoolName}}: invoice {{reference}} is paid.',
        "factory_subject_ar" = 'سداد الفاتورة {{reference}} — {{schoolName}}',
        "factory_body_html_ar" = '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تعليم الفاتورة {{reference}} ({{amount}} {{currency}}) كمدفوعة.</p>',
        "factory_body_sms_ar" = '{{schoolName}}: تم سداد الفاتورة {{reference}}.',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"},{"name":"reference","description":"Invoice id"},{"name":"amount","description":"Amount"},{"name":"currency","description":"Currency"}]'::jsonb
      WHERE "template_key" = 'platform.invoice_paid'
    `);
  }
}
