import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export interface FeePackageListParams {
  page?: number
  limit?: number
  q?: string
  status?: 'all' | 'active' | 'inactive' | ''
  schoolId?: string
}

/** Row the packages screen lists and toggles. Charge lines are loaded for that page only. */
export interface FeePackagePageRow {
  id: string
  school_id: string
  name: string
  currency: string
  is_active: boolean
  charge_lines: Array<{
    charge_type_id: string
    charge_type?: { id: string; code: string; label: string } | null
    payment_timing: 'upfront' | 'installment'
    billing_frequency: 'per_year' | 'once_only'
  }>
  discount_type_ids: string[]
  extra_type_ids: string[]
  inclusion_type_ids: string[]
}

export interface FeePackageListRow {
  id: string
  school_id: string
  name: string
  currency: string
  year_payment_mode: 'one_time' | 'installments' | 'both' | null
  course_pricing_basis: 'grade' | 'phase' | null
  is_active: boolean
  level_count: number
  course_count: number
  created_at: string
  updated_at: string
}

export interface FeePackageInstallmentInput {
  sequence: number
  month_number?: number | null
  label?: string | null
  amount: number
}

export type FeePackageLevelBillingPeriod = 'monthly' | 'semester' | 'yearly'

export interface FeePackageLevelAmountInput {
  level_id: string
  charge_type_id: string
  billing_period: FeePackageLevelBillingPeriod
  amount: number
}

export interface FeePackageCourseAmountInput {
  course_id: string
  charge_type_id: string
  amount: number
}

export interface FeePackageLevelPeriodSettingInput {
  level_id: string
  billing_period: FeePackageLevelBillingPeriod
  downpayment_amount: number
  installment_schedule_months?: number[]
}

export interface FeePackageDetail {
  id: string
  school_id: string
  name: string
  currency: string
  year_payment_mode: 'one_time' | 'installments' | 'both' | null
  course_pricing_basis: 'grade' | 'phase' | null
  is_active: boolean
  charge_type_ids: string[]
  discount_type_ids: string[]
  extra_type_ids: string[]
  inclusion_type_ids: string[]
  installments: FeePackageInstallmentInput[]
  level_amounts: FeePackageLevelAmountInput[]
  level_period_settings?: FeePackageLevelPeriodSettingInput[]
  course_amounts: FeePackageCourseAmountInput[]
}

export interface UpsertFeePackagePayload {
  school_id: string
  name: string
  currency?: string
  year_payment_mode?: 'one_time' | 'installments' | 'both' | null
  course_pricing_basis?: 'grade' | 'phase' | null
  is_active?: boolean
  charge_type_ids: string[]
  discount_type_ids?: string[]
  extra_type_ids?: string[]
  inclusion_type_ids?: string[]
  installments?: FeePackageInstallmentInput[]
  level_amounts: FeePackageLevelAmountInput[]
  level_period_settings?: FeePackageLevelPeriodSettingInput[]
  course_amounts: FeePackageCourseAmountInput[]
}

class FeePackageService extends BaseApiService {
  list(schoolId: string) {
    return this.get<FeePackageListRow[]>('/fee-packages', { school_id: schoolId })
  }

  listPage(params: FeePackageListParams) {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.status && params.status !== 'all') query.status = params.status
    if (params.schoolId) query.school_id = params.schoolId
    return this.get<PageResult<FeePackagePageRow>>('/fee-packages', query)
  }

  getOne(id: string) {
    return this.get<FeePackageDetail>(`/fee-packages/${id}`)
  }

  create(body: UpsertFeePackagePayload) {
    return this.post<FeePackageDetail>('/fee-packages', body)
  }

  update(id: string, body: UpsertFeePackagePayload) {
    return this.put<FeePackageDetail>(`/fee-packages/${id}`, body)
  }

  remove(id: string) {
    return this.delete(`/fee-packages/${id}`)
  }
}

export const feePackageService = new FeePackageService()
export default feePackageService
