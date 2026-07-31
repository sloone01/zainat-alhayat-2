import { BaseApiService } from './api'

export interface RbacAction {
  code: string
  name: string
  sortOrder: number
}

export interface RbacPageCatalog {
  key: string
  route: string
  nameEn: string
  nameAr: string
  scope: 'platform' | 'school' | 'both'
  sortOrder: number
  allowedActions: string[]
}

export interface RbacGroup {
  id: string
  name: string
  description?: string | null
  schoolId?: number | null
  isSystem: boolean
  systemKey?: string | null
  color?: string | null
  clonedFromId?: string | null
  isActive: boolean
  permissions?: Record<string, string[]>
  memberCount?: number
}

export interface RbacUserOverride {
  id?: string
  pageKey: string
  actionCode: string
  effect: 'grant' | 'deny'
}

class RbacService extends BaseApiService {
  async getCatalog(): Promise<{ actions: RbacAction[]; pages: RbacPageCatalog[] }> {
    return this.get('/rbac/catalog')
  }

  async getMyClaims(): Promise<{
    claims: string[]
    permissions: Record<string, string[]>
    isSuperAdmin: boolean
    isSystemUser: boolean
    schoolId: number | null
  }> {
    return this.get('/rbac/me/claims')
  }

  async listGroups(schoolId?: number | null): Promise<RbacGroup[]> {
    const params: Record<string, string> = {}
    if (schoolId === null) params.schoolId = '0'
    else if (schoolId !== undefined) params.schoolId = String(schoolId)
    return this.get('/rbac/groups', params)
  }

  async getGroup(id: string): Promise<RbacGroup> {
    return this.get(`/rbac/groups/${id}`)
  }

  async createGroup(data: {
    name: string
    description?: string
    schoolId?: number | null
    color?: string
  }): Promise<RbacGroup> {
    return this.post('/rbac/groups', data)
  }

  async updateGroup(
    id: string,
    data: { name?: string; description?: string; color?: string; isActive?: boolean },
  ): Promise<RbacGroup> {
    return this.patch(`/rbac/groups/${id}`, data)
  }

  async deleteGroup(id: string): Promise<void> {
    await this.delete(`/rbac/groups/${id}`)
  }

  async cloneGroup(
    id: string,
    data?: { name?: string; schoolId?: number | null },
  ): Promise<RbacGroup> {
    return this.post(`/rbac/groups/${id}/clone`, data || {})
  }

  async setPermissions(
    id: string,
    permissions: { pageKey: string; actions: string[] }[],
  ): Promise<RbacGroup> {
    return this.put(`/rbac/groups/${id}/permissions`, { permissions })
  }

  async assignUser(groupId: string, userId: string): Promise<void> {
    await this.post(`/rbac/groups/${groupId}/members`, { userId })
  }

  async removeUser(groupId: string, userId: string): Promise<void> {
    await this.delete(`/rbac/groups/${groupId}/members/${userId}`)
  }

  async listUserOverrides(userId: string): Promise<RbacUserOverride[]> {
    return this.get(`/rbac/users/${userId}/overrides`)
  }

  async setUserOverrides(userId: string, overrides: RbacUserOverride[]): Promise<RbacUserOverride[]> {
    return this.put(`/rbac/users/${userId}/overrides`, { overrides })
  }

  /** Convenience: does the current session have page:action (from cached map). */
  can(permissions: Record<string, string[]> | undefined, pageKey: string, action: string): boolean {
    return !!permissions?.[pageKey]?.includes(action)
  }
}

export const rbacService = new RbacService()
export default rbacService
