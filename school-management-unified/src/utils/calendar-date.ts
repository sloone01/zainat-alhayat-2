export const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number]

export type CalendarEvent = {
  id: string | number
  name: string
  time: string
  datetime?: string
  payload?: unknown
}

export type CalendarDayData = {
  day: Date
  events: CalendarEvent[]
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function startOfToday(): Date {
  return startOfDay(new Date())
}

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDateKey(raw: string | Date | null | undefined): Date | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return startOfDay(raw)
  const part = String(raw || '').split('T')[0]
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(part)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function weekdayKey(date: Date): WeekdayKey {
  return WEEKDAY_KEYS[date.getDay()]
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

export function startOfWeek(date: Date, weekStartsOn = 0): Date {
  const next = startOfDay(date)
  const diff = (next.getDay() - weekStartsOn + 7) % 7
  next.setDate(next.getDate() - diff)
  return next
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function endOfWeek(date: Date, weekStartsOn = 0): Date {
  const start = startOfWeek(date, weekStartsOn)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cursor = startOfDay(start)
  const last = startOfDay(end)
  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function eventsForDay(data: CalendarDayData[], day: Date): CalendarEvent[] {
  return data.filter((entry) => isSameDay(entry.day, day)).flatMap((entry) => entry.events)
}

export function expandWeeklyClassesToMonth(
  items: Array<{ dayKey: string; event: CalendarEvent }>,
  month: Date,
): CalendarDayData[] {
  const byWeekday = new Map<string, CalendarEvent[]>()
  for (const item of items) {
    const key = String(item.dayKey || '').toLowerCase()
    if (!key) continue
    const list = byWeekday.get(key) || []
    list.push(item.event)
    byWeekday.set(key, list)
  }

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const lastDate = endOfMonth(month).getDate()
  const out: CalendarDayData[] = []

  for (let dayNum = 1; dayNum <= lastDate; dayNum += 1) {
    const day = new Date(year, monthIndex, dayNum)
    const events = byWeekday.get(weekdayKey(day)) || []
    if (events.length) out.push({ day, events })
  }

  return out
}

export function dateForWeekdayInWeek(weekStart: string | Date, dayKey: string): Date | null {
  const start =
    weekStart instanceof Date ? startOfDay(weekStart) : parseLocalDateKey(weekStart)
  if (!start) return null
  const idx = WEEKDAY_KEYS.indexOf(String(dayKey || '').toLowerCase() as WeekdayKey)
  if (idx < 0) return null
  const next = new Date(start)
  next.setDate(start.getDate() + idx)
  return next
}

export function groupDatedEvents(items: Array<{ day: Date; event: CalendarEvent }>): CalendarDayData[] {
  const map = new Map<string, CalendarDayData>()
  for (const item of items) {
    const key = dateKey(item.day)
    let bucket = map.get(key)
    if (!bucket) {
      bucket = { day: startOfDay(item.day), events: [] }
      map.set(key, bucket)
    }
    bucket.events.push(item.event)
  }
  return [...map.values()]
}
