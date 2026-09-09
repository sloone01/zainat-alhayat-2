import { BaseApiService } from './api'

export type ParentRelationship = 'father' | 'mother' | 'guardian'

export interface Parent {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  user_id?: string | null
  tribe?: string | null
  workplace?: string | null
  workPhone?: string | null
  maritalStatus?: string | null
  organizationName?: string | null
  responsiblePerson?: string | null
  responsiblePhone?: string | null
  /** Present when loaded via student (join table) */
  relationship?: ParentRelationship
  createdAt: Date
  updatedAt: Date
  user?: any
  students?: any[]
}

export interface CreateParentRequest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  tribe?: string
  workplace?: string
  workPhone?: string
  maritalStatus?: string
  organizationName?: string
  responsiblePerson?: string
  responsiblePhone?: string
  userId?: number
  studentIds?: string[]
  relationship?: ParentRelationship
}

export interface UpdateParentRequest extends Partial<CreateParentRequest> {}

class ParentService extends BaseApiService {
  async getAll(): Promise<Parent[]> {
    return this.get<Parent[]>('/parents')
  }

  async getById(id: number): Promise<Parent> {
    return this.get<Parent>(`/parents/${id}`)
  }

  async create(parentData: CreateParentRequest): Promise<Parent> {
    return this.post<Parent>('/parents', parentData)
  }

  async update(id: number, parentData: UpdateParentRequest): Promise<Parent> {
    return this.patch<Parent>(`/parents/${id}`, parentData)
  }

  async deleteParent(id: string): Promise<void> {
    await this.delete(`/parents/${id}`)
  }

  async search(query: string): Promise<Parent[]> {
    return this.get<Parent[]>('/parents/search', { q: query })
  }

  async assignToStudent(
    parentId: number,
    studentId: string,
    relationship: ParentRelationship = 'guardian',
  ): Promise<Parent> {
    return this.patch<Parent>(`/parents/${parentId}/assign-student`, {
      studentId,
      relationship,
    })
  }

  async unassignFromStudent(parentId: number, studentId: string): Promise<Parent> {
    return this.patch<Parent>(`/parents/${parentId}/unassign-student`, { studentId })
  }

  /** Admin-only: set a new login password for the parent's account. */
  async resetPassword(parentId: number, newPassword: string): Promise<{ email: string | null }> {
    return this.patch<{ email: string | null }>(`/parents/${parentId}/reset-password`, {
      newPassword,
    })
  }

  async getMyDashboardData(): Promise<any> {
    return this.get<any>('/parents/dashboard/my-data')
  }

  async getMyAttendance(offset = 0, limit = 5): Promise<any> {
    return this.get<any>('/parents/dashboard/attendance', { offset, limit })
  }

  /** Group-linked activities (Activity entity) for the parent's children's groups */
  async getMyAssignedActivities(): Promise<any[]> {
    return this.get<any[]>('/parents/dashboard/activities')
  }

  /** Bus boarding / drop-off lines for the parent's children (all schools). */
  async getMyBusMovements(
    opts?: { date?: string; limit?: number; schoolId?: string },
  ): Promise<{ date: string | null; items: any[] }> {
    return this.get<{ date: string | null; items: any[] }>('/parents/dashboard/bus-movements', {
      ...(opts?.schoolId != null ? { school_id: opts.schoolId } : {}),
      ...(opts?.date ? { date: opts.date } : {}),
      ...(opts?.limit != null ? { limit: opts.limit } : {}),
    })
  }
}

export const parentService = new ParentService()
export default parentService
