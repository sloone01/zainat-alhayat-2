import { BaseApiService } from './api'

export type AttachmentRow = {
  id: string
  url: string
  file_name: string
  mime_type?: string
  size_bytes: number
}

/**
 * Global file pipeline: multipart → AttachmentService → AttachmentStorage (GCS when configured).
 * Never put file bytes in JSON bodies.
 */
class AttachmentApiService extends BaseApiService {
  async uploadFile(
    file: File,
    opts?: { entity_type?: string; entity_id?: string; purpose?: string },
  ): Promise<AttachmentRow> {
    const form = new FormData()
    form.append('file', file)
    if (opts?.entity_type) form.append('entity_type', opts.entity_type)
    if (opts?.entity_id) form.append('entity_id', opts.entity_id)
    if (opts?.purpose) form.append('purpose', opts.purpose)
    const res = await this.upload<AttachmentRow>('/attachments', form)
    if (!res?.url) throw new Error('Failed to upload attachment')
    return res
  }
}

export const attachmentService = new AttachmentApiService()
export default attachmentService
