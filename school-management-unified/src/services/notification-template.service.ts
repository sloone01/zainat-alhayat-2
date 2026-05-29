import { BaseApiService } from './api'

export interface NotificationTemplateVariableHint {
  name: string
  description: string
}

export interface NotificationTemplateLocaleBlock {
  subject: string
  body_html: string
  body_sms: string
}

export interface MergedNotificationTemplate {
  template_key: string
  display_name: string
  description: string | null
  channel: string
  en: NotificationTemplateLocaleBlock
  ar: NotificationTemplateLocaleBlock
  variable_hints: NotificationTemplateVariableHint[] | null
  uses_school_overrides: boolean
}

export interface PreviewRendered {
  subject: string
  body_html: string
  body_sms: string
}

export interface UpdateNotificationTemplatePayload {
  en: { subject: string; body_html: string; body_sms?: string }
  ar: { subject: string; body_html: string; body_sms?: string }
}

class NotificationTemplateApiService extends BaseApiService {
  listForSchool(schoolId: number): Promise<MergedNotificationTemplate[]> {
    return this.get<MergedNotificationTemplate[]>('/notification-templates', { school_id: schoolId })
  }

  getOne(schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    return this.get<MergedNotificationTemplate>(`/notification-templates/${encodeURIComponent(templateKey)}`, {
      school_id: schoolId,
    })
  }

  sampleVariables(schoolId: number): Promise<Record<string, string>> {
    return this.get<Record<string, string>>('/notification-templates/sample-variables', { school_id: schoolId })
  }

  update(schoolId: number, templateKey: string, body: UpdateNotificationTemplatePayload): Promise<MergedNotificationTemplate> {
    const q = new URLSearchParams({ school_id: String(schoolId) })
    return this.put<MergedNotificationTemplate>(
      `/notification-templates/${encodeURIComponent(templateKey)}?${q}`,
      body,
    )
  }

  reset(schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    const q = new URLSearchParams({ school_id: String(schoolId) })
    return this.delete<MergedNotificationTemplate>(
      `/notification-templates/${encodeURIComponent(templateKey)}?${q}`,
    )
  }

  preview(payload: {
    locale: 'en' | 'ar'
    subject: string
    body_html: string
    body_sms?: string
    sample_variables: Record<string, string>
    school_id?: number
  }): Promise<PreviewRendered> {
    return this.post<PreviewRendered>('/notification-templates/preview', payload)
  }
}

export const notificationTemplateService = new NotificationTemplateApiService()
export default notificationTemplateService
