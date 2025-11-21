import { BaseApiService } from './api'

export interface SessionMedia {
  id: number
  session_plan_id: string
  file_name: string
  file_path: string
  file_type: 'photo' | 'video'
  file_size: number
  mime_type: string
  uploaded_by: string
  uploaded_at: string
  created_at: string
  updated_at: string
}

export interface CreateSessionMediaDto {
  session_plan_id: string
  file_name: string
  file_path: string
  file_type: 'photo' | 'video'
  file_size: number
  mime_type: string
  uploaded_by: string
}

class SessionMediaService extends BaseApiService {
  private basePath = '/session-media'

  async getBySessionPlan(sessionPlanId: string): Promise<SessionMedia[]> {
    return this.get<SessionMedia[]>(`${this.basePath}/session-plan/${sessionPlanId}`)
  }

  async create(data: CreateSessionMediaDto): Promise<SessionMedia> {
    return this.post<SessionMedia>(this.basePath, data)
  }

  async uploadFile(sessionPlanId: string, file: File, uploadedBy: string): Promise<SessionMedia> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_plan_id', sessionPlanId)
    formData.append('uploaded_by', uploadedBy)

    const response = await this.upload<{
      success: boolean
      data: SessionMedia
      message: string
    }>(`${this.basePath}/upload`, formData)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  }

  async uploadMultipleFiles(sessionPlanId: string, files: File[], uploadedBy: string): Promise<SessionMedia[]> {
    console.log('📁 Uploading', files.length, 'files to session plan:', sessionPlanId)

    try {
      const formData = new FormData()

      files.forEach(file => {
        formData.append('files', file)
      })

      formData.append('session_plan_id', sessionPlanId)
      formData.append('uploaded_by', uploadedBy)

      const response = await this.upload<{
        success: boolean
        data: SessionMedia[]
        message: string
      }>(`${this.basePath}/upload-multiple`, formData)

      console.log('📥 Backend response:', response)

      if (!response.success) {
        console.error('❌ Backend returned success: false')
        throw new Error(response.message || 'Upload failed')
      }

      console.log('✅ Successfully uploaded', response.data.length, 'files')
      return response.data

    } catch (error: any) {
      console.error('❌ Upload error:', error)

      // Handle HTTP errors from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('File upload failed')
      }
    }
  }

  async getBySessionPlanId(sessionPlanId: string): Promise<SessionMedia[]> {
    return this.get<SessionMedia[]>(`${this.basePath}/session/${sessionPlanId}`)
  }

  async getById(id: number): Promise<SessionMedia> {
    return this.get<SessionMedia>(`${this.basePath}/${id}`)
  }

  async deleteById(id: number): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`)
  }

  async deleteBySessionPlan(sessionPlanId: string): Promise<void> {
    return this.delete<void>(`${this.basePath}/session-plan/${sessionPlanId}`)
  }
}

export const sessionMediaService = new SessionMediaService()
export default sessionMediaService
