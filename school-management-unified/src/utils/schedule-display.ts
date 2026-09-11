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

/** Parse `HH:mm` to minutes from midnight. */
export function hmToMinutes(hm: string | null | undefined): number {
  const raw = toScheduleHm(hm)
  if (!raw || !raw.includes(':')) return NaN
  const [h, m] = raw.split(':').map((n) => Number(n))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

/** Format minutes-from-midnight as `HH:mm`. */
export function minutesToHm(total: number): string {
  const normalized = ((Math.round(total) % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addMinutesToHm(hm: string, deltaMinutes: number): string {
  return minutesToHm(hmToMinutes(hm) + deltaMinutes)
}

export function courseMatchesGroupLevel(
  courseLevelId: string | null | undefined,
  groupLevelId: string | null | undefined,
  keepCourseId?: string | null,
  courseId?: string | null,
): boolean {
  if (keepCourseId && courseId && String(keepCourseId) === String(courseId)) return true
  const groupLevel = String(groupLevelId || '').trim()
  if (!groupLevel) return true
  const courseLevel = String(courseLevelId || '').trim()
  if (!courseLevel) return true
  return courseLevel === groupLevel
}

export function sessionDurationMinutes(startHm: string, endHm: string): number {
  const start = hmToMinutes(startHm)
  const end = hmToMinutes(endHm)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0
  return Math.max(0, end - start)
}

