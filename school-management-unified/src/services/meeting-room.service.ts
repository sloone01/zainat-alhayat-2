import { BaseApiService } from './api'

export interface CreateMeetingRoomInvite {
  allParents?: boolean
  allTeachers?: boolean
  allStudents?: boolean
  groupIds?: string[]
  userIds?: string[]
}

export interface CreateMeetingRoomPayload {
  school_id?: string
  title: string
  /** ISO 8601 instant for meeting start */
  scheduled_at?: string
  save_as_draft?: boolean
  invite: CreateMeetingRoomInvite
}

export type MeetingRoomStatus = 'draft' | 'scheduled'

export interface MeetingRoomCreated {
  id: string
  school_id: string
  title: string
  status?: MeetingRoomStatus
  invite_spec?: CreateMeetingRoomInvite | null
  room_url: string | null
  room_name: string | null
  invitee_count: number
  scheduled_at?: string | null
  created_at?: string
  created_by?: string
}

export interface MeetingRoomListRow {
  id: string
  school_id: string
  title: string
  status?: MeetingRoomStatus
  invite_spec?: CreateMeetingRoomInvite | null
  room_url: string | null
  room_name: string | null
  created_at: string
  /** When the meeting is scheduled to start (may be absent on legacy rows). */
  scheduled_at?: string | null
  opened_at?: string | null
  ended_at?: string | null
  is_open?: boolean
  created_by: string
  invitee_count: number
}

export interface MeetingRoomMineRow {
  id: string
  school_id: string
  title: string
  status?: MeetingRoomStatus
  created_at: string
  scheduled_at?: string | null
  opened_at?: string | null
  ended_at?: string | null
  is_open?: boolean
}

export interface MeetingRoomDetail {
  id: string
  title: string
  status?: MeetingRoomStatus
  room_url: string | null
  room_name: string | null
  school_id: string
  created_at: string
  scheduled_at?: string | null
  opened_at?: string | null
  ended_at?: string | null
  is_open?: boolean
}

export interface MeetingRoomJoinResult {
  token: string
  room_url: string
  meeting_id: string
  is_owner: boolean
}

class MeetingRoomApiService extends BaseApiService {
  async create(payload: CreateMeetingRoomPayload): Promise<MeetingRoomCreated> {
    return this.post<MeetingRoomCreated>('/meeting-rooms', payload)
  }

  async update(id: string, payload: CreateMeetingRoomPayload): Promise<MeetingRoomCreated> {
    return this.patch<MeetingRoomCreated>(`/meeting-rooms/${id}`, payload)
  }

  async list(schoolId: string): Promise<MeetingRoomListRow[]> {
    return this.get<MeetingRoomListRow[]>('/meeting-rooms', { school_id: schoolId })
  }

  async mine(schoolId?: string | null): Promise<MeetingRoomMineRow[]> {
    return this.get<MeetingRoomMineRow[]>(
      '/meeting-rooms/mine',
      schoolId ? { school_id: schoolId } : undefined,
    )
  }

  async getOne(meetingId: string): Promise<MeetingRoomDetail> {
    return this.get<MeetingRoomDetail>(`/meeting-rooms/${meetingId}`)
  }

  async join(meetingId: string): Promise<MeetingRoomJoinResult> {
    return this.post<MeetingRoomJoinResult>(`/meeting-rooms/${meetingId}/join`, {})
  }

  async end(meetingId: string): Promise<{ id: string; ended_at?: string | null; is_open?: boolean }> {
    return this.post(`/meeting-rooms/${meetingId}/end`, {})
  }
}

export const meetingRoomService = new MeetingRoomApiService()
export default meetingRoomService
