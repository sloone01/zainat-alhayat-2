import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getApiBaseUrl } from '@/config/public-config'

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
    console.log('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message,
      fullError: error.response?.data
    })

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth and redirecting to login')
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')

      // Only redirect if we're not already on the login page or landing page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/subscribe') {
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
}

// Base API service class
export class BaseApiService {
  protected client = apiClient

  protected async handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> {
    if (response.data.success) {
      return response.data.data as T
    } else {
      // Handle database errors specifically
      const errorMessage = response.data.message || 'API request failed'
      const errorType = response.data.error || 'UNKNOWN_ERROR'

      console.error(`API Error [${errorType}]:`, errorMessage)

      // Create a more descriptive error
      const error = new Error(errorMessage)
      error.name = errorType
      throw error
    }
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
    return this.handleResponse(response)
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data)
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

