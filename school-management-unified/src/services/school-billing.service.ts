import { BaseApiService } from './api'

export interface SchoolBillingInvoice {
  id: string
  school_id: string
  billing_period: string
  period_start: string
  period_end: string
  total_amount: number
  status: string
  line_items: Record<string, unknown>[] | null
  paid_at: string | null
  paid_amount: number | null
  thawani_invoice: string | null
}

export interface SchoolBillingMe {
  school: { id: number; name: string; status: string }
  subscription: {
    plan_code: string | null
    plan_name_en: string | null
    plan_name_ar: string | null
    billing_period: string
    status: string
    period_start: string
    period_end: string
  } | null
  invoice: SchoolBillingInvoice | null
  invoices: SchoolBillingInvoice[]
  thawani_configured: boolean
}

export interface SchoolBillingCheckout {
  paid: boolean
  invoice: SchoolBillingInvoice
  session_id: string | null
  checkout_url: string | null
}

export interface SchoolBillingConfirm {
  paid: boolean
  payment_status?: string
  school_status: string | null
  invoice: SchoolBillingInvoice
}

class SchoolBillingApiService extends BaseApiService {
  getMine(): Promise<SchoolBillingMe> {
    return this.get('/school-billing/me')
  }

  createThawaniSession(payload: {
    success_url: string
    cancel_url: string
  }): Promise<SchoolBillingCheckout> {
    return this.post('/school-billing/thawani/session', payload)
  }

  confirmThawani(invoiceId?: string): Promise<SchoolBillingConfirm> {
    return this.post('/school-billing/thawani/confirm', invoiceId ? { invoice_id: invoiceId } : {})
  }
}

export const schoolBillingService = new SchoolBillingApiService()
