import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { Capacitor } from '@capacitor/core'
import { getApiBaseUrl } from '@/config/public-config'
import { reportApiFailure } from '@/utils/error-reporting'
import {
  getSessionPersona,
  getStoredSchoolId,
  getStoredToken,
  isSchoolIdUuid,
  isTokenExpired,
  isTokenExpiringSoon,
  sessionHomePath,
  sessionMustChangePassword,
  setStoredAuth,
} from '@/utils/auth-token'
import {
  goToUnauthorizedPage,
  isAuthCredentialUrl,
  isPublicAppPath,
  showSystemErrorOverlay,
  SYSTEM_ERROR_PATH,
} from '@/utils/error-pages'
import {
  clientBizAction,
  criteriaFromUrl,
  formatClientBizLine,
  resultCountFromData,
  shouldSkipClientBizLog,
} from '@/utils/client-biz-log'

/** School staff are scoped from the JWT. Do not send client `school_id`. */
function isSchoolSwitchRequest(config: InternalAxiosRequestConfig): boolean {
  const url = String(config.url || '')
  return /\/auth\/switch-school(?:\?|$)/.test(url)
}

function stripClientSchoolId(config: InternalAxiosRequestConfig): void {
  // Switch-school must send the target school; stripping it yields 400.
  if (isSchoolSwitchRequest(config)) return

  const boundToToken = Boolean(getStoredSchoolId())
  const drop = (raw: unknown): boolean =>
    boundToToken || raw == null || String(raw).trim() === '' || !isSchoolIdUuid(raw)

  const params = config.params as Record<string, unknown> | URLSearchParams | undefined
  if (params instanceof URLSearchParams) {
    if (params.has('school_id') && drop(params.get('school_id'))) params.delete('school_id')
    if (params.has('schoolId') && drop(params.get('schoolId'))) params.delete('schoolId')
  } else if (params && typeof params === 'object') {
    if ('school_id' in params && drop(params.school_id)) delete params.school_id
    if ('schoolId' in params && drop(params.schoolId)) delete params.schoolId
  }

  if (typeof config.url === 'string' && (config.url.includes('school_id=') || config.url.includes('schoolId='))) {
    const q = config.url.indexOf('?')
    if (q >= 0) {
      const path = config.url.slice(0, q)
      const rest = config.url.slice(q + 1)
      const hashAt = rest.indexOf('#')
      const search = hashAt >= 0 ? rest.slice(0, hashAt) : rest
      const hash = hashAt >= 0 ? rest.slice(hashAt) : ''
      const sp = new URLSearchParams(search)
      let changed = false
      if (sp.has('school_id') && drop(sp.get('school_id'))) {
        sp.delete('school_id')
        changed = true
      }
      if (sp.has('schoolId') && drop(sp.get('schoolId'))) {
        sp.delete('schoolId')
        changed = true
      }
      if (changed) {
        const next = sp.toString()
        config.url = next ? `${path}?${next}${hash}` : `${path}${hash}`
      }
    }
  }

  const data = config.data as unknown
  if (data instanceof FormData) {
    if (data.has('school_id') && drop(data.get('school_id'))) data.delete('school_id')
  } else if (data && typeof data === 'object' && !Array.isArray(data) && 'school_id' in data) {
    const rec = data as Record<string, unknown>
    if (drop(rec.school_id)) delete rec.school_id
  }
}

type RetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean }

const refreshClient = axios.create({ timeout: 15000 })
let refreshInFlight: Promise<string | null> | null = null
let errorPageNavAt = 0

async function refreshAccessToken(): Promise<string | null> {
  const token = getStoredToken()
  if (!token) return null
  const { data } = await refreshClient.post(
    `${getApiBaseUrl().replace(/\/$/, '')}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const access = data?.data?.access_token as string | undefined
  if (!access) return null
  setStoredAuth(access, data.data.user)
  return access
}

function queuedRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

function isSchoolContextError(status?: number, message?: unknown): boolean {
  if (status !== 400 && status !== 403) return false
  const text = Array.isArray(message) ? message.join(' ') : String(message || '')
  return /school_id is required|School context required/i.test(text)
}

let contextHomeAt = 0

/** Wrong persona / no school: go home. Do not stay on a 400 loop, and do not logout. */
function maybeGoToChangePassword(): boolean {
  if (typeof window === 'undefined') return false
  if (!sessionMustChangePassword()) return false
  if (window.location.pathname === '/change-password') return true
  window.location.assign('/change-password')
  return true
}

function maybeGoToSessionHome(): void {
  if (typeof window === 'undefined') return
  if (maybeGoToChangePassword()) return
  const dest = sessionHomePath()
  if (!dest || window.location.pathname === dest) return
  const now = Date.now()
  if (now - contextHomeAt < 2000) return
  contextHomeAt = now
  window.location.assign(dest)
}

function maybeOpenErrorPage(ticket?: string | null): void {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (path === SYSTEM_ERROR_PATH) return
  // Public marketing/signup flows must stay on-page (show inline errors), never open /error.
  if (isPublicAppPath(path)) return
  const now = Date.now()
  if (now - errorPageNavAt < 2000) {
    if (ticket) showSystemErrorOverlay(ticket)
    return
  }
  errorPageNavAt = now
  showSystemErrorOverlay(ticket)
}

function sessionIsGone(): boolean {
  const token = getStoredToken()
  return !token || isTokenExpired(token, 0)
}

// Create axios instance (baseURL resolved per request start via adapter — set below)
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  // Native phones on cellular/Wi‑Fi often need longer than desktop SPA defaults.
  timeout: (() => {
    try {
      return Capacitor.isNativePlatform() ? 30000 : 10000
    } catch {
      return 10000
    }
  })(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl()
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    let token = getStoredToken()
    if (token && isTokenExpiringSoon(token)) {
      try {
        token = (await queuedRefresh()) || token
      } catch {
        // Keep the current token; a 401 handler may still refresh.
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    stripClientSchoolId(config)
    if (isAuthCredentialUrl(String(config.url || '')) && config.data && typeof config.data === 'object' && !Array.isArray(config.data) && !(config.data instanceof FormData)) {
      delete (config.data as Record<string, unknown>).school_id
      delete (config.data as Record<string, unknown>).schoolId
    }
    const url = String(config.url || '')
    if (!shouldSkipClientBizLog(url)) {
      const existingId = config.headers?.['X-Request-Id']
      const requestId =
        typeof existingId === 'string' && existingId.trim()
          ? existingId.trim()
          : typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      config.headers = config.headers || {}
      config.headers['X-Request-Id'] = requestId
      const method = String(config.method || 'get').toUpperCase()
      const action = clientBizAction(method, url)
      const criteria = criteriaFromUrl(url, config.params)
      console.info(formatClientBizLine(action, `${criteria} req=${requestId}`.trim()))
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = String(response.config?.url || '')
    if (!shouldSkipClientBizLog(url)) {
      const requestId =
        response.headers?.['x-request-id'] ||
        response.data?.requestId ||
        response.config.headers?.['X-Request-Id']
      const count = resultCountFromData(response.data)
      const method = String(response.config?.method || 'get').toUpperCase()
      console.info(
        formatClientBizLine(
          `${clientBizAction(method, url)} done`,
          `${count} status=${response.status} req=${requestId || '-'}`.trim(),
        ),
      )
    }
    return response
  },
  async (error) => {
    const status = error.response?.status as number | undefined
    const url = error.config?.url as string | undefined
    const message = error.response?.data?.message
    const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id']
    const ticket = error.response?.data?.ticket as string | undefined
    const original = error.config as RetryConfig | undefined

    if (url && !shouldSkipClientBizLog(url)) {
      const claimFail =
        status === 403 && /Missing claim|Missing one of/i.test(String(message || ''))
      console.warn(
        formatClientBizLine(
          claimFail ? 'claim denied' : 'request failed',
          `status=${status || 'network'} url=${url} req=${requestId || '-'}`,
        ),
      )
    }

    const isReportCall = typeof url === 'string' && url.includes('/errors/report')

    if (status === 403 && /Password change required/i.test(String(message))) {
      maybeGoToChangePassword()
      return Promise.reject(error)
    }

    if (status === 401 && original && !original._authRetry && !isAuthCredentialUrl(url)) {
      original._authRetry = true
      const nextToken = await queuedRefresh().catch(() => null)
      if (nextToken) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${nextToken}`
        return apiClient(original)
      }
      if (sessionIsGone() && !isPublicAppPath(window.location.pathname)) {
        goToUnauthorizedPage()
      }
      return Promise.reject(error)
    }

    if (status === 401 && !isAuthCredentialUrl(url) && !isPublicAppPath(window.location.pathname)) {
      if (sessionIsGone()) {
        goToUnauthorizedPage()
      }
      return Promise.reject(error)
    }

    if (
      isSchoolContextError(status, message) &&
      !isAuthCredentialUrl(url) &&
      !isPublicAppPath(window.location.pathname)
    ) {
      const persona = getSessionPersona()
      if (persona === 'staff' && !getStoredSchoolId()) {
        goToUnauthorizedPage()
      } else {
        maybeGoToSessionHome()
      }
      return Promise.reject(error)
    }

    if (!isReportCall && !isAuthCredentialUrl(url)) {
      if (status != null && status >= 500) {
        maybeOpenErrorPage(ticket)
      } else if (!error.response) {
        const opened = await reportApiFailure(error)
        maybeOpenErrorPage(opened)
      }
    }

    return Promise.reject(error)
  }
)

// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  count?: number
  requestId?: string
  ticket?: string
  statusCode?: number
}

// Base API service class
export class BaseApiService {
  protected client = apiClient

  protected async handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> {
    if (response.data.success) {
      return response.data.data as T
    } else {
      const errorMessage = response.data.message || 'API request failed'
      const errorType = response.data.error || 'UNKNOWN_ERROR'

      console.error(`API Error [${errorType}]:`, errorMessage)

      const error = new Error(errorMessage)
      error.name = errorType
      throw error
    }
  }

  protected async get<T>(url: string, params?: any, config?: object): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params, ...config })
    return this.handleResponse(response)
  }

  protected async post<T>(url: string, data?: any, config?: object): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  protected async put<T>(url: string, data?: any, config?: object): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return this.handleResponse(response)
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data)
    return this.handleResponse(response)
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url)
    // Nest often uses 204 No Content for DELETE — body is empty, so skip JSON envelope check
    const { status, data } = response
    if (status === 204 || data === '' || data == null) {
      return undefined as T
    }
    return this.handleResponse(response)
  }

  protected async upload<T>(url: string, formData: FormData, timeoutMs = 120000): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, { timeout: timeoutMs })
    return this.handleResponse(response)
  }
}

export { apiClient }
export default apiClient
