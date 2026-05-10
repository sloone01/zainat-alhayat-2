import { BaseApiService } from './api'
import { getApiBaseUrl } from '@/config/public-config'
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

export interface EnrollmentFormData {
  student: StudentDetails
  academic: AcademicInfo
  health: HealthInfo
  guardian: GuardianInfo
  address: AddressInfo
}

export interface Enrollment {
  id: string
  fullName: string
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
  guardianType: 'father' | 'mother' | 'other'
  fatherFullName?: string
  fatherTribe?: string
  fatherWorkplace?: string
  fatherWorkPhone?: string
  fatherMobile?: string
  fatherEmail?: string
  fatherMaritalStatus?: string
  motherFullName?: string
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
  status: 'pending' | 'approved' | 'rejected' | 'enrolled'
  notes?: string
  studentId?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
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

  async submitEnrollment(enrollmentData: EnrollmentFormData): Promise<Enrollment> {
    // Convert File objects to base64 strings for medical reports
    const processedData = { ...enrollmentData }

    if (enrollmentData.health.medicalReports && enrollmentData.health.medicalReports.length > 0) {
      const medicalReportsBase64: string[] = []

      for (const file of enrollmentData.health.medicalReports) {
        const base64 = await this.fileToBase64(file)
        medicalReportsBase64.push(base64)
      }

      processedData.health.medicalReports = medicalReportsBase64 as any
    }

    // Convert photo to base64 if exists
    if (enrollmentData.student.photo && enrollmentData.student.photo instanceof File) {
      processedData.student.photo = await this.fileToBase64(enrollmentData.student.photo as any)
    }

    // Use the public client for enrollment submission (no auth required)
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

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const enrollmentService = new EnrollmentService()
export default enrollmentService