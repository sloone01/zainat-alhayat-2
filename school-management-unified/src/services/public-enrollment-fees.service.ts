import axios from 'axios'
import { getApiBaseUrl } from '@/config/public-config'

export type PublicEnrollmentPlanRow = {
  id: string
  name: string
  description: string | null
  entries: Array<{
    sequence: number
    month_number: number | null
    label: string | null
    weight: string
  }>
}

export type PublicEnrollmentFeePreview = {
  currency: string
  level: { id: string; code: string; name: string } | null
  plan: PublicEnrollmentPlanRow | null
  charges: Array<{
    charge_type_id: string
    label: string
    amount: string
    payment_timing: 'upfront' | 'installment'
  }>
  inclusions: Array<{ id: string; code: string; label: string }>
  list_total: string
  advance_due: string
  installment_due: string
  schedule: Array<{
    sequence: number
    kind: 'advance' | 'installment'
    month_number: number | null
    label: string | null
    amount: string
  }>
}

class PublicEnrollmentFeesService {
  private client = (() => {
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

  async listPlans(schoolId: string): Promise<PublicEnrollmentPlanRow[]> {
    const res = await this.client.get<{ success: boolean; data: PublicEnrollmentPlanRow[] }>(
      '/public/enrollment-fees/plans',
      { params: { school_id: schoolId } },
    )
    if (!res.data.success) throw new Error('Failed to load installment plans')
    return res.data.data ?? []
  }

  async preview(
    schoolId: string,
    gradeLevel: string,
    installmentPlanId: string,
  ): Promise<PublicEnrollmentFeePreview> {
    const res = await this.client.get<{ success: boolean; data: PublicEnrollmentFeePreview }>(
      '/public/enrollment-fees/preview',
      {
        params: {
          school_id: schoolId,
          grade_level: gradeLevel,
          installment_plan_id: installmentPlanId,
        },
      },
    )
    if (!res.data.success) throw new Error('Failed to load fee preview')
    return res.data.data
  }
}

export const publicEnrollmentFeesService = new PublicEnrollmentFeesService()
