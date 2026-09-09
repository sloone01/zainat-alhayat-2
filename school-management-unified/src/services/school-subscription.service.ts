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

  async register(formData: FormData): Promise<SchoolSubscriptionResult> {
    return this.upload<SchoolSubscriptionResult>('/public/school-subscription/register', formData)
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionApiService()
export default schoolSubscriptionService
