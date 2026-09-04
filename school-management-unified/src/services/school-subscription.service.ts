import { BaseApiService } from './api'

export interface SchoolSubscriptionResult {
  school_id: number
  status: 'pending'
  plan_code: string
  billing_period: string
  owner_email: string
}

class SchoolSubscriptionApiService extends BaseApiService {
  async register(formData: FormData): Promise<SchoolSubscriptionResult> {
    return this.upload<SchoolSubscriptionResult>('/public/school-subscription/register', formData)
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionApiService()
export default schoolSubscriptionService
