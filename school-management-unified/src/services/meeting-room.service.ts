import { BaseApiService } from './api'

export interface CreateMeetingRoomInvite {
  allParents?: boolean
  allTeachers?: boolean
  allStudents?: boolean
  groupIds?: string[]
  userIds?: string[]
}

export interface CreateMeetingRoomPayload {
  school_id: number
  title: string
  /** ISO 8601 instant for meeting start */
  scheduled_at: string
  invite: CreateMeetingRoomInvite
}

export interface MeetingRoomCreated {
  id: string
  school_id: number
  title: string
  room_url: string
  room_name: string
  invitee_count: number
  scheduled_at?: string
}

export interface MeetingRoomListRow {
  id: string
  school_id: number
  title: string
  room_url: string
  room_name: string
  created_at: string
  /** When the meeting is scheduled to start (may be absent on legacy rows). */
  scheduled_at?: string | null
  created_by: string
  invitee_count: number
}

export interface MeetingRoomMineRow {
  id: string
  school_id: number
  title: string
  created_at: string
  scheduled_at?: string | null
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

  async list(schoolId: number): Promise<MeetingRoomListRow[]> {
    return this.get<MeetingRoomListRow[]>('/meeting-rooms', { school_id: schoolId })
  }

  async mine(schoolId: number): Promise<MeetingRoomMineRow[]> {
    return this.get<MeetingRoomMineRow[]>('/meeting-rooms/mine', { school_id: schoolId })
  }

  async join(meetingId: string): Promise<MeetingRoomJoinResult> {
    return this.post<MeetingRoomJoinResult>(`/meeting-rooms/${meetingId}/join`, {})
  }
}

export const meetingRoomService = new MeetingRoomApiService()
export default meetingRoomService
