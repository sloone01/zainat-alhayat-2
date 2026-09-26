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
  /** Present after the ticket is opened. List rows omit it so screenshots are not downloaded up front. */
  description_html?: string
  context?: SupportRequestContext | null
  status: SupportRequestStatus
  fixed?: boolean
  fixed_at?: string | null
  created_at: string
  updated_at: string
}

export interface SupportRequestPage {
  items: SupportRequest[]
  total: number
  page: number
  limit: number
  pages: number
}

class SupportService extends BaseApiService {
  create(payload: {
    title: string
    description_html: string
    context?: SupportRequestContext
  }): Promise<SupportRequest> {
    return this.post<SupportRequest>('/support-requests', payload)
  }

  mine(page = 1, limit = 20): Promise<SupportRequestPage> {
    return this.get<SupportRequestPage>('/support-requests/mine', { page, limit })
  }

  getOne(id: string): Promise<SupportRequest> {
    return this.get<SupportRequest>(`/support-requests/${id}`)
  }

  /** Platform admins only. */
  getAll(status: SupportRequestStatus | undefined, page = 1, limit = 20): Promise<SupportRequestPage> {
    return this.get<SupportRequestPage>('/support-requests', {
      ...(status ? { status } : {}),
      page,
      limit,
    })
  }

  updateStatus(id: string, status: SupportRequestStatus): Promise<SupportRequest> {
    return this.patch<SupportRequest>(`/support-requests/${id}/status`, { status })
  }

  /** Platform admins only. Toggle the "fixed" flag. */
  updateFixed(id: string, fixed: boolean): Promise<SupportRequest> {
    return this.patch<SupportRequest>(`/support-requests/${id}/fixed`, { fixed })
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
