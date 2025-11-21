import { BaseApiService } from './api'

export interface StudentProgress {
  id?: number
  student_id: string
  course_id: string
  milestone_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'postponed'
  score?: number
  points_earned?: number
  teacher_notes?: string
  student_notes?: string
  started_date?: string
  completed_date?: string
  due_date?: string
  is_late_submission?: boolean
  feedback?: string
  attachments?: any
  updated_by: number
  created_at?: string
  updated_at?: string
}

export interface CreateProgressDto {
  status: string
  score?: number
  points_earned?: number
  teacher_notes?: string
  student_notes?: string
  started_date?: Date
  completed_date?: Date
  due_date?: Date
  is_late_submission?: boolean
  feedback?: string
  attachments?: any
  student_id: string
  course_id: string
  milestone_id: string
  updated_by: number
}

export interface UpdateProgressDto {
  status?: string
  score?: number
  points_earned?: number
  teacher_notes?: string
  student_notes?: string
  started_date?: Date
  completed_date?: Date
  due_date?: Date
  is_late_submission?: boolean
  feedback?: string
  attachments?: any
  updated_by?: number
}

export interface BulkProgressUpdateDto {
  milestone_id: string
  course_id: string
  updated_by: number
  updates: {
    student_id: string
    status: string
    teacher_notes?: string
    score?: number
    points_earned?: number
  }[]
}

class ProgressService extends BaseApiService {
  // Create new progress record
  async createProgress(data: CreateProgressDto): Promise<StudentProgress> {
    return this.post<StudentProgress>('/student-progress', data)
  }

  // Update existing progress record
  async updateProgress(id: number, data: UpdateProgressDto): Promise<StudentProgress> {
    return this.patch<StudentProgress>(`/student-progress/${id}`, data)
  }

  // Bulk update multiple progress records
  async bulkUpdateProgress(data: BulkProgressUpdateDto): Promise<StudentProgress[]> {
    return this.post<StudentProgress[]>('/student-progress/bulk-update', data)
  }

  // Get all progress records
  async getAllProgress(): Promise<StudentProgress[]> {
    return this.get<StudentProgress[]>('/student-progress')
  }

  // Get progress by student ID
  async getProgressByStudent(studentId: string): Promise<StudentProgress[]> {
    return this.get<StudentProgress[]>(`/student-progress/student/${studentId}`)
  }

  // Get progress by course ID
  async getProgressByCourse(courseId: string): Promise<StudentProgress[]> {
    return this.get<StudentProgress[]>(`/student-progress/course/${courseId}`)
  }

  // Get progress by milestone ID
  async getProgressByMilestone(milestoneId: string): Promise<StudentProgress[]> {
    return this.get<StudentProgress[]>(`/student-progress/milestone/${milestoneId}`)
  }

  // Get specific progress by student and course
  async getProgressByStudentAndCourse(studentId: string, courseId: string): Promise<StudentProgress[]> {
    return this.get<StudentProgress[]>(`/student-progress/student/${studentId}/course/${courseId}`)
  }

  // Get specific progress by student and milestone
  async getProgressByStudentAndMilestone(studentId: string, milestoneId: string): Promise<StudentProgress | null> {
    try {
      return this.get<StudentProgress>(`/student-progress/student/${studentId}/milestone/${milestoneId}`)
    } catch (error) {
      // Return null if not found
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  // Get student course progress summary
  async getStudentCourseProgress(studentId: string, courseId: string): Promise<any> {
    return this.get<any>(`/student-progress/summary/student/${studentId}/course/${courseId}`)
  }

  // Get course progress summary
  async getCourseProgressSummary(courseId: string): Promise<any> {
    return this.get<any>(`/student-progress/summary/course/${courseId}`)
  }

  // Get milestone progress summary
  async getMilestoneProgressSummary(milestoneId: string): Promise<any> {
    return this.get<any>(`/student-progress/summary/milestone/${milestoneId}`)
  }

  // Delete progress record
  async deleteProgress(id: number): Promise<void> {
    return this.delete<void>(`/student-progress/${id}`)
  }

  // Save or update milestone progress (convenience method)
  async saveMilestoneProgress(data: {
    studentId: string
    courseId: string
    milestoneId: string
    status: string
    teacherNotes?: string
    startDate?: string
    endDate?: string
    updatedBy: number
  }): Promise<StudentProgress> {
    // Check if progress already exists
    const existingProgress = await this.getProgressByStudentAndMilestone(data.studentId, data.milestoneId)
    
    const progressData = {
      status: data.status,
      teacher_notes: data.teacherNotes,
      started_date: data.startDate ? new Date(data.startDate) : undefined,
      completed_date: data.endDate ? new Date(data.endDate) : undefined,
      updated_by: data.updatedBy
    }

    if (existingProgress) {
      // Update existing progress
      return this.updateProgress(existingProgress.id!, progressData)
    } else {
      // Create new progress
      return this.createProgress({
        ...progressData,
        student_id: data.studentId,
        course_id: data.courseId,
        milestone_id: data.milestoneId
      })
    }
  }
}

export const progressService = new ProgressService()
export default progressService
