import type { PageResult } from '@/composables/useServerPagination'
import { BaseApiService } from './api'

export interface ParentListChild {
  id: string
  firstName?: string
  lastName?: string
  groupNames?: string
  groups?: Array<{ id: string; name?: string }>
}

export interface ParentPlansPage<T> extends PageResult<T> {
  children: ParentListChild[]
  childId: string | null
}

export interface ParentProgressRow {
  id: string
  status: string
  teacher_notes?: string | null
  milestoneName?: string | null
}

export interface ParentProgressPage extends ParentPlansPage<ParentProgressRow> {
  counts: { completed: number; inProgress: number; notStarted: number }
}

export interface ParentAttendanceHistoryItem {
  id: string
  attendance_date: string
  status: string
  check_in_time: string | null
  check_out_time: string | null
  notes: string | null
  is_excused: boolean
  reason: string | null
  student?: { id: string; firstName: string; lastName: string }
  group?: { id: string; name: string } | null
}

export interface ParentAttendancePage {
  today: {
    date: string
    children: Array<{
      studentId: string
      firstName: string
      lastName: string
      groupNames: string
      record: null | {
        id: string
        status: string
        check_in_time: string | null
        check_out_time: string | null
        notes: string | null
        is_excused: boolean
        reason: string | null
        groupName: string | null
      }
    }>
  }
  childId: string | null
  monthItems: ParentAttendanceHistoryItem[]
  history: PageResult<ParentAttendanceHistoryItem>
}

function normalizeParentChildren(children: ParentListChild[] | undefined): ParentListChild[] {
  return Array.isArray(children)
    ? children.map((child) => ({
        ...child,
        groupNames:
          !child.groupNames || child.groupNames === 'No group assigned' ? '' : child.groupNames,
      }))
    : []
}

export type ParentRelationship = 'father' | 'mother' | 'guardian'

export interface Parent {
  id: string
  firstName: string
  lastName: string
  first_name_ar?: string | null
  first_name_en?: string | null
  last_name_ar?: string | null
  last_name_en?: string | null
  civil_id?: string | null
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
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
  civil_id?: string
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
  /** When false, record the parent without provisioning a login account (email/mobile optional). */
  createLogin?: boolean
}

export interface UpdateParentRequest extends Partial<CreateParentRequest> {}

class ParentService extends BaseApiService {
  async getAll(): Promise<Parent[]> {
    return this.get<Parent[]>('/parents')
  }

  async getById(id: string): Promise<Parent> {
    return this.get<Parent>(`/parents/${id}`)
  }

  async create(parentData: CreateParentRequest): Promise<Parent> {
    return this.post<Parent>('/parents', parentData)
  }

  async update(id: string, parentData: UpdateParentRequest): Promise<Parent> {
    return this.patch<Parent>(`/parents/${id}`, parentData)
  }

  async deleteParent(id: string): Promise<void> {
    await this.delete(`/parents/${id}`)
  }

  async search(query: string): Promise<Parent[]> {
    return this.get<Parent[]>('/parents/search', { q: query })
  }

  async assignToStudent(
    parentId: string,
    studentId: string,
    relationship: ParentRelationship = 'guardian',
  ): Promise<Parent> {
    return this.patch<Parent>(`/parents/${parentId}/assign-student`, {
      studentId,
      relationship,
    })
  }

  async unassignFromStudent(parentId: string, studentId: string): Promise<Parent> {
    return this.patch<Parent>(`/parents/${parentId}/unassign-student`, { studentId })
  }

  /** Admin-only: set a new login password for the parent's account. */
  async resetPassword(parentId: string, newPassword: string): Promise<{ email: string | null }> {
    return this.patch<{ email: string | null }>(`/parents/${parentId}/reset-password`, {
      newPassword,
    })
  }

  async getMyDashboardData(): Promise<any> {
    const data = await this.get<any>('/parents/dashboard/my-data')
    if (Array.isArray(data?.children)) {
      data.children = data.children.map((child: { groupNames?: string }) => ({
        ...child,
        groupNames:
          !child.groupNames || child.groupNames === 'No group assigned' ? '' : child.groupNames,
      }))
    }
    return data
  }

  async getMyWeeklyPlans(): Promise<{ children: any[]; weeklyPlans: any[] }> {
    const data = await this.get<{ children?: ParentListChild[]; weeklyPlans?: any[] }>(
      '/parents/dashboard/weekly-plans',
    )
    return {
      children: normalizeParentChildren(data?.children),
      weeklyPlans: Array.isArray(data?.weeklyPlans) ? data.weeklyPlans : [],
    }
  }

  /** One page of weekly plans. `status` selects the activities tab (completed / upcoming). */
  async getMyWeeklyPlansPage(params: {
    page: number
    limit: number
    childId?: string
    weekStart?: string
    status?: 'completed' | 'upcoming'
  }): Promise<ParentPlansPage<any>> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    }
    if (params.childId) query.child_id = params.childId
    if (params.weekStart) query.week_start = params.weekStart
    if (params.status) query.status = params.status
    const data = await this.get<ParentPlansPage<any>>('/parents/dashboard/weekly-plans', query)
    return {
      ...data,
      items: Array.isArray(data?.items) ? data.items : [],
      children: normalizeParentChildren(data?.children),
    }
  }

  async getMyProgressPage(params: {
    page: number
    limit: number
    childId?: string
    status?: string
  }): Promise<ParentProgressPage> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    }
    if (params.childId) query.child_id = params.childId
    if (params.status && params.status !== 'all') query.status = params.status
    const data = await this.get<ParentProgressPage>('/parents/dashboard/progress', query)
    return {
      ...data,
      items: Array.isArray(data?.items) ? data.items : [],
      children: normalizeParentChildren(data?.children),
      counts: data?.counts || { completed: 0, inProgress: 0, notStarted: 0 },
    }
  }

  async getMyAttendance(offset = 0, limit = 5): Promise<any> {
    return this.get<any>('/parents/dashboard/attendance', { offset, limit })
  }

  /** History page for one child. Month rows and today's card travel with the page. */
  async getMyAttendancePage(params: {
    page: number
    limit: number
    childId?: string
    status?: string
  }): Promise<ParentAttendancePage> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    }
    if (params.childId) query.child_id = params.childId
    if (params.status && params.status !== 'all') query.status = params.status
    return this.get<ParentAttendancePage>('/parents/dashboard/attendance', query)
  }

  /** Group-linked activities (Activity entity) for the parent's children's groups */
  async getMyAssignedActivities(): Promise<any[]> {
    return this.get<any[]>('/parents/dashboard/activities')
  }

  async getMyAssignedActivitiesPage(params: {
    page: number
    limit: number
    childId?: string
  }): Promise<ParentPlansPage<any>> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    }
    if (params.childId) query.child_id = params.childId
    const data = await this.get<ParentPlansPage<any>>('/parents/dashboard/activities', query)
    return {
      ...data,
      items: Array.isArray(data?.items) ? data.items : [],
      children: normalizeParentChildren(data?.children),
    }
  }

  /** Bus boarding / drop-off lines for the parent's children (all schools). */
  /** Last known live position of each linked child's bus. */
  async getMyBusPositions(): Promise<
    Array<{
      bus_id: string
      bus_title: string
      last_lat: number | null
      last_lng: number | null
      last_position_at: string | null
      students: Array<{
        id: string
        firstName: string
        lastName: string
        pickup_set: boolean
        pickup_lat?: number | null
        pickup_lng?: number | null
        eta_minutes?: number | null
        eta_sequence?: number | null
      }>
    }>
  > {
    return this.get<
      Array<{
        bus_id: string
        bus_title: string
        last_lat: number | null
        last_lng: number | null
        last_position_at: string | null
        students: Array<{
          id: string
          firstName: string
          lastName: string
          pickup_set: boolean
          pickup_lat?: number | null
          pickup_lng?: number | null
          eta_minutes?: number | null
          eta_sequence?: number | null
        }>
      }>
    >('/parents/dashboard/bus-positions')
  }

  async getMyBusMovements(
    opts?: { date?: string; limit?: number; schoolId?: string },
  ): Promise<{ date: string | null; items: any[] }> {
    return this.get<{ date: string | null; items: any[] }>('/parents/dashboard/bus-movements', {
      ...(opts?.schoolId != null ? { school_id: opts.schoolId } : {}),
      ...(opts?.date ? { date: opts.date } : {}),
      ...(opts?.limit != null ? { limit: opts.limit } : {}),
    })
  }

  /** Share pickup location for a linked child (uses child's current bus). */
  async shareChildBusPickup(
    studentId: string,
    coords: { pickup_lat: number; pickup_lng: number },
  ): Promise<{
    student_id: string
    bus_id: string
    pickup_lat: number | null
    pickup_lng: number | null
  }> {
    return this.patch(`/parents/dashboard/students/${encodeURIComponent(studentId)}/bus-pickup`, coords)
  }
}

export const parentService = new ParentService()
export default parentService
