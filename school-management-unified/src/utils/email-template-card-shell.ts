import { splitNotificationBodyEditableRegion } from '@/utils/email-template-body-region'

const CARD_STYLE =
  'max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);'
const HEADER_STYLE = 'padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;'
const BODY_STYLE = 'padding:24px 28px;'

/** Wrap editable inner HTML in the same card chrome used by notification templates. */
export function wrapInnerInEmailCard(innerHtml: string, lang: 'en' | 'ar'): string {
  const subtitle = lang === 'ar' ? 'رسالة من المدرسة' : 'School message'
  return `<div class="nt-email-card" style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
      <div style="font-size:13px;opacity:.95;margin-top:4px;">${subtitle}</div>
    </div>
    <div class="nt-email-body" style="${BODY_STYLE}">
      ${innerHtml.trim()}
    </div>
  </div>`
}

/** If body inner HTML has no `.nt-email-body`, wrap it so visual mode matches notification templates. */
export function ensureEmailCardBodyRegion(innerHtml: string, lang: 'en' | 'ar'): string {
  const trimmed = innerHtml.trim()
  if (!trimmed) return trimmed
  if (splitNotificationBodyEditableRegion(trimmed)) return trimmed
  return wrapInnerInEmailCard(trimmed, lang)
}

const BODY_SHELL_EN =
  'margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;'
const BODY_SHELL_AR =
  'margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;'

/** Full HTML document for activity “parent approval” letters (only {{parentName}}, {{activityStartDate}}, {{activityEndDate}} in body). */
export function buildActivityParentApprovalDefaultHtml(lang: 'en' | 'ar'): string {
  const isAr = lang === 'ar'
  const bodyParagraphs = isAr
    ? `<p style="margin:0 0 12px;">عزيزي/تي {{parentName}}،</p>
<p style="margin:0 0 14px;line-height:1.55;">يرجى تأكيد المشاركة في هذا النشاط.</p>
<p style="margin:0 0 6px;"><strong>البداية:</strong> {{activityStartDate}}</p>
<p style="margin:0 0 6px;"><strong>النهاية:</strong> {{activityEndDate}}</p>`
    : `<p style="margin:0 0 12px;">Dear {{parentName}},</p>
<p style="margin:0 0 14px;line-height:1.55;">Please confirm participation in this activity.</p>
<p style="margin:0 0 6px;"><strong>Starts:</strong> {{activityStartDate}}</p>
<p style="margin:0 0 6px;"><strong>Ends:</strong> {{activityEndDate}}</p>`

  const inner = wrapInnerInEmailCard(bodyParagraphs, lang)
  if (isAr) {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>موافقة</title>
</head>
<body style="${BODY_SHELL_AR}">
  ${inner}
</body>
</html>`
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Approval</title>
</head>
<body style="${BODY_SHELL_EN}">
  ${inner}
</body>
</html>`
}

export function buildMessageLetterDefaultHtml(lang: 'en' | 'ar'): string {
  const isAr = lang === 'ar'
  const bodyParagraphs = isAr
    ? `<p style="margin:0 0 12px;">عزيزي/تي {{parentName}}،</p>
<p style="margin:0 0 16px;line-height:1.55;">نود إفادتكم بخصوص الطالب/ة <strong>{{studentName}}</strong>.</p>
<p style="margin:0 0 8px;"><strong>المعلم:</strong> {{teacherName}}</p>
<p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">مع التحية،<br/>{{schoolName}}</p>`
    : `<p style="margin:0 0 12px;">Dear {{parentName}},</p>
<p style="margin:0 0 16px;line-height:1.55;">This message concerns <strong>{{studentName}}</strong>.</p>
<p style="margin:0 0 8px;"><strong>Teacher:</strong> {{teacherName}}</p>
<p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Regards,<br/>{{schoolName}}</p>`

  const inner = wrapInnerInEmailCard(bodyParagraphs, lang)
  if (isAr) {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>رسالة</title>
</head>
<body style="${BODY_SHELL_AR}">
  ${inner}
</body>
</html>`
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Message</title>
</head>
<body style="${BODY_SHELL_EN}">
  ${inner}
</body>
</html>`
}
