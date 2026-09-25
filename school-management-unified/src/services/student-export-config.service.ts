/** @deprecated Use reportExportService.getExport('students') */
import reportExportService from './report-export.service'
import type { StudentExportColumnKey } from '@/utils/student-export-columns'

export type StudentExportLayoutOption = {
  id: string
  name: string
  name_ar: string | null
  is_default: boolean
}

export type StudentExportConfig = {
  columns: StudentExportColumnKey[]
  layout_id: string | null
  available_columns: StudentExportColumnKey[]
  layouts: StudentExportLayoutOption[]
  layout_html: string | null
}

class StudentExportConfigApiService {
  async load(locale: string): Promise<StudentExportConfig> {
    const data = await reportExportService.getExport('students', locale)
    return {
      columns: data.columns as StudentExportColumnKey[],
      layout_id: data.template_id,
      available_columns: data.available_columns as StudentExportColumnKey[],
      layouts: data.templates,
      layout_html: data.template_html,
    }
  }

  async save(payload: {
    columns: string[]
    layout_id: string | null
  }): Promise<{ columns: string[]; layout_id: string | null }> {
    const data = await reportExportService.saveExport('students', {
      columns: payload.columns,
      template_id: payload.layout_id,
    })
    return { columns: data.columns, layout_id: data.template_id }
  }
}

export const studentExportConfigService = new StudentExportConfigApiService()
export default studentExportConfigService
