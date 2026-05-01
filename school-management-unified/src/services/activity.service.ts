import { BaseApiService } from './api'

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
  school_id: number
  group_id?: string | null
  created_by?: string | null
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
  school_id: number
  group_id?: string
  created_by?: string
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
}

export interface ActivityQueryParams {
  school_id?: number
  group_id?: string
  is_active?: boolean
  activity_type?: string
  from_date?: string
  to_date?: string
}

class ActivityService extends BaseApiService {
  async getAll(params?: ActivityQueryParams): Promise<Activity[]> {
    return this.get<Activity[]>('/activities', params)
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
}

export const activityService = new ActivityService()
export default activityService
