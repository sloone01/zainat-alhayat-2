import { BaseApiService } from './api'

export interface SchoolSubscriptionResult {
  school_id: string
  status: 'pending'
  plan_code: string
  billing_period: string
  owner_email: string
}

export interface SendSignupEmailOtpResult {
  expires_in_seconds: number
  resend_after_seconds: number
  development_otp?: string
}

export interface VerifySignupEmailOtpResult {
  email_verification_token: string
  expires_in_seconds: number
}

export type CustomPlanRequestStatus = 'new' | 'contacted' | 'closed'

export interface CustomPlanRequest {
  id: string
  school_name: string
  email: string
  phone: string
  scope: 'small' | 'mid' | 'large'
  locale: string
  notes: string | null
  module_codes: string[]
  module_labels: Array<{ code: string; name_en: string; name_ar: string }>
  status: CustomPlanRequestStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

class SchoolSubscriptionApiService extends BaseApiService {
  async sendEmailOtp(email: string): Promise<SendSignupEmailOtpResult> {
    return this.post<SendSignupEmailOtpResult>('/public/school-subscription/email-otp/send', {
      email,
    })
  }

  async verifyEmailOtp(email: string, code: string): Promise<VerifySignupEmailOtpResult> {
    return this.post<VerifySignupEmailOtpResult>('/public/school-subscription/email-otp/verify', {
      email,
      code,
    })
  }

  async submitInquiry(payload: {
    school_name: string
    email: string
    phone: string
    scope: 'small' | 'mid' | 'large'
    locale?: 'en' | 'ar'
  }): Promise<{ received: true }> {
    return this.post<{ received: true }>('/public/school-subscription/inquiry', payload)
  }

  async submitCustomPlanRequest(payload: {
    school_name: string
    email: string
    phone: string
    scope: 'small' | 'mid' | 'large'
    locale?: 'en' | 'ar'
    module_codes?: string[]
    notes?: string
  }): Promise<{ received: true; id: string }> {
    return this.post<{ received: true; id: string }>(
      '/public/school-subscription/custom-plan-request',
      payload,
    )
  }

  async listCustomPlanRequests(): Promise<CustomPlanRequest[]> {
    return this.get<CustomPlanRequest[]>('/platform/custom-plan-requests')
  }

  async updateCustomPlanRequest(
    id: string,
    payload: { status?: CustomPlanRequestStatus; admin_notes?: string | null },
  ): Promise<CustomPlanRequest> {
    return this.patch<CustomPlanRequest>(`/platform/custom-plan-requests/${id}`, payload)
  }

  async register(formData: FormData): Promise<SchoolSubscriptionResult> {
    return this.upload<SchoolSubscriptionResult>('/public/school-subscription/register', formData)
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionApiService()
export default schoolSubscriptionService
