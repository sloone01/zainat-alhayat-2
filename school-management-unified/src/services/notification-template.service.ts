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
  audience?: 'school' | 'system'
  en: NotificationTemplateLocaleBlock
  ar: NotificationTemplateLocaleBlock
  variable_hints: NotificationTemplateVariableHint[] | null
  uses_school_overrides: boolean
  uses_custom_default?: boolean
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

  listForPlatform(audience?: 'school' | 'system' | 'all'): Promise<MergedNotificationTemplate[]> {
    return this.get<MergedNotificationTemplate[]>('/platform/notification-templates', {
      ...(audience && audience !== 'all' ? { audience } : {}),
    })
  }

  sampleVariablesPlatform(): Promise<Record<string, string>> {
    return this.get<Record<string, string>>('/platform/notification-templates/sample-variables')
  }

  updatePlatform(templateKey: string, body: UpdateNotificationTemplatePayload): Promise<MergedNotificationTemplate> {
    return this.put<MergedNotificationTemplate>(
      `/platform/notification-templates/${encodeURIComponent(templateKey)}`,
      body,
    )
  }

  resetPlatform(templateKey: string): Promise<MergedNotificationTemplate> {
    return this.delete<MergedNotificationTemplate>(
      `/platform/notification-templates/${encodeURIComponent(templateKey)}`,
    )
  }

  previewPlatform(payload: {
    locale: 'en' | 'ar'
    subject: string
    body_html: string
    body_sms?: string
    sample_variables: Record<string, string>
  }): Promise<PreviewRendered> {
    return this.post<PreviewRendered>('/platform/notification-templates/preview', payload)
  }
}

export const notificationTemplateService = new NotificationTemplateApiService()
export default notificationTemplateService
