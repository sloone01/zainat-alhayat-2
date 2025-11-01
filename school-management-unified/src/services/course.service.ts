import { BaseApiService } from './api'

export interface Course {
  id: string
  name: string
  description?: string
  age_group_min?: number
  age_group_max?: number
  is_active: boolean
  color_code?: string
  icon?: string
  send_notifications: boolean
  estimated_duration_weeks?: number
  learning_objectives?: string
  prerequisites?: string
  materials_needed?: string
  school_id: number
  academic_year_id?: string
  created_at: Date
  updated_at: Date
  // Frontend compatibility fields
  title?: string // Alias for name
  category?: string
  status?: string
  totalDuration?: number
  createdDate?: Date
  lastModified?: Date
  targetAgeGroup?: string
  difficultyLevel?: string
  maxStudents?: number
  phases?: Phase[]
  schedules?: any[]
  school?: any
  academicYear?: {
    id: string
    year: string
    start_date: string
    end_date: string
    is_active: boolean
  }
}

export interface Phase {
  id: string
  name: string
  description?: string
  order: number
  duration_weeks?: number
  is_required: boolean
  learning_goals?: string
  assessment_criteria?: string
  courseId: string
  createdAt: Date
  updatedAt: Date
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  description?: string
  order: number
  isRequired: boolean
  points?: number
  phaseId: string
  createdAt: Date
  updatedAt: Date
  progress?: any[]
}

export interface CreateCourseRequest {
  name: string
  description?: string
  age_group_min?: number
  age_group_max?: number
  is_active?: boolean
  color_code?: string
  icon?: string
  send_notifications?: boolean
  estimated_duration_weeks?: number
  learning_objectives?: string
  prerequisites?: string
  materials_needed?: string
  school_id: number
  academic_year_id?: string // Optional, will be auto-populated by backend if not provided
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CreatePhaseRequest {
  name: string
  description?: string
  order: number
  courseId: string
}

export interface UpdatePhaseRequest extends Partial<CreatePhaseRequest> {}

export interface CreateMilestoneRequest {
  name: string
  description?: string
  order: number
  phaseId: string
  isRequired?: boolean
  points?: number
}

export interface UpdateMilestoneRequest extends Partial<CreateMilestoneRequest> {}

class CourseService extends BaseApiService {
  // Course methods
  async getAllCourses(schoolId: number = 1): Promise<Course[]> {
    return this.get<Course[]>(`/courses?school_id=${schoolId}`)
  }

  async getCourseById(id: string): Promise<Course> {
    return this.get<Course>(`/courses/${id}`)
  }

  async createCourse(courseData: CreateCourseRequest & { school_id?: number }): Promise<Course> {
    const dataWithSchoolId = { ...courseData, school_id: courseData.school_id || 1 }
    return this.post<Course>('/courses', dataWithSchoolId)
  }

  async updateCourse(id: string, courseData: UpdateCourseRequest): Promise<Course> {
    return this.patch<Course>(`/courses/${id}`, courseData)
  }

  async deleteCourse(id: string): Promise<void> {
    await this.delete(`/courses/${id}`)
  }

  async duplicateCourse(id: string, newName?: string): Promise<Course> {
    return this.post<Course>(`/courses/${id}/duplicate`, { newName })
  }

  // Phase methods
  async getAllPhases(): Promise<Phase[]> {
    return this.get<Phase[]>('/phases')
  }

  async getPhasesByCourse(courseId: string): Promise<Phase[]> {
    return this.get<Phase[]>(`/phases/course/${courseId}`)
  }

  async getPhaseById(id: string): Promise<Phase> {
    return this.get<Phase>(`/phases/${id}`)
  }

  async createPhase(phaseData: CreatePhaseRequest): Promise<Phase> {
    return this.post<Phase>('/phases', phaseData)
  }

  async updatePhase(id: string, phaseData: UpdatePhaseRequest): Promise<Phase> {
    return this.patch<Phase>(`/phases/${id}`, phaseData)
  }

  async deletePhase(id: string): Promise<void> {
    await this.delete(`/phases/${id}`)
  }

  async duplicatePhase(id: string, newName?: string): Promise<Phase> {
    return this.post<Phase>(`/phases/${id}/duplicate`, { newName })
  }

  async reorderPhases(courseId: string, phaseOrders: { id: string; order: number }[]): Promise<Phase[]> {
    return this.patch<Phase[]>(`/phases/course/${courseId}/reorder`, { phaseOrders })
  }

  async getNextPhaseOrder(courseId: string): Promise<number> {
    const response = await this.get<{ nextOrder: number }>(`/phases/course/${courseId}/next-order`)
    return response.nextOrder
  }

  // Milestone methods
  async getAllMilestones(): Promise<Milestone[]> {
    return this.get<Milestone[]>('/milestones')
  }

  async getMilestonesByPhase(phaseId: string): Promise<Milestone[]> {
    return this.get<Milestone[]>(`/milestones/phase/${phaseId}`)
  }

  async getMilestonesByCourse(courseId: string): Promise<Milestone[]> {
    return this.get<Milestone[]>(`/milestones/course/${courseId}`)
  }

  async getMilestoneById(id: string): Promise<Milestone> {
    return this.get<Milestone>(`/milestones/${id}`)
  }

  async createMilestone(milestoneData: CreateMilestoneRequest): Promise<Milestone> {
    return this.post<Milestone>('/milestones', milestoneData)
  }

  async updateMilestone(id: string, milestoneData: UpdateMilestoneRequest): Promise<Milestone> {
    return this.patch<Milestone>(`/milestones/${id}`, milestoneData)
  }

  async deleteMilestone(id: string): Promise<void> {
    await this.delete(`/milestones/${id}`)
  }

  async duplicateMilestone(id: string, newName?: string): Promise<Milestone> {
    return this.post<Milestone>(`/milestones/${id}/duplicate`, { newName })
  }

  async reorderMilestones(phaseId: string, milestoneOrders: { id: string; order: number }[]): Promise<Milestone[]> {
    return this.patch<Milestone[]>(`/milestones/phase/${phaseId}/reorder`, { milestoneOrders })
  }

  async getNextMilestoneOrder(phaseId: string): Promise<number> {
    const response = await this.get<{ nextOrder: number }>(`/milestones/phase/${phaseId}/next-order`)
    return response.nextOrder
  }

  async getRequiredMilestones(phaseId: string): Promise<Milestone[]> {
    return this.get<Milestone[]>(`/milestones/phase/${phaseId}/required`)
  }

  async getMilestoneStats(milestoneId: string): Promise<any> {
    return this.get(`/milestones/${milestoneId}/stats`)
  }
}

export const courseService = new CourseService()
export default courseService

