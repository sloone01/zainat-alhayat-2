import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getApiBaseUrl } from '@/config/public-config'
import { reportApiFailure } from '@/utils/error-reporting'

/** Routes where a 401 should not force redirect to login (public flows). */
const PUBLIC_PATHS = ['/', '/login', '/subscribe', '/student-enrollment', '/for-schools', '/s/']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/s/')
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
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
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
    return response
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const message = error.response?.data?.message
    const requestId = error.response?.data?.requestId || error.response?.headers?.['x-request-id']

    console.error('API Error:', {
      status,
      url,
      message,
      requestId,
      fullError: error.response?.data,
    })

    // Avoid feedback loop if the report endpoint itself fails
    const isReportCall = typeof url === 'string' && url.includes('/errors/report')
    if (!isReportCall) {
      reportApiFailure(error)
    }

    if (status === 401) {
      console.warn('401 Unauthorized - clearing auth and redirecting to login')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      if (!isPublicPath(window.location.pathname)) {
        window.location.href = '/login'
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

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
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
