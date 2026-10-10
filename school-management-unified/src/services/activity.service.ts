import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export interface ParentApprovalLetterLocale {
  subject: string
  body_html: string
  body_sms: string
}

export interface ParentApprovalLetterBundle {
  en: ParentApprovalLetterLocale
  ar: ParentApprovalLetterLocale
}

export interface Activity {
  id: string
  title: string
  description?: string | null
  activity_date: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  activity_type: string
  is_active: boolean
  school_id: string
  group_id?: string | null
  created_by?: string | null
  requires_parent_approval?: boolean
  image_url?: string | null
  approval_letter_id?: string | null
  approval_approved?: number | null
  approval_total?: number | null
  parent_approval_letter?: ParentApprovalLetterBundle | null
  created_at: string
  updated_at: string
  group?: {
    id: string
    name: string
  } | null
  createdByUser?: {
    id: string
    firstName?: string
    lastName?: string
  } | null
}

export interface CreateActivityRequest {
  title: string
  description?: string
  activity_date: string
  start_time?: string
  end_time?: string
  location?: string
  activity_type: string
  is_active?: boolean
  school_id: string
  group_id?: string
  created_by?: string
  requires_parent_approval?: boolean
  parent_approval_letter?: ParentApprovalLetterBundle
}

/** PATCH body must match backend UpdateActivityDto (global ValidationPipe forbids extra keys). */
export interface UpdateActivityRequest {
  title?: string
  description?: string
  activity_date?: string
  start_time?: string
  end_time?: string
  location?: string
  activity_type?: string
  is_active?: boolean
  group_id?: string | null
  requires_parent_approval?: boolean
  parent_approval_letter?: ParentApprovalLetterBundle | null
  image_url?: null
}

export interface ActivityQueryParams {
  school_id?: string
  group_id?: string
  is_active?: boolean
  activity_type?: string
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
  q?: string
  status?: string
}

class ActivityService extends BaseApiService {
  async getAll(params?: ActivityQueryParams): Promise<Activity[]> {
    return this.get<Activity[]>('/activities', params)
  }

  async listPage(params: ActivityQueryParams): Promise<PageResult<Activity>> {
    const query: Record<string, string | number | boolean> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.school_id) query.school_id = params.school_id
    if (params.group_id) query.group_id = params.group_id
    if (params.activity_type) query.activity_type = params.activity_type
    if (params.status && params.status !== 'all') query.status = params.status
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.is_active !== undefined) query.is_active = params.is_active
    if (params.from_date) query.from_date = params.from_date
    if (params.to_date) query.to_date = params.to_date
    return this.get('/activities', query)
  }

  async getById(id: string): Promise<Activity> {
    return this.get<Activity>(`/activities/${id}`)
  }

  async create(payload: CreateActivityRequest): Promise<Activity> {
    return this.post<Activity>('/activities', payload)
  }

  async update(id: string, payload: UpdateActivityRequest): Promise<Activity> {
    return this.patch<Activity>(`/activities/${id}`, payload)
  }

  async deleteActivity(id: string): Promise<void> {
    await this.delete(`/activities/${id}`)
  }

  async uploadImage(id: string, file: File): Promise<Activity> {
    const form = new FormData()
    form.append('image', file)
    return this.upload<Activity>(`/activities/${id}/image`, form)
  }
}

export const activityService = new ActivityService()
export default activityService
