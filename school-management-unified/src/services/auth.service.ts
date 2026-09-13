import { BaseApiService } from './api'
import axios from 'axios'
import { resetClaims } from '@/composables/useClaims'
import { resetSchoolBrand } from '@/composables/useSchoolBrand'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUserJson,
  isTokenExpired,
  setStoredAuth,
} from '@/utils/auth-token'

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
  school_id: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface StaffSchool {
  id: string
  name: string
  name_ar?: string | null
  name_en?: string | null
  status?: string | null
}

/** School-less parent persona, or a staff membership at one school. */
export type SessionAccount =
  | { kind: 'parent' }
  | {
      kind: 'staff'
      id: string
      name: string
      name_ar?: string | null
      name_en?: string | null
      status?: string | null
    }

export interface SessionContexts {
  schools: StaffSchool[]
  has_parent_access: boolean
  accounts: SessionAccount[]
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  school_id: string | null
  school_name?: string
  school_status?: string | null
  isActive: boolean
  lastLogin?: Date
  createdAt?: Date
  isSystemUser?: boolean
  isSuperAdmin?: boolean
  user_type?: string
  schools?: StaffSchool[]
  has_parent_access?: boolean
  accounts?: SessionAccount[]
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

      setStoredAuth(response.access_token, response.user)

      return response
    } catch (error: any) {
      // Enhanced error handling to distinguish between different types of errors
      throw this.processAuthError(error)
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', userData)

    setStoredAuth(response.access_token, response.user)

    return response
  }

  async logout(): Promise<void> {
    clearStoredAuth()
    // Module-cached per-user state must not leak into the next session.
    resetClaims()
    resetSchoolBrand()
  }

  async getProfile(): Promise<User> {
    return await this.get<User>('/auth/profile')
  }

  async getStaffSchools(): Promise<SessionContexts> {
    const data = await this.get<SessionContexts | StaffSchool[]>('/auth/schools')
    if (Array.isArray(data)) {
      return {
        schools: data,
        has_parent_access: false,
        accounts: data.map((s) => ({ kind: 'staff' as const, ...s })),
      }
    }
    const schools = Array.isArray(data?.schools) ? data.schools : []
    const has_parent_access = Boolean(data?.has_parent_access)
    const accounts = Array.isArray(data?.accounts)
      ? data.accounts
      : [
          ...(has_parent_access ? [{ kind: 'parent' as const }] : []),
          ...schools.map((s) => ({ kind: 'staff' as const, ...s })),
        ]
    return { schools, has_parent_access, accounts }
  }

  async switchSchool(schoolId: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/switch-school', { school_id: schoolId })
    setStoredAuth(response.access_token, response.user)
    return response
  }

  async switchToParent(): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/switch-school', { persona: 'parent' })
    setStoredAuth(response.access_token, response.user)
    return response
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/refresh')

    setStoredAuth(response.access_token, response.user)

    return response
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await this.patch('/auth/change-password', passwordData)
  }

  async resetPassword(email: string): Promise<void> {
    await this.post('/auth/reset-password', { email })
  }

  /**
   * Local expiry check only. A network round-trip on every route used to log
   * people out on timeouts / 5xx while they were still using the app.
   */
  async verifyToken(): Promise<boolean> {
    const token = getStoredToken()
    if (!token || isTokenExpired(token)) {
      await this.logout()
      return false
    }
    return true
  }

  getStoredUser(): User | null {
    const userData = getStoredUserJson()
    return userData ? JSON.parse(userData) : null
  }

  getStoredToken(): string | null {
    return getStoredToken()
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
      return { type: 'network', message: '', code: 'NETWORK_ERROR' }
    }

    // Check HTTP status codes
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401: {
          const msg = String(data?.message || '')
          let code = 'INVALID_CREDENTIALS'
          if (/pending approval/i.test(msg)) code = 'SCHOOL_PENDING'
          else if (/suspended/i.test(msg)) code = 'SCHOOL_SUSPENDED'
          else if (/not approved/i.test(msg)) code = 'SCHOOL_REJECTED'
          else if (/deactivated/i.test(msg)) code = 'ACCOUNT_INACTIVE'
          return { type: 'authentication', message: msg, code }
        }
        case 400:
          return {
            type: 'validation',
            message: String(data?.message || ''),
            code: 'VALIDATION_ERROR',
          }
        case 403:
          return {
            type: 'authentication',
            message: String(data?.message || ''),
            code: 'ACCESS_DENIED',
          }
        case 422:
          return {
            type: 'validation',
            message: String(data?.message || ''),
            code: 'UNPROCESSABLE_ENTITY',
          }
        case 429:
          return { type: 'server', message: '', code: 'RATE_LIMITED' }
        case 500:
        case 502:
        case 503:
        case 504:
          return { type: 'server', message: '', code: 'SERVER_ERROR' }
        default:
          return {
            type: 'server',
            message: String(data?.message || ''),
            code: 'UNKNOWN_ERROR',
          }
      }
    }

    // Fallback for other types of errors
    return { type: 'server', message: '', code: 'GENERIC_ERROR' }
  }
}

export const authService = new AuthService()
export default authService

