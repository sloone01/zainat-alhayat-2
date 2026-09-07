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
  due_date: string | null
  amount_due: string
  amount_paid: string
  status: 'pending' | 'paid' | 'partial'
}

export type DueInstallmentState = 'upcoming' | 'due' | 'late' | 'unscheduled'

export interface DueInstallmentRow {
  installment_id: string
  student_id: string
  student_name: string
  sheet_id: string
  sequence: number
  month_number: number | null
  label: string | null
  due_date: string | null
  amount_due: string
  amount_paid: string
  balance: string
  status: 'pending' | 'paid' | 'partial'
  state: DueInstallmentState
  days_overdue: number
}

export interface DueInstallmentsReport {
  summary: {
    as_of: string
    total: number
    upcoming: number
    due: number
    late: number
    unscheduled: number
    balance_total: string
  }
  items: DueInstallmentRow[]
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

export interface ChargeSheetSummary {
  student_id: string
  currency: string
  list_total: string
  due_total: string
  paid_total: string
  discount_total: string
  pending_total: string
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

  dueInstallmentsReport(params?: { as_of?: string; bucket?: 'all' | 'due' | 'late' | 'upcoming' }) {
    const query: Record<string, string> = {}
    if (params?.as_of) query.as_of = params.as_of
    if (params?.bucket) query.bucket = params.bucket
    return this.get<DueInstallmentsReport>('/fees/v2/reports/due-installments', query)
  }

  listChargeSheetSummaries() {
    return this.get<ChargeSheetSummary[]>('/fees/v2/charge-sheet-summaries')
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

  listStudentPayments(studentId: string) {
    return this.get<FeePayment[]>(`/fees/v2/students/${studentId}/payments`)
  }

  listPendingPayments() {
    return this.get<FeePayment[]>('/fees/v2/payments/pending')
  }

  listPendingReconcile() {
    return this.get<FeePayment[]>('/fees/v2/payments/pending-reconcile')
  }

  listFeeTransfers() {
    return this.get<FeeTransfer[]>('/fees/v2/transfers')
  }

  createFeeTransfer(data: {
    school_id: number
    payment_ids: string[]
    reference?: string
    notes?: string
  }) {
    return this.post<FeeTransfer>('/fees/v2/transfers', data)
  }

  approveFeeTransfer(id: string, notes?: string) {
    return this.post<FeeTransfer>(`/fees/v2/transfers/${id}/approve`, { notes })
  }

  rejectFeeTransfer(id: string, notes?: string) {
    return this.post<FeeTransfer>(`/fees/v2/transfers/${id}/reject`, { notes })
  }

  submitOfflinePayment(
    studentId: string,
    form: {
      target_type: 'upfront' | 'installment'
      installment_id?: string
      remarks?: string
      locale?: 'en' | 'ar'
      file: File
    },
  ) {
    const fd = new FormData()
    fd.append('proof', form.file)
    fd.append('target_type', form.target_type)
    if (form.installment_id) fd.append('installment_id', form.installment_id)
    if (form.remarks) fd.append('remarks', form.remarks)
    if (form.locale) fd.append('locale', form.locale)
    return this.upload<FeePayment>(`/fees/v2/students/${studentId}/payments/offline`, fd)
  }

  createThawaniSession(
    studentId: string,
    data: {
      target_type: 'upfront' | 'installment'
      installment_id?: string
      success_url: string
      cancel_url: string
      locale?: 'en' | 'ar'
    },
  ) {
    return this.post<ThawaniSessionResult>(
      `/fees/v2/students/${studentId}/payments/thawani/session`,
      data,
      { timeout: 25000 },
    )
  }

  confirmThawaniPayment(paymentId: string) {
    return this.post<ThawaniConfirmResult>(`/fees/v2/payments/${paymentId}/thawani/confirm`, {}, {
      timeout: 20000,
    })
  }

  approvePayment(id: string, notes?: string) {
    return this.post<{ payment: FeePayment }>(`/fees/v2/payments/${id}/approve`, {
      notes,
    })
  }

  rejectPayment(id: string, notes?: string) {
    return this.post<FeePayment>(`/fees/v2/payments/${id}/reject`, { notes })
  }
}

export type FeePaymentMethod = 'offline' | 'thawani' | 'admin'
export type FeePaymentStatus =
  | 'pending'
  | 'pending_approval'
  | 'pending_reconcile'
  | 'paid'
  | 'rejected'
  | 'cancelled'
  | 'failed'

export type FeeTransferStatus = 'pending_school' | 'approved' | 'rejected'

export interface FeePayment {
  id: string
  student_id: string
  sheet_id: string
  target_type: 'upfront' | 'installment'
  installment_id: string | null
  amount: string
  method: FeePaymentMethod
  status: FeePaymentStatus
  proof_url: string | null
  proof_original_name: string | null
  remarks: string | null
  review_notes: string | null
  receipt_sent_at: string | null
  paid_at: string | null
  created_at: string
  school_id?: number
  transfer_id?: string | null
  school?: { id: number; name: string } | null
  student?: { id: string; firstName: string; lastName: string }
  submittedByUser?: { firstName?: string; lastName?: string } | null
}

export interface FeeTransferLine {
  id: string
  transfer_id: string
  payment_id: string
  payment?: FeePayment | null
}

export interface FeeTransfer {
  id: string
  school_id: number
  status: FeeTransferStatus
  reference: string | null
  notes: string | null
  total_amount: string
  review_notes: string | null
  created_at: string
  reviewed_at: string | null
  school?: { id: number; name: string } | null
  createdByUser?: { firstName?: string; lastName?: string } | null
  reviewedByUser?: { firstName?: string; lastName?: string } | null
  lines?: FeeTransferLine[]
}

export interface ThawaniSessionResult {
  payment: FeePayment
  session_id: string
  checkout_url: string
}

export interface ThawaniConfirmResult {
  paid: boolean
  payment_status?: string
  payment: FeePayment
  sheet?: StudentChargeSheet
}

export const feesV2Service = new FeesV2Service()
export default feesV2Service
