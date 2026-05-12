import { BaseApiService } from './api'

export interface SchoolSubscriptionResult {
  access_token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    school_id: number
    isActive: boolean
  }
  school_id: number
  group_id: string
}

class SchoolSubscriptionApiService extends BaseApiService {
  async register(formData: FormData): Promise<SchoolSubscriptionResult> {
    return this.upload<SchoolSubscriptionResult>('/public/school-subscription/register', formData)
  }
}

export const schoolSubscriptionService = new SchoolSubscriptionApiService()
export default schoolSubscriptionService
