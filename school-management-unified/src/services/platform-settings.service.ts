import { BaseApiService } from './api'

export interface ThawaniSetting {
  enabled: boolean
  /** Thawani API keys are present on the server. */
  configured: boolean
  /** enabled && configured — online payments actually work. */
  available: boolean
}

class PlatformSettingsService extends BaseApiService {
  getThawani() {
    return this.get<ThawaniSetting>('/platform/settings/thawani')
  }

  setThawani(enabled: boolean) {
    return this.put<ThawaniSetting>('/platform/settings/thawani', { enabled })
  }
}

export const platformSettingsService = new PlatformSettingsService()
