import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export type ReportExportListItem = {
  key: string
  name_en: string
  name_ar: string
  source_path: string
  columns: string[]
  template_id: string | null
  configured: boolean
}

export type ReportExportTemplateOption = {
  id: string
  name: string
  name_ar: string | null
  is_default: boolean
}

export type ReportExportDetail = {
  key: string
  name_en: string
  name_ar: string
  source_path: string
  columns: string[]
  template_id: string | null
  available_columns: string[]
  templates: ReportExportTemplateOption[]
  template_html: string | null
}

export type ReportExportTemplate = {
  id: string
  school_id?: string
  name: string
  name_ar: string | null
  html_en: string
  html_ar: string | null
  is_default: boolean
  created_at?: string
  updated_at?: string
}

class ReportExportApiService extends BaseApiService {
  listExports(): Promise<ReportExportListItem[]> {
    return this.get<ReportExportListItem[]>('/reports/exports')
  }

  listExportsPage(params: { page: number; limit: number; q?: string }) {
    const query: Record<string, string | number> = { page: params.page, limit: params.limit }
    if (params.q?.trim()) query.q = params.q.trim()
    return this.get<PageResult<ReportExportListItem>>('/reports/exports', query)
  }

  getExport(key: string, locale: string): Promise<ReportExportDetail> {
    return this.get<ReportExportDetail>(`/reports/exports/${encodeURIComponent(key)}`, {
      locale: locale.startsWith('en') ? 'en' : 'ar',
    })
  }

  saveExport(
    key: string,
    payload: { columns: string[]; template_id: string | null },
  ): Promise<{ key: string; columns: string[]; template_id: string | null }> {
    return this.put(`/reports/exports/${encodeURIComponent(key)}`, payload)
  }

  listTemplates(): Promise<ReportExportTemplate[]> {
    return this.get<ReportExportTemplate[]>('/reports/export-templates')
  }

  listTemplatesPage(params: { page: number; limit: number; q?: string }) {
    const query: Record<string, string | number> = { page: params.page, limit: params.limit }
    if (params.q?.trim()) query.q = params.q.trim()
    return this.get<PageResult<ReportExportTemplate>>('/reports/export-templates', query)
  }

  getTemplate(id: string): Promise<ReportExportTemplate> {
    return this.get<ReportExportTemplate>(`/reports/export-templates/${encodeURIComponent(id)}`)
  }

  createTemplate(body: {
    name: string
    name_ar?: string | null
    html_en: string
    html_ar?: string | null
    is_default?: boolean
  }): Promise<ReportExportTemplate> {
    return this.post<ReportExportTemplate>('/reports/export-templates', body)
  }

  updateTemplate(
    id: string,
    body: {
      name: string
      name_ar?: string | null
      html_en: string
      html_ar?: string | null
      is_default?: boolean
    },
  ): Promise<ReportExportTemplate> {
    return this.put<ReportExportTemplate>(
      `/reports/export-templates/${encodeURIComponent(id)}`,
      body,
    )
  }

  removeTemplate(id: string): Promise<void> {
    return this.delete(`/reports/export-templates/${encodeURIComponent(id)}`)
  }

  downloadCourseDocument(payload: {
    format: 'docx' | 'pdf'
    locale: 'en' | 'ar'
    title: string
    subtitle: string
    labels: Record<string, string>
    rows: Array<Record<string, string>>
  }): Promise<ArrayBuffer> {
    return this.client
      .post('/reports/courses/document', payload, { responseType: 'arraybuffer', timeout: 120000 })
      .then((response) => response.data as ArrayBuffer)
  }

  downloadDueDocument(payload: {
    format: 'docx' | 'pdf'
    locale: 'en' | 'ar'
    title: string
    subtitle: string
    labels: Record<string, string>
    rows: Array<Record<string, string>>
  }): Promise<ArrayBuffer> {
    return this.client
      .post('/reports/due-installments/document', payload, { responseType: 'arraybuffer', timeout: 120000 })
      .then((response) => response.data as ArrayBuffer)
  }

  previewTemplate(payload: {
    locale: 'en' | 'ar'
    html: string
    sample_content?: string
    school_id?: string
  }): Promise<{ html: string }> {
    return this.post<{ html: string }>('/reports/export-templates/preview', payload)
  }
}

export const reportExportService = new ReportExportApiService()
export default reportExportService
