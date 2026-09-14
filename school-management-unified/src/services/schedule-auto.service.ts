import { BaseApiService } from './api'

export interface ScheduleLessonDemand {
  id: string
  school_id: string
  group_id: string
  course_id: string
  teacher_id: string
  periods_per_week: number
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
}

export interface CreateDemandRequest {
  group_id: string
  course_id: string
  teacher_id: string
  periods_per_week: number
}

export interface GenerateTimetableRequest {
  group_id: string
  apply?: boolean
  days?: string[]
  slots?: ScheduleAutoSlot[]
}

class ScheduleAutoService extends BaseApiService {
  async getDemands(groupId: string): Promise<ScheduleLessonDemand[]> {
    return this.get<ScheduleLessonDemand[]>('/schedules/auto/demands', { group_id: groupId })
  }

  async createDemand(payload: CreateDemandRequest): Promise<ScheduleLessonDemand> {
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

  async replaceDemands(
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
