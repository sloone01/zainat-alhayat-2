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

  downloadDueTemplate(): Promise<Blob> {
    return this.client
      .get('/platform/settings/report-templates/due-installments/file', { responseType: 'blob' })
      .then((response) => response.data as Blob)
  }

  uploadDueTemplate(file: File) {
    const body = new FormData()
    body.append('file', file)
    return this.upload<{ customized: boolean; fileName: string }>(
      '/platform/settings/report-templates/due-installments',
      body,
    )
  }
}

export const platformSettingsService = new PlatformSettingsService()
