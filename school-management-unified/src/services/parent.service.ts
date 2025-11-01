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
}

export const parentService = new ParentService()
export default parentService