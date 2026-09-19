import { BaseApiService } from './api'

export type PushPlatform = 'ios' | 'android' | 'web'

export type RegisterPushTokenPayload = {
  token: string
  platform: PushPlatform
  device_id?: string | null
}

class PushApiService extends BaseApiService {
  async register(payload: RegisterPushTokenPayload): Promise<{
    id: string
    platform: PushPlatform
    fcm_configured: boolean
  }> {
    return this.post('/push/register', payload)
  }

  async unregister(payload?: {
    token?: string | null
    device_id?: string | null
  }): Promise<{ removed: number }> {
    return this.post('/push/unregister', payload || {})
  }
}

export const pushApiService = new PushApiService()
export default pushApiService
