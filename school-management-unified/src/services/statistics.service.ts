import { BaseApiService } from './api'

export interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalGroups: number
  totalTeachers: number
  activeStudents: number
  completedMilestones: number
  attendanceRate: number
}

export interface StudentProgressStats {
  totalStudents: number
  studentsWithProgress: number
  averageProgress: number
  milestoneStats: MilestoneStats[]
}

export interface MilestoneStats {
  milestoneId: string
  milestoneName: string
  completedCount: number
  totalStudents: number
  completionRate: number
}

export interface AttendanceStats {
  totalSessions: number
  averageAttendance: number
  attendanceByDate: AttendanceByDate[]
  studentAttendance: StudentAttendance[]
}

export interface AttendanceByDate {
  date: string
  present: number
  absent: number
  total: number
  rate: number
}

export interface StudentAttendance {
  studentId: string
  studentName: string
  present: number
  absent: number
  total: number
  rate: number
}

export interface CourseStats {
  courseId: string
  courseName: string
  totalStudents: number
  totalPhases: number
  totalMilestones: number
  averageProgress: number
  completionRate: number
}

class StatisticsService extends BaseApiService {
  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/statistics/dashboard')
  }

  async getStudentProgressStats(courseId?: string): Promise<StudentProgressStats> {
    const params = courseId ? { courseId } : undefined
    return this.get<StudentProgressStats>('/statistics/student-progress', params)
  }

  async getAttendanceStats(
    groupId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceStats> {
    const params: any = {}
    if (groupId) params.groupId = groupId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    return this.get<AttendanceStats>('/statistics/attendance', params)
  }

  async getCourseStats(): Promise<CourseStats[]> {
    return this.get<CourseStats[]>('/statistics/courses')
  }
}

export const statisticsService = new StatisticsService()
export default statisticsService

