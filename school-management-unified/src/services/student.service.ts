import { BaseApiService } from './api'

export interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female'
  address: string
  phone?: string
  email?: string
  emergencyContact: string
  medicalInfo?: string
  notes?: string
  // Additional fields for frontend compatibility
  secondName?: string
  thirdName?: string
  nationality?: string
  studentId?: string
  photo?: string
  /** Present when loaded from API; used to scope admin views to the logged-in school */
  school_id?: number
  createdAt: Date
  updatedAt: Date
  user?: any
  parents?: any[]
  groups?: any[]
  buses?: { id: string; title: string }[]
  progress?: any[]
  payment_level_id?: string | null
  paymentLevel?: { id: string; code: string; name: string }
}

export interface CreateStudentRequest {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female'
  address: string
  phone?: string
  email?: string
  emergencyContact: string
  medicalInfo?: string
  notes?: string
  // Additional fields
  secondName?: string
  thirdName?: string
  nationality?: string
  studentId?: string
  photo?: string
  parentIds?: string[]
  userId?: string
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

export interface StudentProgress {
  student: Student
  progress: any[]
}

class StudentService extends BaseApiService {
  async getAll(): Promise<Student[]> {
    return this.get<Student[]>('/students')
  }

  async getById(id: string): Promise<Student> {
    return this.get<Student>(`/students/${id}`)
  }

  async create(studentData: CreateStudentRequest): Promise<Student> {
    return this.post<Student>('/students', studentData)
  }

  async update(id: string, studentData: UpdateStudentRequest): Promise<Student> {
    return this.patch<Student>(`/students/${id}`, studentData)
  }

  async deleteStudent(id: string): Promise<void> {
    await this.delete(`/students/${id}`)
  }

  async search(query: string): Promise<Student[]> {
    return this.get<Student[]>('/students/search', { q: query })
  }

  async getByGroup(groupId: string): Promise<Student[]> {
    return this.get<Student[]>(`/students/group/${groupId}`)
  }

  async getByBus(busId: string): Promise<Student[]> {
    return this.get<Student[]>(`/students/bus/${busId}`)
  }

  async getByParent(parentId: string): Promise<Student[]> {
    return this.get<Student[]>(`/students/parent/${parentId}`)
  }

  async getProgress(studentId: string): Promise<StudentProgress> {
    return this.get<StudentProgress>(`/students/${studentId}/progress`)
  }

  async uploadPhoto(studentId: string, photoFile: File): Promise<any> {
    const formData = new FormData()
    formData.append('photo', photoFile)
    return this.upload(`/files/student/${studentId}/photo`, formData)
  }

  async assignToGroup(
    studentId: string,
    groupId: string,
    options?: { paymentLevelId?: string; replaceExistingGroups?: boolean },
  ): Promise<Student> {
    return this.patch<Student>(`/students/${studentId}/assign-group`, {
      groupId,
      paymentLevelId: options?.paymentLevelId,
      replaceExistingGroups: options?.replaceExistingGroups,
    })
  }

  async assignToBus(studentId: string, busId: string): Promise<Student> {
    return this.patch<Student>(`/students/${studentId}/assign-bus`, { busId })
  }

  async removeFromBus(studentId: string, busId: string): Promise<Student> {
    return this.patch<Student>(`/students/${studentId}/remove-bus`, { busId })
  }

  async removeFromGroup(studentId: string, groupId: string): Promise<void> {
    await this.delete(`/students/${studentId}/groups/${groupId}`)
  }
}

export const studentService = new StudentService()
export default studentService

