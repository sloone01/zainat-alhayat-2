import { BaseApiService } from './api'

export interface ScheduleLessonDemand {
  id?: string
  school_id?: string
  group_id?: string
  course_id: string
  teacher_id: string
  periods_per_week: number
  group_ids?: string[]
  group_count?: number
  course?: any
  teacher?: any
}

export interface ScheduleAutoSlot {
  start_time: string
  duration_minutes: number
}

export interface ScheduleAutoPlacement {
  id?: string | null
  demand_id: string
  group_id: string
  course_id: string
  teacher_id: string
  day_of_week: string
  start_time: string
  end_time: string
  duration_minutes: number
  course?: any
  teacher?: any
}

export interface GenerateTimetableResult {
  applied: boolean
  placements: ScheduleAutoPlacement[]
  group_ids?: string[]
}

export interface CreateDemandRequest {
  group_id?: string
  course_id: string
  teacher_id: string
  periods_per_week: number
}

export interface GenerateTimetableRequest {
  group_id?: string
  apply?: boolean
  days?: string[]
  slots?: ScheduleAutoSlot[]
}

class ScheduleAutoService extends BaseApiService {
  async getDemands(groupId?: string): Promise<ScheduleLessonDemand[]> {
    const params = groupId ? { group_id: groupId } : undefined
    return this.get<ScheduleLessonDemand[]>('/schedules/auto/demands', params)
  }

  async createDemand(payload: CreateDemandRequest & { group_id: string }): Promise<ScheduleLessonDemand> {
    return this.post<ScheduleLessonDemand>('/schedules/auto/demands', payload)
  }

  async updateDemand(
    id: string,
    payload: Partial<Pick<CreateDemandRequest, 'course_id' | 'teacher_id' | 'periods_per_week'>>,
  ): Promise<ScheduleLessonDemand> {
    return this.patch<ScheduleLessonDemand>(`/schedules/auto/demands/${id}`, payload)
  }

  async deleteDemand(id: string): Promise<void> {
    await this.delete(`/schedules/auto/demands/${id}`)
  }

  /** School-wide replace. Items with group_id apply to that class only; others copy onto every class on the course level. */
  async replaceDemands(items: CreateDemandRequest[]): Promise<ScheduleLessonDemand[]> {
    return this.post<ScheduleLessonDemand[]>('/schedules/auto/demands/replace', {
      items: items.map((item) => ({
        course_id: item.course_id,
        teacher_id: item.teacher_id,
        periods_per_week: item.periods_per_week,
        ...(item.group_id ? { group_id: item.group_id } : {}),
      })),
    })
  }

  /** Legacy single-group replace (kept for callers that still pass a group). */
  async replaceGroupDemands(
    groupId: string,
    items: CreateDemandRequest[],
  ): Promise<ScheduleLessonDemand[]> {
    return this.post<ScheduleLessonDemand[]>('/schedules/auto/demands/replace', {
      group_id: groupId,
      items: items.map((item) => ({
        course_id: item.course_id,
        teacher_id: item.teacher_id,
        periods_per_week: item.periods_per_week,
      })),
    })
  }

  async generate(payload: GenerateTimetableRequest): Promise<GenerateTimetableResult> {
    return this.post<GenerateTimetableResult>('/schedules/auto/generate', payload)
  }
}

export const scheduleAutoService = new ScheduleAutoService()
export default scheduleAutoService
