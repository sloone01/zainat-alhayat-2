import { BaseApiService } from './api'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  phone?: string
  mobile?: string
  address?: string
  dateOfBirth?: string
  isActive: boolean
  status?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
  roles?: string[] | string  // Can be array or comma-separated string from backend
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  roles?: string
  phone?: string
  address?: string
  dateOfBirth?: Date
  isActive?: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: 'admin' | 'teacher' | 'student' | 'parent'
  roles?: string
  phone?: string
  address?: string
  dateOfBirth?: Date
  isActive?: boolean
}

class UserService extends BaseApiService {
  async getAllUsers(): Promise<User[]> {
    const users = await this.get<User[]>('/users')
    return users.map(user => {
      // Process roles: prioritize comma-separated roles field, fallback to single role
      const processedRoles = user.roles 
        ? (Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(r => r.trim()))
        : [user.role]
      
      return {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        mobile: user.phone || '',
        status: user.isActive ? 'active' : 'inactive',
        roles: processedRoles
      }
    })
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.get<User>(`/users/${id}`)
    const processedRoles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(r => r.trim()))
      : [user.role]
    
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: processedRoles
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const user = await this.post<User>('/users', userData)
    const processedRoles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(r => r.trim()))
      : [user.role]
    
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: processedRoles
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const user = await this.patch<User>(`/users/${id}`, userData)
    const processedRoles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(r => r.trim()))
      : [user.role]
    
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: processedRoles
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(`/users/${id}`)
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const users = await this.get<User[]>(`/users/role/${role}`)
    return users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: [user.role]
    }))
  }

  async searchUsers(query: string): Promise<User[]> {
    const users = await this.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`)
    return users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: [user.role]
    }))
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.patch<User>(`/users/${id}/toggle-active`)
    const processedRoles = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : user.roles.split(',').map(r => r.trim()))
      : [user.role]
    
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      mobile: user.phone || '',
      status: user.isActive ? 'active' : 'inactive',
      roles: processedRoles
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.patch(`/users/${id}/password`, { newPassword })
  }
}

const userService = new UserService()
export default userService