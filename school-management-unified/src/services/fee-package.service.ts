import { BaseApiService } from './api'

export interface FeePackageListRow {
  id: string
  school_id: number
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
  school_id: number
  name: string
  currency: string
  year_payment_mode: 'one_time' | 'installments' | 'both' | null
  course_pricing_basis: 'grade' | 'phase' | null
  is_active: boolean
  charge_type_ids: string[]
  discount_type_ids: string[]
  installments: FeePackageInstallmentInput[]
  level_amounts: FeePackageLevelAmountInput[]
  level_period_settings?: FeePackageLevelPeriodSettingInput[]
  course_amounts: FeePackageCourseAmountInput[]
}

export interface UpsertFeePackagePayload {
  school_id: number
  name: string
  currency?: string
  year_payment_mode?: 'one_time' | 'installments' | 'both' | null
  course_pricing_basis?: 'grade' | 'phase' | null
  is_active?: boolean
  charge_type_ids: string[]
  discount_type_ids?: string[]
  installments?: FeePackageInstallmentInput[]
  level_amounts: FeePackageLevelAmountInput[]
  level_period_settings?: FeePackageLevelPeriodSettingInput[]
  course_amounts: FeePackageCourseAmountInput[]
}

class FeePackageService extends BaseApiService {
  list(schoolId: number) {
    return this.get<FeePackageListRow[]>('/fee-packages', { school_id: schoolId })
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
