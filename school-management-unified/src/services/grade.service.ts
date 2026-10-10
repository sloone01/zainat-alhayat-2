import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export interface Grade {
  id: string
  school_id?: string
  nameEn: string
  nameAr: string
  code: string
  displayOrder: number
  isActive: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateGradeData {
  nameEn: string
  nameAr: string
  code: string
  displayOrder: number
  isActive?: boolean
  description?: string
}

export interface GradeListParams {
  page?: number
  limit?: number
  q?: string
  status?: 'all' | 'active' | 'inactive' | ''
}

export interface UpdateGradeData {
  nameEn?: string
  nameAr?: string
  code?: string
  displayOrder?: number
  isActive?: boolean
  description?: string
}

class GradeService extends BaseApiService {
  async getAll(): Promise<Grade[]> {
    return this.get<Grade[]>('/grades')
  }

  async listPage(params: GradeListParams): Promise<PageResult<Grade>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.status && params.status !== 'all') query.status = params.status
    return this.get<PageResult<Grade>>('/grades', query)
  }

  async getActive(schoolId: string): Promise<Grade[]> {
    const id = encodeURIComponent(String(schoolId || '').trim())
    return this.get<Grade[]>(`/grades/active?school_id=${id}`)
  }

  async getById(id: string): Promise<Grade> {
    return this.get<Grade>(`/grades/${id}`)
  }

  async create(data: CreateGradeData): Promise<Grade> {
    return this.post<Grade>('/grades', data)
  }

  async update(id: string, data: UpdateGradeData): Promise<Grade> {
    return this.patch<Grade>(`/grades/${id}`, data)
  }

  async remove(id: string): Promise<void> {
    const response = await this.client.delete<import('./api').ApiResponse<void>>(`/grades/${id}`)
    if (response.data?.success) {
      return
    }
    throw new Error(response.data?.message || 'API request failed')
  }

  async reorder(gradeIds: string[]): Promise<Grade[]> {
    return this.post<Grade[]>('/grades/reorder', { gradeIds })
  }

  async initializeDefaults(): Promise<void> {
    await this.post<void>('/grades/initialize-defaults')
  }
}

export const gradeService = new GradeService()
