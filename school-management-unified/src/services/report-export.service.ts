import { BaseApiService } from './api'

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
