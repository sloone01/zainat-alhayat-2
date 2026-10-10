import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export type PlatformBillingPeriod = 'monthly' | 'semester' | 'yearly' | 'summer'

export interface PlatformPlanPrice {
  billing_period: PlatformBillingPeriod
  /** Minimum fee for the period. */
  amount_omr: number
  per_student_omr: number
}

export interface PlatformPlanFeatureBullet {
  key: string
  label_en: string
  label_ar: string
}

export interface PlatformPlan {
  id: number
  code: string
  name_en: string
  name_ar: string
  description_en: string | null
  description_ar: string | null
  min_students: number
  /** Null = no upper limit. */
  max_students: number | null
  sort_order: number
  is_active: boolean
  prices: PlatformPlanPrice[]
  /** Marketing bullets for public package cards. */
  features: PlatformPlanFeatureBullet[]
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

export interface SchoolModuleGrant extends PlatformModule {
  granted: boolean
  source: 'plan' | 'addon' | 'manual' | null
}

export interface CreatePlatformPlanRequest {
  code: string
  name_en: string
  name_ar: string
  description_en?: string | null
  description_ar?: string | null
  min_students?: number
  max_students?: number | null
  is_active?: boolean
  module_codes?: string[]
  prices?: PlatformPlanPrice[]
}

export interface PlatformPlansCatalog {
  plans: PlatformPlan[]
  addons: PlatformAddon[]
  /** Present on the public catalog: labels for the module codes a plan lists. */
  modules?: PlatformModule[]
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
  id: string
  school_id: string
  subscription_id: string
  kind: 'subscription' | 'proration'
  billing_period: PlatformBillingPeriod
  period_start: string
  period_end: string
  base_amount: number
  students_billed: number
  minimum_omr: number
  per_student_omr: number
  discount_amount: number
  discount_id: string | null
  addons_amount: number
  total_amount: number
  status: string
  paid_at: string | null
  paid_note: string | null
  paid_amount: number | null
  paid_receipt_url: string | null
  line_items: Record<string, unknown>[] | null
  created_at: string
}

export interface PlatformSubscriptionDetail {
  id: number
  school_id: string
  plan_id: number
  plan_code: string | null
  plan_name_en: string | null
  plan_name_ar: string | null
  billing_period: PlatformBillingPeriod
  status: string
  period_start: string
  period_end: string
  billed_students: number
  max_students: number | null
  over_plan_limit: boolean
  promo_discount_id: string | null
  notes: string | null
  addon_codes: string[]
  created_at: string
  updated_at: string
}

export interface SchoolSubscriptionBundle {
  school: { id: number; name: string; status: string }
  /** Active students (the billable count). */
  studentCount: number
  subscription: PlatformSubscriptionDetail | null
  promo_discount: PlatformDiscount | null
  invoices: PlatformInvoice[]
}

export type PlatformDiscountKind = 'package' | 'school' | 'promo'
export type PlatformDiscountType = 'percent' | 'fixed'

export interface PlatformDiscount {
  id: string
  kind: PlatformDiscountKind
  name_en: string
  name_ar: string
  code: string | null
  discount_type: PlatformDiscountType
  value: number
  plan_id: string | null
  plan_code: string | null
  school_id: string | null
  school_name: string | null
  billing_periods: PlatformBillingPeriod[]
  starts_on: string | null
  ends_on: string | null
  duration_periods: number | null
  max_redemptions: number | null
  redemption_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlatformDiscountPayload {
  kind: PlatformDiscountKind
  name_en: string
  name_ar: string
  code?: string | null
  discount_type: PlatformDiscountType
  value: number
  plan_code?: string | null
  school_id?: string | null
  billing_periods?: PlatformBillingPeriod[]
  starts_on?: string | null
  ends_on?: string | null
  duration_periods?: number | null
  max_redemptions?: number | null
  is_active?: boolean
}

export interface PromoPreview {
  code: string
  name_en: string
  name_ar: string
  discount_type: PlatformDiscountType
  value: number
  duration_periods: number | null
}

export interface UpsertSubscriptionPayload {
  plan_code: string
  billing_period: PlatformBillingPeriod
  period_start?: string
  period_end?: string
  status?: string
  addon_codes?: string[]
  notes?: string | null
  activate_school?: boolean
  school_status?: 'pending' | 'pending_payment' | 'active' | 'suspended' | 'rejected'
}

class PlatformBillingApiService extends BaseApiService {
  /** Modules a school has, with where each came from ('plan' | 'addon' | 'manual'). */
  listSchoolModules(schoolId: string): Promise<{ modules: SchoolModuleGrant[] }> {
    return this.get(`/platform/schools/${schoolId}/modules`)
  }

  /** Replace this school's manual module grants; plan-sourced modules are untouched. */
  setSchoolModules(
    schoolId: string,
    moduleCodes: string[],
  ): Promise<{ modules: SchoolModuleGrant[] }> {
    return this.put(`/platform/schools/${schoolId}/modules`, { module_codes: moduleCodes })
  }

  listPublicPlans(): Promise<PlatformPlansCatalog> {
    return this.get('/public/platform-plans')
  }

  createPlan(payload: CreatePlatformPlanRequest): Promise<PlatformPlanDetail> {
    return this.post('/platform/plans', payload)
  }

  deletePlan(code: string): Promise<{ code: string; deleted: boolean }> {
    return this.delete(`/platform/plans/${code}`)
  }

  listAdminPlans(): Promise<PlatformPlansCatalog> {
    return this.get('/platform/plans')
  }

  listAdminPlansPage(params: { page: number; limit: number; q?: string; status?: string }) {
    const query: Record<string, string | number> = { page: params.page, limit: params.limit }
    if (params.q?.trim()) query.q = params.q.trim()
    if (params.status && params.status !== 'all') query.status = params.status
    return this.get<
      PageResult<PlatformPlansCatalog['plans'][number]> & {
        stats?: { total: number; active: number; seats: number }
      }
    >('/platform/plans', query)
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
      min_students?: number
      max_students?: number | null
      is_active?: boolean
      module_codes?: string[]
      features?: { label_en: string; label_ar: string }[]
      prices?: PlatformPlanPrice[]
    },
  ): Promise<PlatformPlanDetail> {
    return this.put(`/platform/plans/${encodeURIComponent(code)}`, payload, { timeout: 60000 })
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

  getSchoolSubscription(schoolId: string): Promise<SchoolSubscriptionBundle> {
    return this.get(`/platform/schools/${schoolId}/subscription`)
  }

  upsertSchoolSubscription(
    schoolId: string,
    payload: UpsertSubscriptionPayload,
  ): Promise<SchoolSubscriptionBundle> {
    return this.put(`/platform/schools/${schoolId}/subscription`, payload)
  }

  issueInvoice(schoolId: string): Promise<PlatformInvoice> {
    return this.post(`/platform/schools/${schoolId}/invoices`, {})
  }

  markInvoicePaid(invoiceId: string, formData: FormData): Promise<PlatformInvoice> {
    return this.upload(`/platform/invoices/${invoiceId}/mark-paid`, formData)
  }

  /** Bills students activated since the period was invoiced; null when nothing is due. */
  issueProrationInvoice(schoolId: string): Promise<PlatformInvoice | null> {
    return this.post(`/platform/schools/${schoolId}/invoices/proration`, {})
  }

  listDiscounts(): Promise<PlatformDiscount[]> {
    return this.get('/platform/discounts')
  }

  createDiscount(payload: PlatformDiscountPayload): Promise<PlatformDiscount> {
    return this.post('/platform/discounts', payload)
  }

  updateDiscount(id: string, payload: PlatformDiscountPayload): Promise<PlatformDiscount> {
    return this.put(`/platform/discounts/${id}`, payload)
  }

  deleteDiscount(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.delete(`/platform/discounts/${id}`)
  }

  previewPromo(params: {
    code: string
    plan_code: string
    billing_period: PlatformBillingPeriod
  }): Promise<PromoPreview> {
    return this.get('/public/platform-plans/promo', params)
  }
}

export const platformBillingService = new PlatformBillingApiService()
export default platformBillingService
