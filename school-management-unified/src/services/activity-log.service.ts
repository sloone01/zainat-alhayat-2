import { BaseApiService } from './api'

export interface ActivityLogRow {
  id: number
  user_id: string | null
  username: string | null
  user_role: string | null
  school_id: string | null
  method: string
  path: string
  status_code: number
  duration_ms: number
  ip: string | null
  user_agent: string | null
  error_code: string | null
  error_message: string | null
  created_at: string
}

export interface ActivityLogPage {
  logs: ActivityLogRow[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  method?: string
  search?: string
  from?: string
  to?: string
}

class ActivityLogApiService extends BaseApiService {
  list(filters: ActivityLogFilters = {}): Promise<ActivityLogPage> {
    const params: Record<string, string | number> = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') params[key] = value
    }
    return this.get('/platform/logs', params)
  }

  methods(): Promise<string[]> {
    return this.get('/platform/logs/methods')
  }
}

export const activityLogService = new ActivityLogApiService()
export default activityLogService
