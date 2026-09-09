import { BaseApiService } from './api'

export interface RegisteredSchoolOwner {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
}

export interface UpdateRegisteredSchoolRequest {
  name?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  description?: string | null
  owner_legal_name?: string | null
}

export interface RegisteredSchool {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  description: string | null
  logo_url: string | null
  owner_legal_name: string | null
  cr_document_url: string | null
  owner_id_document_url: string | null
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  created_at: string
  updated_at: string
  studentCount: number
  groupCount: number
  planCode: string | null
  billingPeriod: string | null
  subscriptionStatus: string | null
  invoiceStatus: string | null
  membershipFrom: string | null
  membershipTo: string | null
  owner: RegisteredSchoolOwner | null
}

class PlatformSchoolService extends BaseApiService {
  async listRegistered(): Promise<RegisteredSchool[]> {
    return this.get('/platform/schools')
  }

  async getOne(id: number): Promise<RegisteredSchool> {
    return this.get(`/platform/schools/${id}`)
  }

  /**
   * Registration documents are served behind JWT auth, so a plain <a href> gets a 401.
   * Fetch with the client's auth header and hand back an object URL to open.
   */
  async fetchDocument(path: string): Promise<string> {
    const url = path.replace(/^\/api/, '')
    const res = await this.client.get(url, { responseType: 'blob' })
    return URL.createObjectURL(res.data as Blob)
  }

  /** Correct the details a school submitted at registration. */
  async update(id: number, payload: UpdateRegisteredSchoolRequest): Promise<RegisteredSchool> {
    return this.put<RegisteredSchool>(`/platform/schools/${id}`, payload)
  }

  async approve(id: number): Promise<{ school: RegisteredSchool; admin_user_id: string }> {
    return this.post(`/platform/schools/${id}/approve`)
  }
}

export const platformSchoolService = new PlatformSchoolService()
export default platformSchoolService
