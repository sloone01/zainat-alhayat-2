import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export interface Group {
  id: string
  name: string
  description?: string
  age_range_min?: number
  age_range_max?: number
  capacity: number
  is_active: boolean
  school_id: string
  room_id?: number
  academic_year_id?: string
  created_at: Date
  updated_at: Date
  students?: any[]
  schedules?: any[]
  attendances?: any[]
  academicYear?: any
  level_id?: string | null
  level?: { id: string; code: string; name: string }
  supervisor_id?: string | null
  supervisor?: { id: string; firstName?: string; lastName?: string; fullName?: string } | null
}

export interface CreateGroupRequest {
  name: string
  description?: string
  age_range_min?: number
  age_range_max?: number
  capacity: number
  is_active?: boolean
  school_id: string
  room_id?: number
  academic_year_id?: string
  level_id?: string | null
  supervisor_id?: string | null
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

export interface GroupListParams {
  page?: number
  limit?: number
  q?: string
  status?: string
  schoolId?: string
}

class GroupService extends BaseApiService {
  async getAll(schoolId?: string): Promise<Group[]> {
    const params = schoolId ? { school_id: schoolId } : {}
    return this.get<Group[]>('/groups', params)
  }

  async listPage(params: GroupListParams): Promise<PageResult<Group>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.status && params.status !== 'all') query.status = params.status
    if (params.schoolId) query.school_id = params.schoolId
    return this.get<PageResult<Group>>('/groups', query)
  }

  async getActive(schoolId?: string, paymentLevelId?: string): Promise<Group[]> {
    const params: Record<string, string | number | boolean> = { is_active: true }
    if (schoolId != null) params.school_id = schoolId
    if (paymentLevelId) params.payment_level_id = paymentLevelId
    return this.get<Group[]>('/groups', params)
  }

  async getById(id: string): Promise<Group> {
    return this.get<Group>(`/groups/${id}`)
  }

  async create(groupData: CreateGroupRequest): Promise<Group> {
    return this.post<Group>('/groups', groupData)
  }

  async update(id: string, groupData: UpdateGroupRequest): Promise<Group> {
    return this.patch<Group>(`/groups/${id}`, groupData)
  }

  async deleteGroup(id: string): Promise<void> {
    await this.delete(`/groups/${id}`)
  }

  async getByAcademicYear(academicYearId: string): Promise<Group[]> {
    return this.get<Group[]>(`/groups/academic-year/${academicYearId}`)
  }

  async getGroupCapacity(id: string): Promise<{ capacity: number; currentStudents: number; available: number }> {
    return this.get(`/groups/${id}/capacity`)
  }
}

export const groupService = new GroupService()
export default groupService