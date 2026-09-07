import { getApiBaseUrl } from '@/config/public-config'

export type ClientErrorReport = {
  message: string
  stack?: string
  url?: string
  userAgent?: string
  component?: string
  extra?: Record<string, unknown>
}

/** Extract a user-facing message from Axios / Error / unknown. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback
  if (typeof error === 'string' && error.trim()) return error

  const anyErr = error as {
    message?: string
    name?: string
    response?: { data?: { message?: string | string[]; error?: string } }
  }

  const apiMsg = anyErr?.response?.data?.message
  if (Array.isArray(apiMsg) && apiMsg.length) return apiMsg.map(String).join('; ')
  if (typeof apiMsg === 'string' && apiMsg.trim()) return apiMsg

  if (typeof anyErr?.message === 'string' && anyErr.message.trim()) return anyErr.message
  return fallback
}

function readStoredUserSnippet(): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return undefined
    const u = JSON.parse(raw) as Record<string, unknown>
    return {
      id: u.id ?? u.sub,
      email: u.email,
      role: u.role,
      user_type: u.user_type,
      school_id: u.school_id ?? u.schoolId,
    }
  } catch {
    return undefined
  }
}

let lastReportKey = ''
let lastReportAt = 0

/**
 * Report a client-side error to the API (which emails ops when configured).
 * Fire-and-forget; never throws. Dedupes identical messages for 60s.
 */
export function reportClientError(error: unknown, context?: Partial<ClientErrorReport>): void {
  try {
    const message = (context?.message || getErrorMessage(error, 'Client error')).slice(0, 2000)
    const stack =
      context?.stack ||
      (error instanceof Error ? error.stack : undefined) ||
      (typeof (error as { stack?: string })?.stack === 'string'
        ? (error as { stack: string }).stack
        : undefined)

    const payload: ClientErrorReport = {
      message,
      stack: stack?.slice(0, 20000),
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent:
        context?.userAgent ||
        (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      component: context?.component,
      extra: {
        ...(context?.extra || {}),
        user: readStoredUserSnippet(),
      },
    }

    const key = `${payload.message}|${payload.url || ''}|${payload.component || ''}`
    const now = Date.now()
    if (key === lastReportKey && now - lastReportAt < 60_000) return
    lastReportKey = key
    lastReportAt = now

    console.error('[client-error]', message, error)

    const base = getApiBaseUrl().replace(/\/$/, '')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('auth_token')
    if (token) headers.Authorization = `Bearer ${token}`

    // Use fetch so a broken axios instance can still report.
    void fetch(`${base}/errors/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* ignore secondary failures */
    })
  } catch {
    /* never break the app from reporting */
  }
}

/** Report network failures from the axios interceptor (API 5xx are emailed server-side). */
export function reportApiFailure(error: unknown): void {
  const anyErr = error as {
    response?: { status?: number; data?: { message?: string; requestId?: string } }
    config?: { method?: string; url?: string; baseURL?: string }
    message?: string
    code?: string
  }
  // Server AllExceptionsFilter already emails 5xx with stack — only report unreachable API here.
  if (anyErr?.response) return

  const isNetwork = Boolean(anyErr?.message || anyErr?.code)
  if (!isNetwork) return

  const method = (anyErr.config?.method || 'GET').toUpperCase()
  const path = anyErr.config?.url || ''
  reportClientError(error, {
    message: anyErr.message || 'API network error',
    component: 'axios',
    extra: {
      method,
      path,
      code: anyErr.code,
    },
  })
}
