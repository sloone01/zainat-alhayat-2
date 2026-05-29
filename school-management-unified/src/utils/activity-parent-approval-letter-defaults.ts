import type { ParentApprovalLetterBundle } from '@/services/activity.service'
import { buildActivityParentApprovalDefaultHtml } from '@/utils/email-template-card-shell'

export const ACTIVITY_PARENT_APPROVAL_SMS = {
  en: 'Hi {{parentName}}, please confirm participation. {{activityStartDate}} – {{activityEndDate}}',
  ar: 'مرحبًا {{parentName}}، يرجى تأكيد المشاركة. {{activityStartDate}} – {{activityEndDate}}',
} as const

export function createParentApprovalLetterBundle(subjects: { en: string; ar: string }): ParentApprovalLetterBundle {
  return {
    en: {
      subject: subjects.en,
      body_html: buildActivityParentApprovalDefaultHtml('en'),
      body_sms: ACTIVITY_PARENT_APPROVAL_SMS.en,
    },
    ar: {
      subject: subjects.ar,
      body_html: buildActivityParentApprovalDefaultHtml('ar'),
      body_sms: ACTIVITY_PARENT_APPROVAL_SMS.ar,
    },
  }
}
