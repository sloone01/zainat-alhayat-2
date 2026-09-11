import { isMeetingScheduledPast } from '@/utils/meeting-datetime'

/** Staff (admin/teacher) may start a meeting; parents/students only join after it is open. */
export function isMeetingStaffHost(user?: {
  user_type?: string | null
  role?: string | null
} | null): boolean {
  if (!user) return false
  if (user.user_type === 'parent' || user.user_type === 'student') return false
  if (user.role === 'parent' || user.role === 'student') return false
  return user.user_type === 'staff' || user.role === 'admin' || user.role === 'teacher'
}

export function isMeetingOpen(room: {
  is_open?: boolean
  opened_at?: string | null
  ended_at?: string | null
}): boolean {
  if (room.ended_at) return false
  if (room.is_open === false) return false
  return Boolean(room.is_open || room.opened_at)
}

export type MeetingRoomPresence = 'draft' | 'live' | 'waiting' | 'expired'

/** Badge for list cards: past scheduled time wins over stale “live”. */
export function meetingRoomPresence(room: {
  status?: string | null
  scheduled_at?: string | null
  created_at?: string
  is_open?: boolean
  opened_at?: string | null
  ended_at?: string | null
}): MeetingRoomPresence {
  if (room.status === 'draft') return 'draft'
  const when = room.scheduled_at ?? room.created_at
  const past = isMeetingScheduledPast(when)
  if (past) return 'expired'
  if (isMeetingOpen(room)) return 'live'
  return 'waiting'
}

/** Non-staff invitees may join only while the host has the room open (and not expired). */
export function canInviteeJoinMeeting(room: {
  status?: string | null
  scheduled_at?: string | null
  created_at?: string
  is_open?: boolean
  opened_at?: string | null
  ended_at?: string | null
}): boolean {
  return meetingRoomPresence(room) === 'live'
}
