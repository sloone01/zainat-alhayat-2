import { BaseApiService, apiClient } from './api'

export type AbsenceExcuseStatus = 'pending' | 'approved' | 'rejected'

export interface AbsenceExcuseChild {
  id: string
  firstName?: string
  lastName?: string
  first_name_ar?: string | null
  last_name_ar?: string | null
  first_name_en?: string | null
  last_name_en?: string | null
}

export interface AbsenceExcuse {
  id: string
  student_id: string
  absence_date: string
  explanation: string
  original_filename: string | null
  has_file: boolean
  status: AbsenceExcuseStatus
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
  student: AbsenceExcuseChild | null
  submitted_by_name: string | null
}

export interface ParentAbsenceExcuses {
  children: AbsenceExcuseChild[]
  items: AbsenceExcuse[]
}

class AbsenceExcuseService extends BaseApiService {
  list(status: string): Promise<AbsenceExcuse[]> {
    return this.get<AbsenceExcuse[]>('/absence-excuses', { status })
  }

  approve(id: string): Promise<AbsenceExcuse> {
    return this.post<AbsenceExcuse>(`/absence-excuses/${id}/approve`, {})
  }

  reject(id: string, rejection_reason: string): Promise<AbsenceExcuse> {
    return this.post<AbsenceExcuse>(`/absence-excuses/${id}/reject`, { rejection_reason })
  }

  parentList(): Promise<ParentAbsenceExcuses> {
    return this.get<ParentAbsenceExcuses>('/parents/dashboard/absence-excuses')
  }

  parentCreate(payload: { student_id: string; absence_date: string; explanation: string; file: File }): Promise<AbsenceExcuse> {
    const form = new FormData()
    form.append('student_id', payload.student_id)
    form.append('absence_date', payload.absence_date)
    form.append('explanation', payload.explanation)
    form.append('file', payload.file)
    return this.upload<AbsenceExcuse>('/parents/dashboard/absence-excuses', form)
  }

  async download(id: string, parent = false): Promise<Blob> {
    const path = parent
      ? `/parents/dashboard/absence-excuses/${id}/file`
      : `/absence-excuses/${id}/file`
    const response = await apiClient.get(path, { responseType: 'blob' })
    return response.data as Blob
  }
}

export const absenceExcuseService = new AbsenceExcuseService()
