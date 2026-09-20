import { BaseApiService } from './api'

export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export const SUPPORT_REQUEST_STATUSES: SupportRequestStatus[] = ['open', 'in_progress', 'resolved', 'closed']

export interface SupportRequestUser {
  id: string
  username?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  first_name_ar?: string | null
  first_name_en?: string | null
  last_name_ar?: string | null
  last_name_en?: string | null
  role?: string | null
}

export interface SupportRequestContext {
  page_url?: string
  user_agent?: string
  viewport?: string
  language?: string
  captured_at?: string
  console_errors?: string[]
  screenshot_url?: string
}

export interface SupportRequest {
  id: string
  school_id?: string | null
  user_id: string
  user?: SupportRequestUser | null
  title: string
  description_html: string
  context?: SupportRequestContext | null
  status: SupportRequestStatus
  created_at: string
  updated_at: string
}

class SupportService extends BaseApiService {
  create(payload: {
    title: string
    description_html: string
    context?: SupportRequestContext
  }): Promise<SupportRequest> {
    return this.post<SupportRequest>('/support-requests', payload)
  }

  mine(): Promise<SupportRequest[]> {
    return this.get<SupportRequest[]>('/support-requests/mine')
  }

  /** Platform admins only. */
  getAll(status?: SupportRequestStatus): Promise<SupportRequest[]> {
    return this.get<SupportRequest[]>('/support-requests', status ? { status } : undefined)
  }

  updateStatus(id: string, status: SupportRequestStatus): Promise<SupportRequest> {
    return this.patch<SupportRequest>(`/support-requests/${id}/status`, { status })
  }

  /** Returns the protected `/api/files/support/...` URL of the uploaded image. */
  async uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append('image', file)
    const res = await this.upload<{ filename: string; url: string }>('/support-requests/images', form)
    return res.url
  }
}

export const supportService = new SupportService()
export default supportService
