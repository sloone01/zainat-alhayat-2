/** Normalize backend day_of_week values to UI grid keys (sunday…saturday). */
export function normalizeScheduleDayKey(rawDay: string | null | undefined): string {
  if (!rawDay) return ''

  const value = String(rawDay).trim().toLowerCase()
  const map: Record<string, string> = {
    sunday: 'sunday',
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sun: 'sunday',
    mon: 'monday',
    tue: 'tuesday',
    tues: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    thur: 'thursday',
    thurs: 'thursday',
    fri: 'friday',
    sat: 'saturday',
    '0': 'sunday',
    '1': 'monday',
    '2': 'tuesday',
    '3': 'wednesday',
    '4': 'thursday',
    '5': 'friday',
    '6': 'saturday',
    الأحد: 'sunday',
    الاحد: 'sunday',
    الإثنين: 'monday',
    الاثنين: 'monday',
    الثلاثاء: 'tuesday',
    الأربعاء: 'wednesday',
    الاربعاء: 'wednesday',
    الخميس: 'thursday',
    الجمعة: 'friday',
    السبت: 'saturday',
  }

  return map[value] || map[String(rawDay).trim()] || ''
}

export function toScheduleHm(time: string | null | undefined): string {
  if (typeof time !== 'string' || !time) return ''
  return time.length >= 5 ? time.substring(0, 5) : time
}

export function teacherDisplayName(teacher: any | null | undefined, fallback = '—'): string {
  if (!teacher) return fallback
  if (teacher.fullName) return String(teacher.fullName).trim() || fallback
  const first = teacher.firstName || teacher.first_name || ''
  const last = teacher.lastName || teacher.last_name || ''
  const full = `${first} ${last}`.trim()
  return full || fallback
}

export function courseDisplayName(course: any | null | undefined, fallback = '—'): string {
  if (!course) return fallback
  const name = (course.name || course.title || '').trim()
  return name || fallback
}

const ROOM_NOTE_PREFIX = '__ROOM__:'

export function encodeScheduleNotes(room: string | null | undefined, notes: string | null | undefined): string {
  const cleanNotes = String(notes || '').replace(new RegExp(`^${ROOM_NOTE_PREFIX}[^\\n]*\\n?`), '')
  const roomName = String(room || '').trim()
  if (!roomName) return cleanNotes
  return `${ROOM_NOTE_PREFIX}${roomName}\n${cleanNotes}`
}

export function decodeScheduleNotes(rawNotes: string | null | undefined): { room: string; notes: string } {
  const text = String(rawNotes || '')
  const match = text.match(new RegExp(`^${ROOM_NOTE_PREFIX}([^\\n]*)\\n?([\\s\\S]*)$`))
  if (match) {
    return { room: match[1].trim(), notes: match[2] || '' }
  }
  return { room: '', notes: text }
}
