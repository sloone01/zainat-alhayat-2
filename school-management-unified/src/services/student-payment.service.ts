import { BaseApiService } from './api'

export interface StudentInstallmentScheduleRow {
  installment_id: string
  sequence: number
  month_number: number | null
  label: string | null
  is_downpayment?: boolean
  scheduled_amount: string
  paid: null | {
    receipt_id: string
    amount: string
    paid_at: string
    remarks: string | null
  }
}

export interface StudentInstallmentSchedule {
  rows: StudentInstallmentScheduleRow[]
  scheduled_total: number
  paid_total: number
  downpayment_total?: number
}

export type PaymentChargeBillingOccurrence = 'per_year' | 'once_ever' | 'other'

export interface StudentFeeChargeRow {
  id: string
  charge_type_id: string
  charge_code: string
  charge_label: string
  billing_occurrence: PaymentChargeBillingOccurrence
  academic_year_id: string | null
  amount_due: number
  amount_paid: number
  balance: number
  currency: string
  is_satisfied: boolean
}

export interface PaymentAllocationPreviewLine {
  student_fee_charge_id: string
  charge_type_id: string
  charge_label: string
  billing_occurrence: PaymentChargeBillingOccurrence
  amount: number
  level_payment_installment_id: string | null
  installment_sequence: number | null
}

export interface PaymentAllocationPreview {
  academic_year_id: string | null
  academic_year_label: string | null
  total_amount: number
  allocated_total: number
  unallocated: number
  lines: PaymentAllocationPreviewLine[]
}

export interface PaymentTransactionSummary {
  id: string
  total_amount: number
  currency: string
  paid_at: string
  remarks: string | null
  academic_year_id: string | null
  allocations: Array<{
    charge_type_id: string
    charge_label: string
    amount: number
    level_payment_installment_id: string | null
  }>
}

/** Matches API `data` payload for student payment views */
export interface StudentPaymentSnapshot {
  payment: {
    id: string
    student_id: string
    school_id: number
    level_id: string | null
    level_payment_profile_id: string | null
    course_id?: string | null
    course_payment_profile_id?: string | null
    payment_kind?: 'level' | 'course'
    base_total_amount: string
    admin_adjusted_total: string | null
    currency: string
    created_at: string
    updated_at: string
    student?: { id: string; firstName: string; lastName: string }
    level?: { id: string; code: string; name: string } | null
    course?: { id: string; name: string; title?: string } | null
    discountLines: Array<{
      id: string
      discount_type_id: string
      amount: string
      remarks: string
      created_at: string
      discountType?: { id: string; code: string; label: string }
    }>
  }
  payable: number
  subtotal: number
  discountTotal: number
  allowedDiscountTypeIds: string[]
  installmentSchedule: StudentInstallmentSchedule | null
  feeCharges?: StudentFeeChargeRow[]
  paymentHistory?: PaymentTransactionSummary[]
}

class StudentPaymentService extends BaseApiService {
  list(schoolId: number) {
    return this.get<StudentPaymentSnapshot[]>(`/student-payments`, { school_id: schoolId })
  }

  getDetail(studentId: string) {
    return this.get<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}`)
  }

  listAllForStudent(studentId: string) {
    return this.get<StudentPaymentSnapshot[]>(`/student-payments/by-student/${studentId}/all`)
  }

  ensure(studentId: string) {
    return this.post<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}/ensure`, {})
  }

  updateAdminTotal(studentId: string, admin_adjusted_total: number | null) {
    return this.patch<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}/admin-total`, {
      admin_adjusted_total,
    })
  }

  addDiscount(studentId: string, body: { discount_type_id: string; amount: number; remarks: string }) {
    return this.post<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}/discounts`, body)
  }

  removeDiscount(studentId: string, lineId: string) {
    return this.delete<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}/discounts/${lineId}`)
  }

  recordInstallmentPayment(studentId: string, installmentId: string, body: { amount?: number; remarks?: string }) {
    return this.post<StudentPaymentSnapshot>(
      `/student-payments/by-student/${studentId}/installments/${installmentId}/pay`,
      body,
    )
  }

  clearInstallmentPayment(studentId: string, installmentId: string) {
    return this.delete<StudentPaymentSnapshot>(
      `/student-payments/by-student/${studentId}/installments/${installmentId}/pay`,
    )
  }

  previewPayment(
    studentId: string,
    body: { amount: number; academic_year_id?: string | null; target_installment_id?: string | null },
  ) {
    return this.post<PaymentAllocationPreview>(`/student-payments/by-student/${studentId}/payments/preview`, body)
  }

  recordPayment(
    studentId: string,
    body: {
      amount: number
      academic_year_id?: string | null
      remarks?: string | null
      target_installment_id?: string | null
    },
  ) {
    return this.post<StudentPaymentSnapshot>(`/student-payments/by-student/${studentId}/payments/record`, body)
  }
}

export const studentPaymentService = new StudentPaymentService()
export default studentPaymentService
