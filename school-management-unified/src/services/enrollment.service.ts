import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'
import { getApiBaseUrl } from '@/config/public-config'

export interface EnrollmentListParams {
  page?: number
  limit?: number
  q?: string
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'enrolled' | ''
  grade?: string
}
import axios, { type AxiosInstance } from 'axios'

export interface StudentDetails {
  fullName: string
  tribe?: string
  idNumber?: string
  gender: 'male' | 'female'
  nationality?: string
  religion?: string
  dateOfBirth?: Date | null
  age?: number | null
  hasSiblings?: boolean
  photo?: string | null
}

export interface AcademicInfo {
  enrollmentStatus: 'new' | 'transfer'
  gradeLevel?: string
  previousSchool?: string
}

export interface HealthInfo {
  allergies?: boolean
  allergiesDetails?: string
  seizures?: boolean
  seizuresDetails?: string
  surgeries?: boolean
  surgeriesDetails?: string
  chronicDiseases?: boolean
  chronicDiseasesDetails?: string
  other?: string
  medicalReports?: File[]
}

export interface FatherInfo {
  fullName?: string
  tribe?: string
  workplace?: string
  workPhone?: string
  mobile?: string
  email?: string
  maritalStatus?: string
}

export interface MotherInfo {
  fullName?: string
  tribe?: string
  workplace?: string
  workPhone?: string
  mobile?: string
  email?: string
  maritalStatus?: string
}

export interface OtherGuardianInfo {
  organizationName?: string
  phone?: string
  responsiblePerson?: string
  responsiblePhone?: string
}

export interface EmergencyContact {
  fullName?: string
  tribe?: string
  workplace?: string
  workPhone?: string
  mobile?: string
  relationship?: string
}

export interface GuardianInfo {
  type: 'father' | 'mother' | 'other'
  fatherInfo?: FatherInfo
  motherInfo?: MotherInfo
  otherInfo?: OtherGuardianInfo
  emergencyContact?: EmergencyContact
}

export interface AddressInfo {
  area?: string
  village?: string
  landmark?: string
  streetNumber?: string
  alleyNumber?: string
  buildingNumber?: string
  housingType: 'house' | 'apartment'
}

export interface EnrollmentDocuments {
  parentIdDocuments: (File | string)[]
  birthCertificate: File | string | null
  childIdDocument: File | string | null
}

export interface EnrollmentFormData {
  /** Target school for the application (required by API) */
  school_id: string
  student: StudentDetails
  academic: AcademicInfo
  health: HealthInfo
  guardian: GuardianInfo
  address: AddressInfo
  documents: EnrollmentDocuments
  /** Selected fees v2 installment plan (optional until payment step). */
  installment_plan_id?: string | null
}

export interface Enrollment {
  id: string
  fullName: string
  first_name_ar?: string | null
  first_name_en?: string | null
  last_name_ar?: string | null
  last_name_en?: string | null
  secondName?: string | null
  thirdName?: string | null
  secondNameEn?: string | null
  thirdNameEn?: string | null
  tribe?: string
  idNumber?: string
  gender: 'male' | 'female'
  nationality?: string
  religion?: string
  dateOfBirth?: Date
  age?: number
  hasSiblings: boolean
  photo?: string
  enrollmentStatus: 'new' | 'transfer'
  gradeLevel?: string
  previousSchool?: string
  allergies: boolean
  allergiesDetails?: string
  seizures: boolean
  seizuresDetails?: string
  surgeries: boolean
  surgeriesDetails?: string
  chronicDiseases: boolean
  chronicDiseasesDetails?: string
  otherHealthInfo?: string
  medicalReports?: string[]
  parentIdDocuments?: string[]
  birthCertificate?: string | null
  childIdDocument?: string | null
  guardianType: 'father' | 'mother' | 'other'
  fatherFullName?: string
  father_first_name_ar?: string | null
  father_first_name_en?: string | null
  father_last_name_ar?: string | null
  father_last_name_en?: string | null
  father_civil_id?: string | null
  fatherTribe?: string
  fatherWorkplace?: string
  fatherWorkPhone?: string
  fatherMobile?: string
  fatherEmail?: string
  fatherMaritalStatus?: string
  motherFullName?: string
  mother_first_name_ar?: string | null
  mother_first_name_en?: string | null
  mother_last_name_ar?: string | null
  mother_last_name_en?: string | null
  mother_civil_id?: string | null
  motherTribe?: string
  motherWorkplace?: string
  motherWorkPhone?: string
  motherMobile?: string
  motherEmail?: string
  motherMaritalStatus?: string
  organizationName?: string
  organizationPhone?: string
  responsiblePerson?: string
  responsiblePhone?: string
  emergencyContactName?: string
  emergencyContactTribe?: string
  emergencyContactWorkplace?: string
  emergencyContactWorkPhone?: string
  emergencyContactMobile?: string
  emergencyContactRelationship?: string
  area?: string
  village?: string
  landmark?: string
  streetNumber?: string
  alleyNumber?: string
  buildingNumber?: string
  housingType: 'house' | 'apartment'
  school_id?: string
  installment_plan_id?: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'enrolled'
  /** Present on public-form drafts only — wizard snapshot. */
  draft_payload?: Record<string, unknown> | null
  notes?: string
  studentId?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export type EnrollmentDraftSource = 'public_enrollment'

export interface PublicEnrollmentDraftLookup {
  exists: boolean
  same_school: boolean
  status: 'draft' | 'pending' | 'approved' | 'enrolled' | null
  already_registered: boolean
  allow_new: boolean
  source: EnrollmentDraftSource
  enrollment_draft: {
    id: string
    payload: Record<string, unknown> | null
    updatedAt?: string | Date
  } | null
}

class EnrollmentService extends BaseApiService {
  private readonly basePath = '/enrollments'

  // Create a separate client for public enrollment submission (no auth).
  // Resolves the API base via getApiBaseUrl() (runtime config or build-time env), with a per-request override.
  private publicClient = (() => {
    const client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    client.interceptors.request.use((config) => {
      config.baseURL = getApiBaseUrl()
      return config
    })
    return client
  })()

  async savePublicDraft(options: {
    school_id: string
    civil_id: string
    draftEnrollmentId?: string | null
    payload: Record<string, unknown>
  }): Promise<{ id: string; draft_payload: Record<string, unknown> | null; source: EnrollmentDraftSource }> {
    const response = await this.publicClient.post<{
      success: boolean
      data: { id: string; draft_payload: Record<string, unknown> | null; source: EnrollmentDraftSource }
    }>('/public/enrollments/draft', {
      school_id: options.school_id,
      civil_id: options.civil_id,
      draftEnrollmentId: options.draftEnrollmentId || undefined,
      payload: options.payload,
    })
    if (!response.data?.success) throw new Error('Failed to save enrollment draft')
    return response.data.data
  }

  async lookupPublicDraft(civilId: string, schoolId: string): Promise<PublicEnrollmentDraftLookup> {
    const response = await this.publicClient.get<{
      success: boolean
      data: PublicEnrollmentDraftLookup
    }>('/public/enrollments/lookup', {
      params: { civil_id: civilId.trim(), school_id: schoolId.trim() },
    })
    return response.data.data
  }

  async uploadPublicAttachment(
    file: File,
    schoolId: string,
    purpose:
      | 'enrollment_parent_id'
      | 'enrollment_birth_certificate'
      | 'enrollment_child_id'
      | 'enrollment_photo',
  ): Promise<{ id: string; url: string; file_name: string; size_bytes: number }> {
    const form = new FormData()
    form.append('file', file)
    form.append('school_id', schoolId)
    form.append('purpose', purpose)
    const response = await this.publicClient.post<{
      success: boolean
      data: { id: string; url: string; file_name: string; size_bytes: number }
    }>('/public/enrollments/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!response.data?.success || !response.data.data?.url) {
      throw new Error('Failed to upload attachment')
    }
    return response.data.data
  }

  private sanitizeEnrollmentPayload(data: EnrollmentFormData): EnrollmentFormData {
    // File / Blob cannot be structuredClone'd — strip media first, then JSON-clone.
    const safe = {
      school_id: data.school_id,
      installment_plan_id: data.installment_plan_id ?? null,
      student: {
        ...data.student,
        photo: typeof data.student.photo === 'string' ? data.student.photo : null,
        dateOfBirth:
          data.student.dateOfBirth instanceof Date
            ? data.student.dateOfBirth.toISOString().slice(0, 10)
            : data.student.dateOfBirth,
      },
      academic: { ...data.academic },
      health: {
        ...data.health,
        medicalReports: [] as string[],
      },
      guardian: data.guardian,
      address: { ...data.address },
      documents: {
        parentIdDocuments: (data.documents?.parentIdDocuments || []).filter(
          (f): f is string => typeof f === 'string',
        ),
        birthCertificate:
          typeof data.documents?.birthCertificate === 'string' ? data.documents.birthCertificate : null,
        childIdDocument:
          typeof data.documents?.childIdDocument === 'string' ? data.documents.childIdDocument : null,
      },
    }
    const out = JSON.parse(JSON.stringify(safe)) as EnrollmentFormData

    const blank = (v: string | undefined | null) =>
      v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

    const cleanEmail = (email?: string) => (blank(email) ? undefined : email?.trim())

    if (out.guardian.fatherInfo) {
      out.guardian.fatherInfo.email = cleanEmail(out.guardian.fatherInfo.email)
    }
    if (out.guardian.motherInfo) {
      out.guardian.motherInfo.email = cleanEmail(out.guardian.motherInfo.email)
    }

    // Keep both parents when filled. Only drop the unused organisation block.
    if (out.guardian.type !== 'other') {
      out.guardian.otherInfo = undefined
    }

    return out
  }

  async submitEnrollment(enrollmentData: EnrollmentFormData): Promise<Enrollment> {
    // Documents/photo must already be attachment download paths (uploaded via GCS pipeline).
    const processedData = this.sanitizeEnrollmentPayload(enrollmentData)

    if (enrollmentData.health.medicalReports && enrollmentData.health.medicalReports.length > 0) {
      // Medical reports on the public form are optional legacy; ignore File blobs.
      processedData.health.medicalReports = (enrollmentData.health.medicalReports as unknown[])
        .filter((f): f is string => typeof f === 'string' && f.startsWith('/api/attachments/')) as any
    }

    if (typeof enrollmentData.student.photo === 'string') {
      processedData.student.photo = enrollmentData.student.photo
    } else {
      processedData.student.photo = null
    }

    const docs = enrollmentData.documents || {
      parentIdDocuments: [],
      birthCertificate: null,
      childIdDocument: null,
    }
    const parentDocs = (docs.parentIdDocuments || []).filter(
      (f): f is string => typeof f === 'string' && f.startsWith('/api/attachments/'),
    )
    const birthCertificate =
      typeof docs.birthCertificate === 'string' && docs.birthCertificate.startsWith('/api/attachments/')
        ? docs.birthCertificate
        : null
    const childIdDocument =
      typeof docs.childIdDocument === 'string' && docs.childIdDocument.startsWith('/api/attachments/')
        ? docs.childIdDocument
        : null
    if (!parentDocs.length || !birthCertificate || !childIdDocument) {
      throw new Error('Documents must be uploaded before submit')
    }
    processedData.documents = {
      parentIdDocuments: parentDocs,
      birthCertificate,
      childIdDocument,
    }

    const response = await this.publicClient.post<{
      success: boolean
      data: Enrollment
      message?: string
    }>(this.basePath, processedData)

    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to submit enrollment')
    }
  }

  async getEnrollments(status?: 'pending' | 'approved' | 'rejected' | 'enrolled'): Promise<Enrollment[]> {
    const params = status ? { status } : undefined
    return this.get<Enrollment[]>(this.basePath, params)
  }

  /** Server-paged applications list (the management screen). */
  async listPage(params: EnrollmentListParams): Promise<PageResult<Enrollment>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.status) query.status = params.status
    if (params.grade) query.grade = params.grade
    return this.get(this.basePath, query)
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    return this.get<Enrollment>(`${this.basePath}/${id}`)
  }

  async updateEnrollment(id: string, data: Partial<EnrollmentFormData>): Promise<Enrollment> {
    return this.patch<Enrollment>(`${this.basePath}/${id}`, data)
  }

  async approveEnrollment(id: string, notes?: string): Promise<Enrollment> {
    return this.patch<Enrollment>(`${this.basePath}/${id}/approve`, { notes })
  }

  async rejectEnrollment(id: string, notes: string): Promise<Enrollment> {
    return this.patch<Enrollment>(`${this.basePath}/${id}/reject`, { notes })
  }

  async deleteEnrollment(id: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/${id}`)
  }

  async downloadDocument(id: string): Promise<ArrayBuffer> {
    const response = await this.client.get(`${this.basePath}/${id}/document`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    return response.data
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const enrollmentService = new EnrollmentService()
export default enrollmentService