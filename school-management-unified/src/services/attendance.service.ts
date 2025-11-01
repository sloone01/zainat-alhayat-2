import { apiClient } from './api'

export interface AttendanceRecord {
  id: number
  attendance_date: string
  status: string
  check_in_time?: string
  check_out_time?: string
  notes?: string
  reason?: string
  is_excused: boolean
  student_id: string
  group_id: string
  recorded_by?: number
  created_at: string
  updated_at: string
  student?: {
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    user?: {
      firstName: string
      lastName: string
    }
  }
  recorder?: {
    id: number
    user: {
      firstName: string
      lastName: string
    }
  }
}

export interface BulkAttendanceRequest {
  attendance_date: string
  group_id: string
  recorded_by?: number
  attendances: {
    student_id: string
    status: string
    check_in_time?: string
    check_out_time?: string
    notes?: string
    reason?: string
    is_excused?: boolean
  }[]
}

export interface AttendanceStatistics {
  total_records: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
}

class AttendanceService {
  private baseUrl = '/attendance'

  // Get all attendance records
  async getAll(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get(this.baseUrl)
    return response.data.data
  }

  // Get attendance records for a specific group and date
  async getByGroup(groupId: string, date?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams()
    if (date) {
      params.append('date', date)
    }
    
    const url = `${this.baseUrl}/group/${groupId}${params.toString() ? '?' + params.toString() : ''}`
    const response = await apiClient.get(url)
    return response.data.data
  }

  // Get attendance records for a specific student
  async getByStudent(studentId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const url = `${this.baseUrl}/student/${studentId}${params.toString() ? '?' + params.toString() : ''}`
    const response = await apiClient.get(url)
    return response.data.data
  }

  // Get attendance records for a specific date
  async getByDate(date: string): Promise<AttendanceRecord[]> {
    const response = await apiClient.get(`${this.baseUrl}/date/${date}`)
    return response.data.data
  }

  // Create a single attendance record
  async create(attendanceData: {
    attendance_date: string
    status: string
    check_in_time?: string
    check_out_time?: string
    notes?: string
    reason?: string
    is_excused?: boolean
    student_id: string
    group_id: string
    recorded_by?: number
  }): Promise<AttendanceRecord> {
    const response = await apiClient.post(this.baseUrl, attendanceData)
    return response.data.data
  }

  // Create multiple attendance records at once (bulk operation)
  async createBulk(bulkData: BulkAttendanceRequest): Promise<AttendanceRecord[]> {
    const response = await apiClient.post(`${this.baseUrl}/bulk`, bulkData)
    return response.data.data
  }

  // Update an attendance record
  async update(id: number, updateData: {
    status?: string
    check_in_time?: string
    check_out_time?: string
    notes?: string
    reason?: string
    is_excused?: boolean
  }): Promise<AttendanceRecord> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, updateData)
    return response.data.data
  }

  // Delete an attendance record
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // Check if attendance already exists for a student on a specific date
  async checkExisting(studentId: string, date: string): Promise<AttendanceRecord | null> {
    const response = await apiClient.get(`${this.baseUrl}/check/${studentId}/${date}`)
    return response.data.data
  }

  // Get attendance statistics for a group
  async getGroupStatistics(groupId: string, startDate: string, endDate: string): Promise<AttendanceStatistics> {
    const response = await apiClient.get(`${this.baseUrl}/statistics/group/${groupId}?start_date=${startDate}&end_date=${endDate}`)
    return response.data.data
  }

  // Get attendance statistics for a student
  async getStudentStatistics(studentId: string, startDate: string, endDate: string): Promise<{
    student_id: string
    total_days: number
    present_days: number
    absent_days: number
    excused_days: number
    attendance_rate: number
    unexcused_absences: number
  }> {
    const response = await apiClient.get(`${this.baseUrl}/statistics/student/${studentId}?start_date=${startDate}&end_date=${endDate}`)
    return response.data.data
  }

  // Get daily attendance report
  async getDailyReport(date: string): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/report/daily/${date}`)
    return response.data.data
  }

  // Get groups that a teacher supervises (based on schedules)
  async getTeacherGroups(teacherId: string): Promise<any[]> {
    const response = await apiClient.get(`/schedules/teacher/${teacherId}/courses`)
    return response.data.data.map((item: any) => item.group).filter((group: any, index: number, self: any[]) =>
      index === self.findIndex((g: any) => g.id === group.id)
    )
  }
}

export const attendanceService = new AttendanceService()
