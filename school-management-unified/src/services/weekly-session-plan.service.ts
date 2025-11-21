import { BaseApiService } from './api'

export interface WeeklySessionPlan {
  id: string
  schedule_id: string
  week_start_date: string
  week_end_date: string
  task_title: string
  task_description: string
  is_completed: boolean
  completion_date?: string
  completion_notes?: string
  created_by: string
  created_at: string
  updated_at: string
  tasks?: WeeklySessionTask[]
  schedule?: {
    id: string
    group_id: string
    course_id: string
    teacher_id: string
    day_of_week: string
    start_time: string
    end_time: string
    group?: {
      id: string
      name: string
    }
    course?: {
      id: string
      name: string
    }
    teacher?: {
      id: string
      first_name: string
      last_name: string
    }
  }
}

export interface WeeklySessionTask {
  id: number
  title: string
  description?: string
  status: 'pending' | 'completed' | 'postponed'
  created_at: string
  updated_at: string
  createdBy?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface CreateWeeklySessionPlanDto {
  groupId: string
  weekStartDate: string // YYYY-MM-DD format
  scheduleId?: string // Optional - if provided, use this specific schedule
  title: string
  description?: string
}

export interface UpdateWeeklySessionPlanDto {
  task_title?: string
  task_description?: string
  is_completed?: boolean
  completion_notes?: string
}

export interface GroupWeeklyPlanning {
  week_start_date: string
  week_end_date: string
  schedules: Array<{
    id: string
    group_id: string
    course_id: string
    teacher_id: string
    day_of_week: string
    start_time: string
    end_time: string
    group?: any
    course?: any
    teacher?: any
    weeklyPlan?: WeeklySessionPlan | null
  }>
}

class WeeklySessionPlanService extends BaseApiService {
  private basePath = '/weekly-session-plans'

  async getAll(
    groupId?: string,
    weekStartDate?: string,
    scheduleId?: string
  ): Promise<WeeklySessionPlan[]> {
    const params: any = {}
    if (groupId) params.group_id = groupId
    if (weekStartDate) params.week_start_date = weekStartDate
    if (scheduleId) params.schedule_id = scheduleId

    return this.get<WeeklySessionPlan[]>(this.basePath, params)
  }

  async getById(id: string): Promise<WeeklySessionPlan> {
    return this.get<WeeklySessionPlan>(`${this.basePath}/${id}`)
  }

  async getGroupWeeklyPlanning(
    groupId: string,
    weekStartDate: string
  ): Promise<GroupWeeklyPlanning> {
    return this.get<GroupWeeklyPlanning>(
      `${this.basePath}/group/${groupId}/week/${weekStartDate}`
    )
  }

  async create(data: CreateWeeklySessionPlanDto): Promise<WeeklySessionPlan> {
    const payload = {
      groupId: data.groupId,
      weekStartDate: data.weekStartDate,
      scheduleId: data.scheduleId,
      title: data.title,
      description: data.description || ''
    }
    return this.post<WeeklySessionPlan>(this.basePath, payload)
  }

  async update(id: string, data: UpdateWeeklySessionPlanDto): Promise<WeeklySessionPlan> {
    return this.put<WeeklySessionPlan>(`${this.basePath}/${id}`, data)
  }

  async markComplete(id: string, completionNotes?: string): Promise<WeeklySessionPlan> {
    return this.put<WeeklySessionPlan>(`${this.basePath}/${id}/complete`, {
      completion_notes: completionNotes
    })
  }

  async markIncomplete(id: string): Promise<WeeklySessionPlan> {
    return this.put<WeeklySessionPlan>(`${this.basePath}/${id}/incomplete`)
  }

  async deletePlan(id: string): Promise<void> {
    return super.delete<void>(`${this.basePath}/${id}`)
  }

  async copyFromPreviousWeek(currentWeekStartDate: string): Promise<WeeklySessionPlan[]> {
    return this.post<WeeklySessionPlan[]>(`${this.basePath}/copy-from-previous-week`, {
      currentWeekStartDate
    })
  }

  // Task management methods
  async updateTask(taskId: number, data: { status: string; updated_by?: number }): Promise<WeeklySessionTask> {
    return this.patch<WeeklySessionTask>(`${this.basePath}/tasks/${taskId}`, data)
  }

  async updateTaskStatus(taskId: number, status: string, updatedBy?: number): Promise<WeeklySessionTask> {
    return this.updateTask(taskId, { status, updated_by: updatedBy })
  }

  // Session completion methods
  async completeSession(planId: string, data: {
    completion_description: string
    completed_by: string
  }): Promise<WeeklySessionPlan> {
    return this.patch<WeeklySessionPlan>(`${this.basePath}/${planId}/complete`, {
      ...data,
      session_status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  async updateSessionStatus(planId: string, status: string, data?: {
    completion_description?: string
    completed_by?: string
  }): Promise<WeeklySessionPlan> {
    return this.patch<WeeklySessionPlan>(`${this.basePath}/${planId}/status`, {
      session_status: status,
      ...data,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    })
  }

  // Helper method to get week start date (Sunday) from any date
  getWeekStartDate(date: Date): string {
    const startDate = new Date(date)
    const dayOfWeek = startDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(startDate.getDate() - dayOfWeek) // Go back to Sunday
    return startDate.toISOString().split('T')[0]
  }

  // Helper method to get current week start date
  getCurrentWeekStartDate(): string {
    return this.getWeekStartDate(new Date())
  }

  // Helper method to format week range for display
  formatWeekRange(weekStartDate: string): string {
    const startDate = new Date(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    }
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
  }
}

export const weeklySessionPlanService = new WeeklySessionPlanService()
export default weeklySessionPlanService
