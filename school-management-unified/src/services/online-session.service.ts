import { BaseApiService } from './api'

export interface OnlineSessionSummary {
  id: string
  schedule_id: string
  week_start_date: string
  session_date: string
  room_url: string
  room_name: string
}

export interface CreateOnlineSessionResult {
  created: boolean
  session: OnlineSessionSummary
  token: string
  room_url: string
  session_id: string
  is_owner: boolean
}

export interface JoinOnlineSessionResult {
  token: string
  room_url: string
  session_id: string
  is_owner: boolean
}

export interface ResolveOnlineSessionResult {
  session: OnlineSessionSummary | null
}

export interface SessionAttendanceRecordRow {
  id: string
  session_date: string
  week_start_date: string
  schedule_id: string
  group_id: string | null
  group_name: string | null
  course_name: string | null
  day_of_week: string | null
  start_time: string | null
  end_time: string | null
  teacher_name: string | null
  attendance_finalized: boolean
  presence_join_count: number
  student_record_count: number
  attended_count: number
  not_attended_count: number
  pending_count: number
}

class OnlineSessionApiService extends BaseApiService {
  async createOrGet(payload: {
    schedule_id: string
    week_start_date: string
  }): Promise<CreateOnlineSessionResult> {
    return this.post<CreateOnlineSessionResult>('/online-sessions', payload)
  }

  async join(sessionId: string): Promise<JoinOnlineSessionResult> {
    return this.post<JoinOnlineSessionResult>(`/online-sessions/${sessionId}/join`, {})
  }

  async listAttendanceRecords(params?: {
    school_id?: number
    group_id?: string
    from_date?: string
    to_date?: string
  }): Promise<SessionAttendanceRecordRow[]> {
    return this.get<SessionAttendanceRecordRow[]>('/online-sessions/attendance-records', params)
  }

  async resolve(scheduleId: string, weekStart: string): Promise<ResolveOnlineSessionResult> {
    return this.get<ResolveOnlineSessionResult>('/online-sessions/resolve', {
      schedule_id: scheduleId,
      week_start_date: weekStart,
    })
  }

  async attendance(sessionId: string) {
    return this.get<
      Array<{
        id: string
        user_id: string
        display_name: string | null
        joined_at: string
        left_at: string | null
        email?: string
        role?: string
      }>
    >(`/online-sessions/${sessionId}/attendance`)
  }

  /** Per-student attended/not_attended for this video session only (not daily attendance) */
  async studentAttendance(sessionId: string) {
    return this.get<
      Array<{
        id: string
        student_id: string
        status: string
        student_name: string | null
        updated_at: string
      }>
    >(`/online-sessions/${sessionId}/student-attendance`)
  }

  async presence(sessionId: string, action: 'join' | 'leave') {
    return this.post<{ ok: boolean }>(`/online-sessions/${sessionId}/presence`, { action })
  }
}

export const onlineSessionService = new OnlineSessionApiService()
