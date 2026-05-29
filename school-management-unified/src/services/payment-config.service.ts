import { BaseApiService } from './api'

export interface SchoolPaymentLevel {
  id: string
  school_id: number
  code: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** From GET /payment-config/levels-summary — one row per system grade + payment profile status. */
export type SchoolPaymentLevelSummary = SchoolPaymentLevel & {
  profile_configured: boolean
  grade_id: string
  name_en: string
  name_ar: string
  fee_package_id?: string | null
  fee_package_name?: string | null
}

export interface GradePaymentLinkApi {
  id: string
  code: string
  name_en: string
  name_ar: string
  is_active: boolean
}

/** How often this charge applies (metadata; billing rules TBD). */
export type PaymentChargeBillingOccurrence = 'per_year' | 'once_ever' | 'other'

export const PAYMENT_CHARGE_BILLING_OCCURRENCES: PaymentChargeBillingOccurrence[] = [
  'per_year',
  'once_ever',
  'other',
]

export interface PaymentCatalogRow {
  id: string
  school_id: number
  code: string
  label: string
  value: string | null
  sort_order: number
  is_active: boolean
  billing_occurrence?: PaymentChargeBillingOccurrence
  created_at: string
  updated_at: string
}

export type LevelChargeBillingPeriod = 'monthly' | 'semester' | 'yearly'

export interface ChargeLineInput {
  charge_type_id: string
  amount: number
  billing_period?: LevelChargeBillingPeriod
}

export interface InstallmentInput {
  sequence: number
  month_number?: number | null
  label?: string | null
  amount: number
}

export interface UpsertLevelPaymentProfilePayload {
  school_id: number
  pricing_model: 'per_year'
  year_payment_mode?: 'one_time' | 'installments' | 'both' | null
  year_total_amount?: number | null
  currency?: string
  charge_lines: ChargeLineInput[]
  installments?: InstallmentInput[]
  discount_type_ids?: string[]
}

export interface LevelPaymentProfileApi {
  id: string
  school_id: number
  level_id: string
  pricing_model: 'per_year'
  year_payment_mode: 'one_time' | 'installments' | 'both' | null
  year_total_amount: string | null
  currency: string
  fee_package_id?: string | null
  chargeLines?: Array<{
    id: string
    charge_type_id: string
    billing_period?: LevelChargeBillingPeriod
    amount: string
    chargeType?: PaymentCatalogRow
  }>
  installments?: Array<{
    id: string
    sequence: number
    month_number: number | null
    label: string | null
    amount: string
  }>
  discountLinks?: Array<{ discount_type_id: string; discountType?: PaymentCatalogRow }>
}

export interface CoursePaymentSummaryRow {
  id: string
  name: string
  title: string | null
  status: string | null
  course_kind: string | null
  is_active: boolean
  profile_configured: boolean
  course_pricing_basis: 'grade' | 'phase' | null
  fee_package_id?: string | null
  fee_package_name?: string | null
}

export interface CoursePaymentProfileApi {
  id: string
  school_id: number
  course_id: string
  course_pricing_basis: 'grade' | 'phase'
  currency: string
  chargeLines?: Array<{
    id: string
    charge_type_id: string
    amount: string
    chargeType?: PaymentCatalogRow
  }>
}

class PaymentConfigService extends BaseApiService {
  listLevels(schoolId: number) {
    return this.get<SchoolPaymentLevel[]>('/payment-config/levels', { school_id: schoolId })
  }

  listLevelsSummary(schoolId: number) {
    return this.get<SchoolPaymentLevelSummary[]>('/payment-config/levels-summary', { school_id: schoolId })
  }

  createLevel(schoolId: number, body: { code: string; name: string; sort_order?: number; is_active?: boolean }) {
    return this.post<SchoolPaymentLevel>(`/payment-config/levels?school_id=${schoolId}`, body)
  }

  updateLevel(id: string, body: Partial<{ code: string; name: string; sort_order: number; is_active: boolean }>) {
    return this.patch<SchoolPaymentLevel>(`/payment-config/levels/${id}`, body)
  }

  deleteLevel(id: string) {
    return this.delete(`/payment-config/levels/${id}`)
  }

  listChargeTypes(schoolId: number) {
    return this.get<PaymentCatalogRow[]>('/payment-config/charge-types', { school_id: schoolId })
  }

  createChargeType(schoolId: number, body: { code: string; label: string; value?: string | null; sort_order?: number }) {
    return this.post<PaymentCatalogRow>(`/payment-config/charge-types?school_id=${schoolId}`, body)
  }

  updateChargeType(id: string, body: Partial<{ code: string; label: string; value: string | null; sort_order: number; is_active: boolean }>) {
    return this.patch<PaymentCatalogRow>(`/payment-config/charge-types/${id}`, body)
  }

  deleteChargeType(id: string) {
    return this.delete(`/payment-config/charge-types/${id}`)
  }

  listDiscountTypes(schoolId: number) {
    return this.get<PaymentCatalogRow[]>('/payment-config/discount-types', { school_id: schoolId })
  }

  createDiscountType(schoolId: number, body: { code: string; label: string; value?: string | null; sort_order?: number }) {
    return this.post<PaymentCatalogRow>(`/payment-config/discount-types?school_id=${schoolId}`, body)
  }

  updateDiscountType(id: string, body: Partial<{ code: string; label: string; value: string | null; sort_order: number; is_active: boolean }>) {
    return this.patch<PaymentCatalogRow>(`/payment-config/discount-types/${id}`, body)
  }

  deleteDiscountType(id: string) {
    return this.delete(`/payment-config/discount-types/${id}`)
  }

  getProfileByLevel(levelId: string) {
    return this.get<{
      level: SchoolPaymentLevel
      profile: LevelPaymentProfileApi | null
      grade: GradePaymentLinkApi | null
      fee_package: { id: string; name: string } | null
    }>(`/payment-config/profiles/by-level/${levelId}`)
  }

  saveProfileForLevel(levelId: string, body: UpsertLevelPaymentProfilePayload) {
    return this.put<LevelPaymentProfileApi>(`/payment-config/profiles/by-level/${levelId}`, body)
  }

  getSchoolFlags(schoolId: number) {
    return this.get<{ allow_admin_adjust_student_total: boolean }>('/payment-config/school-flags', {
      school_id: schoolId,
    })
  }

  updateSchoolFlags(schoolId: number, body: { allow_admin_adjust_student_total: boolean }) {
    return this.patch<{ allow_admin_adjust_student_total: boolean }>(
      `/payment-config/school-flags?school_id=${schoolId}`,
      body,
    )
  }

  listCoursesPaymentSummary(schoolId: number) {
    return this.get<CoursePaymentSummaryRow[]>('/payment-config/courses-payment-summary', { school_id: schoolId })
  }

  getCoursePaymentProfile(courseId: string, schoolId: number) {
    return this.get<{
      course: {
        id: string
        name: string
        title: string | null
        school_id: number
        status: string | null
        course_kind: string | null
      }
      profile: CoursePaymentProfileApi | null
      fee_package: { id: string; name: string } | null
    }>(`/payment-config/profiles/by-course/${courseId}`, { school_id: schoolId })
  }

  saveCoursePaymentProfile(
    courseId: string,
    body: { school_id: number; course_pricing_basis: 'grade' | 'phase'; currency?: string; charge_lines: ChargeLineInput[] },
  ) {
    return this.put<CoursePaymentProfileApi>(`/payment-config/profiles/by-course/${courseId}`, body)
  }
}

export const paymentConfigService = new PaymentConfigService()
export default paymentConfigService
