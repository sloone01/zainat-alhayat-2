import { BaseApiService } from './api'

export type PlatformBillingPeriod = 'monthly' | 'semester' | 'yearly' | 'summer'

export interface PlatformPlanPrice {
  billing_period: PlatformBillingPeriod
  amount_omr: number
}

export interface PlatformPlan {
  id: number
  code: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  included_student_seats: number
  overage_per_student_omr: number
  sort_order: number
  is_active: boolean
  prices: PlatformPlanPrice[]
  features: string[]
  module_codes?: string[]
}

export interface PlatformModule {
  id: number
  code: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  amount_omr: number
  page_keys: string[]
  sort_order: number
  is_active: boolean
  included?: boolean
}

export interface PlatformAddon {
  id: number
  code: string
  name_en: string
  name_ar: string
  amount_omr: number
  feature_key: string | null
  is_active: boolean
}

export interface PlatformPlansCatalog {
  plans: PlatformPlan[]
  addons: PlatformAddon[]
  billing_periods: PlatformBillingPeriod[]
}

export interface PlatformModulesCatalog {
  modules: PlatformModule[]
  billing_periods: PlatformBillingPeriod[]
}

export interface PlatformPlanDetail {
  plan: PlatformPlan
  modules: PlatformModule[]
  billing_periods: PlatformBillingPeriod[]
}

export interface PlatformInvoice {
  id: number
  school_id: number
  subscription_id: number
  billing_period: PlatformBillingPeriod
  period_start: string
  period_end: string
  base_amount: number
  seats_included: number
  seats_used: number
  overage_amount: number
  addons_amount: number
  total_amount: number
  status: string
  paid_at: string | null
  paid_note: string | null
  line_items: Record<string, unknown>[] | null
  created_at: string
}

export interface PlatformSubscriptionDetail {
  id: number
  school_id: number
  plan_id: number
  plan_code: string | null
  plan_name_en: string | null
  plan_name_ar: string | null
  billing_period: PlatformBillingPeriod
  status: string
  period_start: string
  period_end: string
  included_student_seats_override: number | null
  included_student_seats: number | null
  notes: string | null
  addon_codes: string[]
  created_at: string
  updated_at: string
}

export interface SchoolSubscriptionBundle {
  school: { id: number; name: string; status: string }
  studentCount: number
  subscription: PlatformSubscriptionDetail | null
  invoices: PlatformInvoice[]
}

export interface UpsertSubscriptionPayload {
  plan_code: string
  billing_period: PlatformBillingPeriod
  period_start?: string
  period_end?: string
  status?: string
  included_student_seats_override?: number | null
  addon_codes?: string[]
  notes?: string | null
  activate_school?: boolean
  school_status?: 'pending' | 'active' | 'suspended' | 'rejected'
}

class PlatformBillingApiService extends BaseApiService {
  listPublicPlans(): Promise<PlatformPlansCatalog> {
    return this.get('/public/platform-plans')
  }

  listAdminPlans(): Promise<PlatformPlansCatalog> {
    return this.get('/platform/plans')
  }

  getPlanDetail(code: string): Promise<PlatformPlanDetail> {
    return this.get(`/platform/plans/${encodeURIComponent(code)}`)
  }

  updatePlan(
    code: string,
    payload: {
      name_en?: string
      name_ar?: string
      description_en?: string | null
      description_ar?: string | null
      included_student_seats?: number
      overage_per_student_omr?: number
      is_active?: boolean
      module_codes?: string[]
      prices?: PlatformPlanPrice[]
    },
  ): Promise<PlatformPlanDetail> {
    return this.put(`/platform/plans/${encodeURIComponent(code)}`, payload)
  }

  listModules(): Promise<PlatformModulesCatalog> {
    return this.get('/platform/modules')
  }

  updateModule(
    code: string,
    payload: {
      name_en?: string
      name_ar?: string
      description_en?: string | null
      description_ar?: string | null
      page_keys?: string[]
      is_active?: boolean
      amount_omr?: number
    },
  ): Promise<PlatformModule> {
    return this.put(`/platform/modules/${encodeURIComponent(code)}`, payload)
  }

  getSchoolSubscription(schoolId: number): Promise<SchoolSubscriptionBundle> {
    return this.get(`/platform/schools/${schoolId}/subscription`)
  }

  upsertSchoolSubscription(
    schoolId: number,
    payload: UpsertSubscriptionPayload,
  ): Promise<SchoolSubscriptionBundle> {
    return this.put(`/platform/schools/${schoolId}/subscription`, payload)
  }

  issueInvoice(schoolId: number): Promise<PlatformInvoice> {
    return this.post(`/platform/schools/${schoolId}/invoices`, {})
  }

  markInvoicePaid(
    invoiceId: number,
    payload: { paid_note?: string; activate_school?: boolean } = {},
  ): Promise<PlatformInvoice> {
    return this.post(`/platform/invoices/${invoiceId}/mark-paid`, payload)
  }
}

export const platformBillingService = new PlatformBillingApiService()
export default platformBillingService
