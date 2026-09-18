import { getSessionPersona, getStoredSchoolId, getStoredUserJson } from '@/utils/auth-token'

const REDACT = /password|token|secret|otp|authorization|cookie/i

type StoredUser = {
  id?: string
  school_id?: string | null
  school_name?: string | null
  user_type?: string
  isSuperAdmin?: boolean
  isSystemUser?: boolean
  schools?: Array<{ id?: string; name?: string; name_ar?: string | null; name_en?: string | null }>
}

const PATH_ACTIONS: Array<{ method?: string; test: RegExp; action: string }> = [
  { method: 'POST', test: /^\/attendance(\/bulk)?$/, action: 'start taking attendance' },
  { method: 'GET', test: /^\/attendance\/group\//, action: 'start fetching class attendance' },
  { method: 'GET', test: /^\/attendance\/student\//, action: 'start fetching student attendance' },
  { method: 'GET', test: /^\/attendance/, action: 'start fetching attendance records' },
  { method: 'GET', test: /^\/students\/[^/]+$/, action: 'start fetching student details' },
  { method: 'GET', test: /^\/students\/search/, action: 'start searching students' },
  { method: 'GET', test: /^\/students\/group\//, action: 'start fetching students in a class' },
  { method: 'GET', test: /^\/students\/bus\//, action: 'start fetching students on a bus' },
  { method: 'POST', test: /^\/students\/register$/, action: 'start registering a student' },
  { method: 'POST', test: /^\/students$/, action: 'start creating a student' },
  { method: 'GET', test: /^\/students/, action: 'start fetching students' },
  { method: 'POST', test: /^\/auth\/login$/, action: 'start signing in' },
  { method: 'POST', test: /^\/auth\/change-password$/, action: 'start changing the password' },
  { method: 'POST', test: /^\/auth\/reset-password$/, action: 'start resetting the password' },
  { method: 'POST', test: /^\/auth\/switch-school$/, action: 'start switching school' },
  { method: 'GET', test: /^\/parents\/dashboard/, action: 'start fetching parent dashboard data' },
  { method: 'GET', test: /^\/chat\/groups\/[^/]+\/messages/, action: 'start fetching chat messages' },
  { method: 'GET', test: /^\/chat\/groups$/, action: 'start fetching chat rooms' },
  { method: 'GET', test: /^\/fees\/v2\/students\/[^/]+\/charge-sheet/, action: 'start fetching a student charge sheet' },
  { method: 'POST', test: /^\/fees\/v2\/students\/[^/]+\/payments\/thawani/, action: 'start opening Thawani checkout' },
]

function storedUser(): StoredUser | null {
  try {
    const raw = getStoredUserJson()
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

export function clientActorLabel(): { userId: string; schoolName: string } {
  const u = storedUser()
  const userId = u?.id ? String(u.id) : '-'
  const persona = getSessionPersona()
  if (persona === 'platform' && !getStoredSchoolId()) {
    return { userId, schoolName: 'platform' }
  }
  const schoolId = getStoredSchoolId()
  if (u?.school_name?.trim()) return { userId, schoolName: u.school_name.trim() }
  if (schoolId && u?.schools?.length) {
    const hit = u.schools.find((s) => String(s.id) === schoolId)
    const name = (hit?.name_ar || hit?.name || hit?.name_en || '').trim()
    if (name) return { userId, schoolName: name }
  }
  return { userId, schoolName: '-' }
}

export function clientBizAction(method: string, urlPath: string): string {
  const verb = method.toUpperCase()
  const path = normalizeApiPath(urlPath)
  for (const rule of PATH_ACTIONS) {
    if (rule.method && rule.method !== verb) continue
    if (rule.test.test(path)) return rule.action
  }
  return `start ${verb} ${path}`
}

export function normalizeApiPath(url: string): string {
  const raw = String(url || '')
  const noHash = raw.split('#')[0] || ''
  const pathOnly = noHash.split('?')[0] || ''
  const trimmed = pathOnly.replace(/^https?:\/\/[^/]+/i, '')
  return trimmed.replace(/^\/api(?=\/|$)/, '') || '/'
}

export function criteriaFromUrl(url: string, params?: unknown): string {
  const parts: string[] = []
  const q = String(url || '').split('?')[1]
  if (q) {
    const sp = new URLSearchParams(q)
    sp.forEach((value, key) => {
      if (!value) return
      parts.push(REDACT.test(key) ? `${key}=***` : `${key}=${value.slice(0, 120)}`)
    })
  }
  if (params && typeof params === 'object' && !(params instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value == null || value === '') continue
      if (REDACT.test(key)) {
        parts.push(`${key}=***`)
        continue
      }
      parts.push(`${key}=${String(value).slice(0, 120)}`)
    }
  }
  return parts.length ? `criteria ${parts.join(' ')}` : ''
}

export function resultCountFromData(data: unknown): string {
  if (data == null) return ''
  if (Array.isArray(data)) return `resultCount=${data.length}`
  if (typeof data !== 'object') return ''
  const row = data as Record<string, unknown>
  if (Array.isArray(row.data)) return `resultCount=${row.data.length}`
  if (typeof row.count === 'number') return `resultCount=${row.count}`
  const inner = row.data
  if (inner && typeof inner === 'object') {
    const box = inner as Record<string, unknown>
    if (Array.isArray(box.items)) {
      const total = box.total != null ? ` total=${box.total}` : ''
      return `resultCount=${box.items.length}${total}`
    }
    if (typeof box.total === 'number') return `resultCount=${box.total}`
  }
  return ''
}

export function formatClientBizLine(action: string, extra?: string): string {
  const { userId, schoolName } = clientActorLabel()
  const tail = extra?.trim() ? ` ${extra.trim()}` : ''
  return `****${action}**** user=${userId} school=${schoolName}${tail}`
}

export function shouldSkipClientBizLog(url: string): boolean {
  const path = normalizeApiPath(url)
  return (
    path.startsWith('/health') ||
    path === '/' ||
    path.startsWith('/files/') ||
    path.startsWith('/errors/report')
  )
}
