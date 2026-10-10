import { BaseApiService, apiClient } from './api'
import type { PageResult } from '@/composables/useServerPagination'
import axios from 'axios'
import { getApiBaseUrl } from '@/config/public-config'

export interface MedicalReport {
  id: string
  filename: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  first_name_ar?: string | null
  first_name_en?: string | null
  last_name_ar?: string | null
  last_name_en?: string | null
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
  secondNameEn?: string | null
  thirdNameEn?: string | null
  nationality?: string
  studentId?: string
  /** National/civil ID — used to create and sign in the student's login. */
  civil_id?: string | null
  photo?: string
  /** draft → active on final register submit; inactive for deactivated. */
  status?: 'draft' | 'active' | 'inactive'
  /** Present when loaded from API; used to scope admin views to the logged-in school */
  school_id?: string
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
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
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
  secondNameEn?: string | null
  thirdNameEn?: string | null
  nationality?: string
  studentId?: string
  civil_id?: string | null
  photo?: string
  parentIds?: string[]
  userId?: string
}

export interface RegisterStudentParentRequest {
  existingParentId?: string
  createNew?: boolean
  firstName?: string
  lastName?: string
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
  civil_id?: string
  email?: string
  phone?: string
  createUser?: boolean
  relationship?: 'father' | 'mother' | 'guardian'
  tribe?: string
  workplace?: string
  workPhone?: string
  maritalStatus?: string
  organizationName?: string
  responsiblePerson?: string
  responsiblePhone?: string
}

export interface RegisterStudentInAppRequest {
  firstName: string
  lastName: string
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
  secondName?: string
  thirdName?: string
  secondNameEn?: string
  thirdNameEn?: string
  tribe?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  address?: string
  phone?: string
  email?: string
  emergencyContact?: string
  medicalInfo?: string
  notes?: string
  nationality?: string
  studentId?: string
  civil_id?: string
  photo?: string
  groupId: string
  /** Complete a draft created after register step 1. */
  draftStudentId?: string
  createStudentUser?: boolean
  studentEmail?: string
  parent?: RegisterStudentParentRequest
}

export interface SaveStudentRegisterDraftRequest {
  draftStudentId?: string
  firstName: string
  lastName: string
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
  secondName?: string
  thirdName?: string
  secondNameEn?: string
  thirdNameEn?: string
  tribe?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  nationality?: string
  studentId?: string
  civil_id?: string
  photo?: string
  notes?: string
  address?: string
  medicalInfo?: string
  emergencyContact?: string
}

export interface SaveStudentRegisterDraftParentItem {
  relationship: 'father' | 'mother' | 'guardian'
  firstName?: string
  lastName?: string
  first_name_ar?: string
  first_name_en?: string
  last_name_ar?: string
  last_name_en?: string
  civil_id?: string
  email?: string
  phone?: string
  tribe?: string
  workplace?: string
  workPhone?: string
  maritalStatus?: string
  createUser?: boolean
}

export interface SaveStudentRegisterDraftParentsRequest {
  draftStudentId: string
  parents: SaveStudentRegisterDraftParentItem[]
  emergencyContact?: string
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

export interface StudentCivilLookupStudent {
  id: string
  school_id: string | null
  status: string
  first_name_ar: string | null
  first_name_en: string | null
  last_name_ar: string | null
  last_name_en: string | null
  secondName: string | null
  thirdName: string | null
  secondNameEn: string | null
  thirdNameEn: string | null
  tribe: string | null
  civil_id: string | null
  gender: string
  nationality: string | null
  dateOfBirth: string | Date
  photo: string | null
}

export interface StudentCivilLookupResult {
  exists: boolean
  same_school: boolean
  status: 'draft' | 'active' | 'inactive' | null
  already_registered: boolean
  allow_new: boolean
  /** Staff only: draft exists at another school — do not load; wait for that registration. */
  registration_in_progress_elsewhere?: boolean
  student: StudentCivilLookupStudent | null
}

export interface StudentProgress {
  student: Student
  progress: any[]
}

export interface StudentListParams {
  page?: number
  limit?: number
  q?: string
  fee_level?: 'all' | 'with' | 'without'
  group_id?: string
  bus_id?: string
  age_group?: 'toddlers' | 'preschool' | 'kindergarten'
  status?: 'draft' | 'active' | 'inactive'
}

class StudentService extends BaseApiService {
  private publicClient = (() => {
    const client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    })
    client.interceptors.request.use((config) => {
      config.baseURL = getApiBaseUrl()
      return config
    })
    return client
  })()

  async getAll(): Promise<Student[]> {
    // School lists can be large; default 10s axios timeout is too tight on mobile/WAN.
    // Prefer listPage() for heavy screens (e.g. /students/payments).
    return this.get<Student[]>('/students', undefined, { timeout: 60000 })
  }

  async listPage(params: StudentListParams): Promise<PageResult<Student>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.fee_level && params.fee_level !== 'all') query.fee_level = params.fee_level
    if (params.group_id) query.group_id = params.group_id
    if (params.bus_id) query.bus_id = params.bus_id
    if (params.age_group) query.age_group = params.age_group
    if (params.status) query.status = params.status
    return this.get('/students', query, { timeout: 60000 })
  }

  async getById(id: string): Promise<Student> {
    return this.get<Student>(`/students/${id}`)
  }

  async create(studentData: CreateStudentRequest): Promise<Student> {
    return this.post<Student>('/students', studentData)
  }

  async lookupByCivilId(civilId: string): Promise<StudentCivilLookupResult> {
    return this.get<StudentCivilLookupResult>('/students/lookup', { civil_id: civilId.trim() })
  }

  async lookupByCivilIdPublic(civilId: string, schoolId: string): Promise<StudentCivilLookupResult> {
    const response = await this.publicClient.get<{
      success: boolean
      data: StudentCivilLookupResult
      message?: string
    }>('/public/students/lookup', {
      params: { civil_id: civilId.trim(), school_id: schoolId.trim() },
    })
    if (response.data.success) return response.data.data
    throw new Error(response.data.message || 'Lookup failed')
  }

  async saveRegisterDraft(data: SaveStudentRegisterDraftRequest): Promise<Student> {
    return this.post<Student>('/students/register/draft', data, { timeout: 30000 })
  }

  async saveRegisterDraftParents(data: SaveStudentRegisterDraftParentsRequest): Promise<Student> {
    return this.post<Student>('/students/register/draft/parents', data, { timeout: 30000 })
  }

  async registerInApp(data: RegisterStudentInAppRequest): Promise<Student> {
    return this.post<Student>('/students/register', data, { timeout: 30000 })
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

  async listMedicalReports(studentId: string): Promise<MedicalReport[]> {
    return this.get<MedicalReport[]>(`/students/${studentId}/medical-reports`)
  }

  async uploadMedicalReport(studentId: string, file: File): Promise<MedicalReport> {
    const formData = new FormData()
    formData.append('file', file)
    return this.upload<MedicalReport>(`/students/${studentId}/medical-reports`, formData)
  }

  async downloadMedicalReport(studentId: string, reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/students/${studentId}/medical-reports/${reportId}/file`, {
      responseType: 'blob',
    })
    return response.data as Blob
  }

  async deleteMedicalReport(studentId: string, reportId: string): Promise<void> {
    await this.delete(`/students/${studentId}/medical-reports/${reportId}`)
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

