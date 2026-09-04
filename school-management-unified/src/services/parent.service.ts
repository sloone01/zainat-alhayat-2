import { BaseApiService } from './api'

export interface Parent {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
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
  userId?: number
  studentIds?: number[]
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

  async assignToStudent(parentId: number, studentId: string): Promise<Parent> {
    return this.patch<Parent>(`/parents/${parentId}/assign-student`, { studentId })
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

  /** Bus boarding / drop-off lines for the parent's children (requires school_id). */
  async getMyBusMovements(
    schoolId: number,
    opts?: { date?: string; limit?: number },
  ): Promise<{ date: string | null; items: any[] }> {
    return this.get<{ date: string | null; items: any[] }>('/parents/dashboard/bus-movements', {
      school_id: schoolId,
      ...(opts?.date ? { date: opts.date } : {}),
      ...(opts?.limit != null ? { limit: opts.limit } : {}),
    })
  }
}

export const parentService = new ParentService()
export default parentService