import { BaseApiService } from './api'
import axios from 'axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  phone?: string
  school_id: number
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  school_id: number
  school_name?: string
  isActive: boolean
  lastLogin?: Date
  createdAt?: Date
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface AuthError {
  type: 'network' | 'authentication' | 'validation' | 'server'
  message: string
  code?: string
}

class AuthService extends BaseApiService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/login', credentials)

      // Store token and user data
      localStorage.setItem('auth_token', response.access_token)
      localStorage.setItem('user_data', JSON.stringify(response.user))

      return response
    } catch (error: any) {
      // Enhanced error handling to distinguish between different types of errors
      throw this.processAuthError(error)
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', userData)

    // Store token and user data
    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('user_data', JSON.stringify(response.user))

    return response
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  async getProfile(): Promise<User> {
    return await this.get<User>('/auth/profile')
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/refresh')

    // Update stored token and user data
    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('user_data', JSON.stringify(response.user))

    return response
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await this.patch('/auth/change-password', passwordData)
  }

  async resetPassword(email: string): Promise<void> {
    await this.post('/auth/reset-password', { email })
  }

  async verifyToken(): Promise<boolean> {
    try {
      await this.get('/auth/verify')
      return true
    } catch (error) {
      console.log('JWT verification failed')
      return false
    }
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  }


  hasRole(role: string): boolean {
    const user = this.getStoredUser()
    return user?.role === role
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getStoredUser()
    return user ? roles.includes(user.role) : false
  }

  private processAuthError(error: any): AuthError {
    // Check if it's a network error (no response)
    if (axios.isAxiosError(error) && !error.response) {
      return {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      }
    }

    // Check HTTP status codes
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          return {
            type: 'authentication',
            message: data?.message || 'Invalid email or password. Please check your credentials.',
            code: 'INVALID_CREDENTIALS'
          }
        case 400:
          return {
            type: 'validation',
            message: data?.message || 'Please check your input and try again.',
            code: 'VALIDATION_ERROR'
          }
        case 403:
          return {
            type: 'authentication',
            message: data?.message || 'Access denied. Your account may be inactive.',
            code: 'ACCESS_DENIED'
          }
        case 422:
          return {
            type: 'validation',
            message: data?.message || 'Invalid data format. Please check your input.',
            code: 'UNPROCESSABLE_ENTITY'
          }
        case 429:
          return {
            type: 'server',
            message: 'Too many login attempts. Please try again later.',
            code: 'RATE_LIMITED'
          }
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'server',
            message: 'Server error. Please try again later or contact support.',
            code: 'SERVER_ERROR'
          }
        default:
          return {
            type: 'server',
            message: data?.message || 'An unexpected error occurred. Please try again.',
            code: 'UNKNOWN_ERROR'
          }
      }
    }

    // Fallback for other types of errors
    return {
      type: 'server',
      message: error.message || 'An unexpected error occurred. Please try again.',
      code: 'GENERIC_ERROR'
    }
  }
}

export const authService = new AuthService()
export default authService

