import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl } from '@/config/public-config'
import { reportApiFailure } from '@/utils/error-reporting'
import {
  getStoredSchoolId,
  getStoredToken,
  isSchoolIdUuid,
  isTokenExpired,
  isTokenExpiringSoon,
  setStoredAuth,
} from '@/utils/auth-token'
import {
  goToUnauthorizedPage,
  isAuthCredentialUrl,
  isPublicAppPath,
  showSystemErrorOverlay,
  SYSTEM_ERROR_PATH,
} from '@/utils/error-pages'

/** School staff are scoped from the JWT. Do not send client `school_id`. */
function stripClientSchoolId(config: InternalAxiosRequestConfig): void {
  const boundToToken = Boolean(getStoredSchoolId())
  const drop = (raw: unknown): boolean =>
    boundToToken || raw == null || String(raw).trim() === '' || !isSchoolIdUuid(raw)

  const params = config.params as Record<string, unknown> | URLSearchParams | undefined
  if (params instanceof URLSearchParams) {
    if (params.has('school_id') && drop(params.get('school_id'))) params.delete('school_id')
  } else if (params && typeof params === 'object' && 'school_id' in params && drop(params.school_id)) {
    delete params.school_id
  }

  if (typeof config.url === 'string' && config.url.includes('school_id=')) {
    const q = config.url.indexOf('?')
    if (q >= 0) {
      const path = config.url.slice(0, q)
      const rest = config.url.slice(q + 1)
      const hashAt = rest.indexOf('#')
      const search = hashAt >= 0 ? rest.slice(0, hashAt) : rest
      const hash = hashAt >= 0 ? rest.slice(hashAt) : ''
      const sp = new URLSearchParams(search)
      if (sp.has('school_id') && drop(sp.get('school_id'))) {
        sp.delete('school_id')
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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
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
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const status = error.response?.status as number | undefined
    const url = error.config?.url as string | undefined
    const message = error.response?.data?.message
    const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id']
    const ticket = error.response?.data?.ticket as string | undefined
    const original = error.config as RetryConfig | undefined

    console.error('API Error:', {
      status,
      url,
      message,
      requestId,
      ticket,
      fullError: error.response?.data,
    })

    const isReportCall = typeof url === 'string' && url.includes('/errors/report')

    if (status === 401 && original && !original._authRetry && !isAuthCredentialUrl(url)) {
      original._authRetry = true
      const nextToken = await queuedRefresh().catch(() => null)
      if (nextToken) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${nextToken}`
        return apiClient(original)
      }
      if (sessionIsGone()) {
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

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data)
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
