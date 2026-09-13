import { BaseApiService } from './api'

export interface NotificationLayout {
  id: string
  school_id?: string
  name: string
  name_ar: string | null
  html_en: string
  html_ar: string | null
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export interface UpsertNotificationLayoutPayload {
  name: string
  name_ar?: string | null
  html_en: string
  html_ar?: string | null
  is_default?: boolean
}

class NotificationLayoutApiService extends BaseApiService {
  private root(platform: boolean) {
    return platform ? '/platform/notification-layouts' : '/notification-layouts'
  }

  list(opts: { platform?: boolean; schoolId?: string }): Promise<NotificationLayout[]> {
    if (opts.platform) return this.get<NotificationLayout[]>(this.root(true))
    return this.get<NotificationLayout[]>(this.root(false), { school_id: opts.schoolId })
  }

  create(
    opts: { platform?: boolean; schoolId?: string },
    body: UpsertNotificationLayoutPayload,
  ): Promise<NotificationLayout> {
    if (opts.platform) return this.post<NotificationLayout>(this.root(true), body)
    const q = new URLSearchParams({ school_id: String(opts.schoolId) })
    return this.post<NotificationLayout>(`${this.root(false)}?${q}`, body)
  }

  update(
    opts: { platform?: boolean; schoolId?: string },
    id: string,
    body: UpsertNotificationLayoutPayload,
  ): Promise<NotificationLayout> {
    if (opts.platform) {
      return this.put<NotificationLayout>(`${this.root(true)}/${encodeURIComponent(id)}`, body)
    }
    const q = new URLSearchParams({ school_id: String(opts.schoolId) })
    return this.put<NotificationLayout>(
      `${this.root(false)}/${encodeURIComponent(id)}?${q}`,
      body,
    )
  }

  remove(opts: { platform?: boolean; schoolId?: string }, id: string): Promise<void> {
    if (opts.platform) {
      return this.delete<void>(`${this.root(true)}/${encodeURIComponent(id)}`)
    }
    const q = new URLSearchParams({ school_id: String(opts.schoolId) })
    return this.delete<void>(`${this.root(false)}/${encodeURIComponent(id)}?${q}`)
  }

  preview(
    platform: boolean,
    payload: {
      locale: 'en' | 'ar'
      html: string
      sample_content?: string
      sample_variables?: Record<string, string>
      school_id?: string
    },
  ): Promise<{ html: string }> {
    return this.post<{ html: string }>(`${this.root(platform)}/preview`, payload)
  }
}

export const notificationLayoutService = new NotificationLayoutApiService()
export default notificationLayoutService
