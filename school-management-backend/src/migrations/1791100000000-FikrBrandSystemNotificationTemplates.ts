import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedCallout,
  brandedOtpBlock,
  brandedParagraph,
  defaultPlatformNotificationLayoutHtml,
  FIKR_BRAND,
} from '../notifications/school-notification-branding';

/**
 * Restyle platform email layouts + all system (platform.*) template bodies
 * with FIKR navy/teal chrome and logo-friendly header.
 */
export class FikrBrandSystemNotificationTemplates1791100000000 implements MigrationInterface {
  name = 'FikrBrandSystemNotificationTemplates1791100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const htmlEn = defaultPlatformNotificationLayoutHtml('en');
    const htmlAr = defaultPlatformNotificationLayoutHtml('ar');
    await queryRunner.query(
      `UPDATE "platform_notification_layouts"
       SET "html_en" = $1, "html_ar" = $2, "updated_at" = now()
       WHERE "is_default" = true`,
      [htmlEn, htmlAr],
    );
    // Also refresh any single layout that is the only row (even if not flagged default).
    await queryRunner.query(
      `UPDATE "platform_notification_layouts"
       SET "html_en" = $1, "html_ar" = $2, "updated_at" = now()
       WHERE "name" = 'Default email layout'`,
      [htmlEn, htmlAr],
    );

    const templates: Array<{
      key: string;
      subjectEn: string;
      subjectAr: string;
      htmlEn: string;
      htmlAr: string;
      smsEn: string;
      smsAr: string;
    }> = [
      {
        key: 'platform.signup_email_otp',
        subjectEn: 'Your verification code: {{otpCode}}',
        subjectAr: 'رمز التحقق: {{otpCode}}',
        htmlEn:
          brandedParagraph('Use this code to verify your email on FIKR:') +
          brandedOtpBlock('{{otpCode}}') +
          brandedParagraph(
            `This code expires in <strong>{{expiresMinutes}}</strong> minutes. If you did not request it, you can ignore this email.`,
          ),
        htmlAr:
          brandedParagraph('استخدم هذا الرمز للتحقق من بريدك على منصة فكر:') +
          brandedOtpBlock('{{otpCode}}') +
          brandedParagraph(
            `ينتهي الرمز خلال <strong>{{expiresMinutes}}</strong> دقيقة. إذا لم تطلب الرمز، تجاهل هذه الرسالة.`,
          ),
        smsEn: 'FIKR code: {{otpCode}} (expires in {{expiresMinutes}} min)',
        smsAr: 'رمز فكر: {{otpCode}} (ينتهي خلال {{expiresMinutes}} د)',
      },
      {
        key: 'platform.school_registered',
        subjectEn: 'New school registration: {{schoolName}}',
        subjectAr: 'تسجيل مدرسة جديدة: {{schoolName}}',
        htmlEn:
          brandedParagraph('A new school registered on FIKR:') +
          brandedCallout(
            `<strong>{{schoolName}}</strong><br/>Owner: {{recipientName}} ({{email}})`,
          ),
        htmlAr:
          brandedParagraph('سجّلت مدرسة جديدة على منصة فكر:') +
          brandedCallout(
            `<strong>{{schoolName}}</strong><br/>المالك: {{recipientName}} ({{email}})`,
          ),
        smsEn: 'New school registration: {{schoolName}}.',
        smsAr: 'تسجيل مدرسة جديدة: {{schoolName}}.',
      },
      {
        key: 'platform.school_approved',
        subjectEn: '{{schoolName}} is ready — login & payment receipt',
        subjectAr: '{{schoolName}} جاهزة — الدخول وإيصال السداد',
        htmlEn:
          brandedParagraph('Dear {{recipientName}},') +
          brandedParagraph(
            `<strong>{{schoolName}}</strong> is registered and active on FIKR.`,
          ) +
          brandedCallout(
            `Sign in with <strong>{{email}}</strong><br/>Temporary password: <strong>{{tempPassword}}</strong>`,
          ) +
          brandedParagraph(
            `Plan: <strong>{{planName}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong>`,
          ) +
          brandedParagraph('{{paidNote}}') +
          brandedParagraph(
            `<a href="{{loginUrl}}" style="color:${FIKR_BRAND.teal};font-weight:700;">{{loginUrl}}</a>`,
          ) +
          brandedParagraph(
            'Change the password after you sign in. If a receipt file was uploaded, it is attached.',
          ),
        htmlAr:
          brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
          brandedParagraph(
            `تم تسجيل <strong>{{schoolName}}</strong> وتفعيلها على منصة فكر.`,
          ) +
          brandedCallout(
            `سجّل الدخول بـ <strong>{{email}}</strong><br/>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong>`,
          ) +
          brandedParagraph(
            `الخطة: <strong>{{planName}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong>`,
          ) +
          brandedParagraph('{{paidNote}}') +
          brandedParagraph(
            `<a href="{{loginUrl}}" style="color:${FIKR_BRAND.teal};font-weight:700;">{{loginUrl}}</a>`,
          ) +
          brandedParagraph(
            'غيّر كلمة المرور بعد تسجيل الدخول. إذا رُفع ملف إيصال فهو مرفق.',
          ),
        smsEn:
          '{{schoolName}} ready. {{email}} / {{tempPassword}}. Paid {{amount}} {{currency}}.',
        smsAr:
          '{{schoolName}} جاهزة. {{email}} / {{tempPassword}}. دُفع {{amount}} {{currency}}.',
      },
      {
        key: 'platform.school_rejected',
        subjectEn: '{{schoolName}} registration was not approved',
        subjectAr: 'لم تُقبل مدرسة {{schoolName}}',
        htmlEn:
          brandedParagraph('Dear {{recipientName}},') +
          brandedParagraph(
            `The registration for <strong>{{schoolName}}</strong> was not approved.`,
          ) +
          brandedCallout('{{notes}}'),
        htmlAr:
          brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
          brandedParagraph(`لم تتم الموافقة على تسجيل <strong>{{schoolName}}</strong>.`) +
          brandedCallout('{{notes}}'),
        smsEn: '{{schoolName}} registration was not approved.',
        smsAr: 'لم تتم الموافقة على تسجيل {{schoolName}}.',
      },
      {
        key: 'platform.school_suspended',
        subjectEn: '{{schoolName}} is suspended',
        subjectAr: 'تعليق {{schoolName}}',
        htmlEn:
          brandedParagraph('Dear {{recipientName}},') +
          brandedParagraph(`<strong>{{schoolName}}</strong> has been suspended.`) +
          brandedCallout('{{notes}}'),
        htmlAr:
          brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
          brandedParagraph(`تم تعليق <strong>{{schoolName}}</strong>.`) +
          brandedCallout('{{notes}}'),
        smsEn: '{{schoolName}} has been suspended.',
        smsAr: 'تم تعليق {{schoolName}}.',
      },
      {
        key: 'platform.invoice_issued',
        subjectEn: 'Invoice {{reference}} — {{schoolName}}',
        subjectAr: 'فاتورة {{reference}} — {{schoolName}}',
        htmlEn:
          brandedParagraph('Dear {{recipientName}},') +
          brandedParagraph(
            `Invoice <strong>{{reference}}</strong> for <strong>{{amount}} {{currency}}</strong> has been issued for <strong>{{schoolName}}</strong>.`,
          ) +
          brandedCallout('Sign in to FIKR and complete payment from Billing / Payment.'),
        htmlAr:
          brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
          brandedParagraph(
            `صدرت الفاتورة <strong>{{reference}}</strong> بمبلغ <strong>{{amount}} {{currency}}</strong> لـ <strong>{{schoolName}}</strong>.`,
          ) +
          brandedCallout('سجّل الدخول إلى فكر وأكمل الدفع من الفوترة / الدفع.'),
        smsEn: '{{schoolName}}: invoice {{reference}} ({{amount}} {{currency}}).',
        smsAr: '{{schoolName}}: فاتورة {{reference}} ({{amount}} {{currency}}).',
      },
      {
        key: 'platform.invoice_paid',
        subjectEn: 'Payment receipt {{reference}} — {{schoolName}}',
        subjectAr: 'إيصال سداد {{reference}} — {{schoolName}}',
        htmlEn:
          brandedParagraph('Dear {{recipientName}},') +
          brandedParagraph(
            `This is your payment receipt for <strong>{{schoolName}}</strong>.`,
          ) +
          brandedCallout(
            `Invoice: <strong>{{reference}}</strong><br/>Period: {{periodStart}} → {{periodEnd}}<br/>Invoice total: <strong>{{invoiceTotal}} {{currency}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong>`,
          ) +
          brandedParagraph('{{paidNote}}') +
          brandedParagraph('If a receipt file was uploaded, it is attached to this email.'),
        htmlAr:
          brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
          brandedParagraph(`هذا إيصال سداد اشتراك <strong>{{schoolName}}</strong>.`) +
          brandedCallout(
            `الفاتورة: <strong>{{reference}}</strong><br/>الفترة: {{periodStart}} → {{periodEnd}}<br/>إجمالي الفاتورة: <strong>{{invoiceTotal}} {{currency}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong>`,
          ) +
          brandedParagraph('{{paidNote}}') +
          brandedParagraph('إذا تم رفع ملف إيصال فهو مرفق بهذا البريد.'),
        smsEn: '{{schoolName}}: receipt {{reference}} paid {{amount}} {{currency}}.',
        smsAr: '{{schoolName}}: إيصال {{reference}} بمبلغ {{amount}} {{currency}}.',
      },
    ];

    for (const t of templates) {
      await queryRunner.query(
        `
        UPDATE "notification_template_definitions"
        SET
          "default_subject" = $2,
          "default_body_html" = $3,
          "default_body_sms" = $4,
          "default_subject_ar" = $5,
          "default_body_html_ar" = $6,
          "default_body_sms_ar" = $7,
          "factory_subject" = $2,
          "factory_body_html" = $3,
          "factory_body_sms" = $4,
          "factory_subject_ar" = $5,
          "factory_body_html_ar" = $6,
          "factory_body_sms_ar" = $7
        WHERE "template_key" = $1
        `,
        [t.key, t.subjectEn, t.htmlEn, t.smsEn, t.subjectAr, t.htmlAr, t.smsAr],
      );
    }
  }

  public async down(): Promise<void> {
    // Irreversible content restyle — layouts can be edited in the platform UI.
  }
}
