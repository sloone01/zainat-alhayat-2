import { BaseApiService } from './api'

export type PaymentTiming = 'upfront' | 'installment'
export type BillingFrequency = 'per_year' | 'once_only'

export type FeePackageUsageKind = 'grade' | 'bus' | 'course' | 'level_profile' | 'course_profile'

export interface FeePackageUsageItem {
  kind: FeePackageUsageKind
  id: string
  label: string
}

export interface FeePackageUsage {
  in_use: boolean
  usages: FeePackageUsageItem[]
}

export type InstallmentPlanUsageKind = 'student_charge_sheet'

export interface InstallmentPlanUsageItem {
  kind: InstallmentPlanUsageKind
  id: string
  label: string
}

export interface InstallmentPlanUsage {
  in_use: boolean
  usages: InstallmentPlanUsageItem[]
}

export interface FeePackageChargeLine {
  charge_type_id: string
  charge_type?: { id: string; code: string; label: string } | null
  payment_timing: PaymentTiming
  billing_frequency: BillingFrequency
}

export interface FeePackageStructure {
  id: string
  school_id: number
  name: string
  currency: string
  is_active: boolean
  charge_lines: FeePackageChargeLine[]
  discount_type_ids: string[]
}

export interface InstallmentPlanEntry {
  id?: string
  sequence: number
  month_number: number | null
  label: string | null
  weight: string | number
}

export interface InstallmentPlan {
  id: string
  school_id: number
  name: string
  description: string | null
  is_active: boolean
  entries: InstallmentPlanEntry[]
}

export interface GradeFeeLink {
  id: string
  school_id: number
  level_id: string
  fee_package_id: string
  feePackage?: FeePackageStructure
  level?: { id: string; name: string; code: string }
  lines: Array<{
    id: string
    charge_type_id: string
    amount: string
    chargeType?: { id: string; label: string; code: string }
  }>
}

export interface ChargeSheetLine {
  id: string
  charge_label: string
  list_amount: string
  due_amount: string
  paid_amount: string
  payment_timing: PaymentTiming
  billing_frequency: BillingFrequency
  status: 'pending' | 'paid' | 'waived'
  source_type: 'grade' | 'bus' | 'course'
}

export interface ChargeSheetInstallment {
  id: string
  sequence: number
  month_number: number | null
  label: string | null
  amount_due: string
  amount_paid: string
  status: 'pending' | 'paid' | 'partial'
}

export interface ChargeSheetDiscountLine {
  id: string
  discount_type_id: string
  amount: string
  remarks?: string | null
  discountType?: { id: string; label: string; code: string } | null
}

export interface BusFeeLink {
  id: string
  school_id: number
  bus_id: string
  fee_package_id: string
  feePackage?: FeePackageStructure
  lines: Array<{
    id: string
    charge_type_id: string
    amount: string
    chargeType?: { id: string; label: string; code: string }
  }>
}

export interface CourseFeeLink {
  id: string
  school_id: number
  course_id: string
  fee_package_id: string
  feePackage?: FeePackageStructure
  lines: Array<{
    id: string
    charge_type_id: string
    amount: string
    chargeType?: { id: string; label: string; code: string }
  }>
}

export interface StudentChargeSheet {
  id: string
  student_id: string
  currency: string
  list_total: string
  due_total: string
  paid_total: string
  discount_total: string
  upfront_due: string
  installment_due: string
  status: string
  installment_plan_id: string | null
  installmentPlan?: InstallmentPlan | null
  lines: ChargeSheetLine[]
  installments: ChargeSheetInstallment[]
  discountLines?: ChargeSheetDiscountLine[]
  student?: {
    id: string
    firstName: string
    lastName: string
    paymentLevel?: { id: string; name: string; code: string } | null
  }
}

class FeesV2Service extends BaseApiService {
  listPackages(schoolId: number) {
    return this.get<FeePackageStructure[]>('/fees/v2/packages', { school_id: String(schoolId) })
  }

  getPackage(id: string) {
    return this.get<FeePackageStructure>(`/fees/v2/packages/${id}`)
  }

  savePackage(data: {
    school_id: number
    name: string
    currency?: string
    is_active?: boolean
    charge_lines: Array<{
      charge_type_id: string
      payment_timing: PaymentTiming
      billing_frequency: BillingFrequency
    }>
    discount_type_ids?: string[]
  }, id?: string) {
    if (id) return this.put<FeePackageStructure>(`/fees/v2/packages/${id}`, data)
    return this.post<FeePackageStructure>('/fees/v2/packages', data)
  }

  deletePackage(id: string) {
    return this.delete(`/fees/v2/packages/${id}`)
  }

  getPackageUsage(id: string) {
    return this.get<FeePackageUsage>(`/fees/v2/packages/${id}/usage`)
  }

  listInstallmentPlans(schoolId: number) {
    return this.get<InstallmentPlan[]>('/fees/v2/installment-plans', { school_id: String(schoolId) })
  }

  getInstallmentPlan(id: string) {
    return this.get<InstallmentPlan>(`/fees/v2/installment-plans/${id}`)
  }

  saveInstallmentPlan(
    data: {
      school_id: number
      name: string
      description?: string
      is_active?: boolean
      entries: Array<{
        sequence: number
        month_number?: number | null
        label?: string | null
        weight?: number
      }>
    },
    id?: string,
  ) {
    if (id) return this.put<InstallmentPlan>(`/fees/v2/installment-plans/${id}`, data)
    return this.post<InstallmentPlan>('/fees/v2/installment-plans', data)
  }

  deleteInstallmentPlan(id: string) {
    return this.delete(`/fees/v2/installment-plans/${id}`)
  }

  getInstallmentPlanUsage(id: string) {
    return this.get<InstallmentPlanUsage>(`/fees/v2/installment-plans/${id}/usage`)
  }

  getGradeLink(schoolId: number, levelId: string) {
    return this.get<GradeFeeLink | null>(`/fees/v2/grade-links/by-level/${levelId}`, {
      school_id: String(schoolId),
    })
  }

  saveGradeLink(data: {
    school_id: number
    level_id: string
    fee_package_id: string
    lines: Array<{ charge_type_id: string; amount: number }>
  }) {
    return this.put<GradeFeeLink>('/fees/v2/grade-links', data)
  }

  getBusLink(schoolId: number, busId: string) {
    return this.get<BusFeeLink | null>(`/fees/v2/bus-links/by-bus/${busId}`, {
      school_id: String(schoolId),
    })
  }

  saveBusLink(data: {
    school_id: number
    bus_id: string
    fee_package_id: string
    lines: Array<{ charge_type_id: string; amount: number }>
  }) {
    return this.put<BusFeeLink>('/fees/v2/bus-links', data)
  }

  getCourseLink(schoolId: number, courseId: string) {
    return this.get<CourseFeeLink | null>(`/fees/v2/course-links/by-course/${courseId}`, {
      school_id: String(schoolId),
    })
  }

  saveCourseLink(data: {
    school_id: number
    course_id: string
    fee_package_id: string
    lines: Array<{ charge_type_id: string; amount: number }>
  }) {
    return this.put<CourseFeeLink>('/fees/v2/course-links', data)
  }

  getStudentChargeSheet(studentId: string) {
    return this.get<StudentChargeSheet>(`/fees/v2/students/${studentId}/charge-sheet`)
  }

  refreshStudentChargeSheet(studentId: string) {
    return this.post<StudentChargeSheet>(`/fees/v2/students/${studentId}/charge-sheet/refresh`, {})
  }

  assignInstallmentPlan(studentId: string, installment_plan_id: string | null) {
    return this.put<StudentChargeSheet>(`/fees/v2/students/${studentId}/charge-sheet/plan`, {
      installment_plan_id,
    })
  }

  setChargeSheetDiscounts(
    studentId: string,
    discounts: Array<{ discount_type_id: string; amount: number; remarks?: string }>,
  ) {
    return this.put<StudentChargeSheet>(`/fees/v2/students/${studentId}/charge-sheet/discounts`, {
      discounts,
    })
  }

  payUpfront(studentId: string, amount: number, remarks?: string) {
    return this.post<StudentChargeSheet>(`/fees/v2/students/${studentId}/charge-sheet/pay-upfront`, {
      amount,
      remarks,
    })
  }

  payInstallment(installmentId: string, amount: number, remarks?: string) {
    return this.post<StudentChargeSheet>(`/fees/v2/installments/${installmentId}/pay`, {
      amount,
      remarks,
    })
  }
}

export const feesV2Service = new FeesV2Service()
export default feesV2Service
