import { BaseApiService } from './api'

export interface ClassSettings {
  id: string
  setting_type: string
  name: string
  duration_minutes?: number
  time_value?: string
  is_default: boolean
  is_active: boolean
  color?: string
  description?: string
  order_index: number
  additional_settings?: any
  school_id: number
  created_at: string
  updated_at: string
}

export interface CreateClassSettingsDto {
  durations: number[]
  startTimes: string[]
  defaultDuration?: number
  is_active?: boolean
}

export interface UpdateClassSettingsDto {
  durations?: number[]
  startTimes?: string[]
  defaultDuration?: number
  is_active?: boolean
}

export interface TimeSlotData {
  durations: number[]
  startTimes: string[]
  defaultDuration: number
}

export interface TimeSlot {
  id: string
  startTime: string
  duration: number
}

class ClassSettingsService extends BaseApiService {
  private basePath = '/class-settings'

  async getAll(): Promise<ClassSettings[]> {
    return this.get<ClassSettings[]>(this.basePath)
  }

  async getActive(): Promise<ClassSettings | null> {
    return this.get<ClassSettings | null>(`${this.basePath}/active`)
  }

  async getDefault(): Promise<ClassSettings> {
    return this.get<ClassSettings>(`${this.basePath}/default`)
  }

  async getTimeSlots(): Promise<TimeSlotData> {
    return this.get<TimeSlotData>(`${this.basePath}/time-slots`)
  }

  async getById(id: string): Promise<ClassSettings> {
    return this.get<ClassSettings>(`${this.basePath}/${id}`)
  }

  async create(data: CreateClassSettingsDto): Promise<ClassSettings> {
    return this.post<ClassSettings>(this.basePath, data)
  }

  async update(id: string, data: UpdateClassSettingsDto): Promise<ClassSettings> {
    return this.patch<ClassSettings>(`${this.basePath}/${id}`, data)
  }

  async setActive(id: string): Promise<ClassSettings> {
    return this.patch<ClassSettings>(`${this.basePath}/${id}/set-active`)
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/${id}`)
  }

  // Duration management
  async addDuration(duration: number): Promise<ClassSettings> {
    return this.post<ClassSettings>(`${this.basePath}/durations`, { duration })
  }

  async removeDuration(duration: number): Promise<void> {
    return this.delete<void>(`${this.basePath}/durations/${duration}`)
  }

  async setDefaultDuration(duration: number): Promise<ClassSettings> {
    return this.patch<ClassSettings>(`${this.basePath}/default-duration`, { duration })
  }

  // Start time management
  async addStartTime(startTime: string): Promise<ClassSettings> {
    return this.post<ClassSettings>(`${this.basePath}/start-times`, { startTime })
  }

  async removeStartTime(startTime: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/start-times/${startTime}`)
  }

  // Time slot validation
  async validateTimeSlot(startTime: string, duration: number): Promise<{ isValid: boolean }> {
    return this.post<{ isValid: boolean }>(`${this.basePath}/validate-time-slot`, { startTime, duration })
  }
}

export const classSettingsService = new ClassSettingsService()
export default classSettingsService