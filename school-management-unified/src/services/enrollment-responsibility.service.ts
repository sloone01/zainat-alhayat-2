import axios from 'axios'
import { BaseApiService } from './api'
import { getApiBaseUrl } from '@/config/public-config'

export type EnrollmentResponsibilityParty = 'school' | 'parent'

export type EnrollmentResponsibilityItem = {
  id: string
  school_id: string
  party: EnrollmentResponsibilityParty
  text_ar: string
  text_en: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type PublicEnrollmentResponsibilities = {
  school: EnrollmentResponsibilityItem[]
  parent: EnrollmentResponsibilityItem[]
}

export type UpsertEnrollmentResponsibilityPayload = {
  party: EnrollmentResponsibilityParty
  text_ar: string
  text_en: string
  sort_order?: number
  is_active?: boolean
}

const publicClient = (() => {
  const c = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })
  c.interceptors.request.use((config) => {
    config.baseURL = getApiBaseUrl()
    return config
  })
  return c
})()

class EnrollmentResponsibilityService extends BaseApiService {
  list(party?: EnrollmentResponsibilityParty): Promise<EnrollmentResponsibilityItem[]> {
    return this.get('/enrollment-responsibilities', party ? { party } : undefined)
  }

  create(payload: UpsertEnrollmentResponsibilityPayload): Promise<EnrollmentResponsibilityItem> {
    return this.post('/enrollment-responsibilities', payload)
  }

  update(
    id: string,
    payload: Partial<UpsertEnrollmentResponsibilityPayload>,
  ): Promise<EnrollmentResponsibilityItem> {
    return this.patch(`/enrollment-responsibilities/${id}`, payload)
  }

  remove(id: string): Promise<void> {
    return this.delete(`/enrollment-responsibilities/${id}`)
  }

  async listPublic(schoolId: string): Promise<PublicEnrollmentResponsibilities> {
    const res = await publicClient.get<{
      success: boolean
      data: PublicEnrollmentResponsibilities
    }>('/public/enrollment-responsibilities', { params: { school_id: schoolId } })
    if (!res.data.success) throw new Error('Failed to load responsibilities')
    return res.data.data ?? { school: [], parent: [] }
  }
}

export const enrollmentResponsibilityService = new EnrollmentResponsibilityService()

export function responsibilityDisplayText(
  item: Pick<EnrollmentResponsibilityItem, 'text_ar' | 'text_en'>,
  locale: string,
): string {
  const preferAr = locale.startsWith('ar')
  const primary = preferAr ? item.text_ar : item.text_en
  const fallback = preferAr ? item.text_en : item.text_ar
  return (primary || fallback || '').trim()
}
