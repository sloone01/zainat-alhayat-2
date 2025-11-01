import { BaseApiService } from './api'

export interface Group {
  id: string
  name: string
  description?: string
  age_range_min?: number
  age_range_max?: number
  capacity: number
  is_active: boolean
  school_id: number
  room_id?: number
  academic_year_id?: string
  created_at: Date
  updated_at: Date
  students?: any[]
  schedules?: any[]
  attendances?: any[]
  academicYear?: any
}

export interface CreateGroupRequest {
  name: string
  description?: string
  age_range_min?: number
  age_range_max?: number
  capacity: number
  is_active?: boolean
  school_id: number
  room_id?: number
  academic_year_id?: string
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

class GroupService extends BaseApiService {
  async getAll(schoolId?: number): Promise<Group[]> {
    const params = schoolId ? { school_id: schoolId } : {}
    return this.get<Group[]>('/groups', params)
  }

  async getActive(schoolId?: number): Promise<Group[]> {
    const params = schoolId ? { school_id: schoolId, is_active: true } : { is_active: true }
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