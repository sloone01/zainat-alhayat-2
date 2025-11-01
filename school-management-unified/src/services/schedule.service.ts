import { BaseApiService } from './api'

export interface Schedule {
  id: string
  day_of_week: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes?: string
  is_recurring?: boolean
  specific_date?: Date
  status: string
  group_id: string
  course_id?: string
  teacher_id?: string
  room_id?: number
  created_at: Date
  updated_at: Date
  // Relations
  group?: any
  course?: any
  teacher?: any
  room?: any
}

export interface CreateScheduleRequest {
  day_of_week: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes?: string
  is_recurring?: boolean
  specific_date?: Date
  group_id: string
  course_id?: string
  teacher_id?: string
  room_id?: number
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  status?: string
}

class ScheduleService extends BaseApiService {
  async getAllSchedules(): Promise<Schedule[]> {
    return this.get<Schedule[]>('/schedules')
  }

  async getScheduleById(id: string): Promise<Schedule> {
    return this.get<Schedule>(`/schedules/${id}`)
  }

  async getSchedulesByGroup(groupId: string): Promise<Schedule[]> {
    return this.get<Schedule[]>(`/schedules/group/${groupId}`)
  }

  async getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
    return this.get<Schedule[]>(`/schedules/teacher/${teacherId}`)
  }

  async getSchedulesByRoom(roomId: number): Promise<Schedule[]> {
    return this.get<Schedule[]>(`/schedules/room/${roomId}`)
  }

  async getSchedulesByDay(dayOfWeek: string): Promise<Schedule[]> {
    return this.get<Schedule[]>(`/schedules/day/${dayOfWeek}`)
  }

  async getWeeklySchedule(groupId?: string, teacherId?: string): Promise<Schedule[]> {
    const params = new URLSearchParams()
    if (groupId) params.append('group_id', groupId)
    if (teacherId) params.append('teacher_id', teacherId)

    return this.get<Schedule[]>(`/schedules/weekly?${params.toString()}`)
  }

  async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    return this.post<Schedule>('/schedules', scheduleData)
  }

  async updateSchedule(id: string, scheduleData: UpdateScheduleRequest): Promise<Schedule> {
    return this.patch<Schedule>(`/schedules/${id}`, scheduleData)
  }

  async cancelSchedule(id: string): Promise<Schedule> {
    return this.patch<Schedule>(`/schedules/${id}/cancel`)
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.delete(`/schedules/${id}`)
  }

  async getTeacherCourses(teacherId: string): Promise<any[]> {
    return this.get<any[]>(`/schedules/teacher/${teacherId}/courses`)
  }
}

export const scheduleService = new ScheduleService()
export default scheduleService