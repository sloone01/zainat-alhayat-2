import { BaseApiService, apiClient } from './api'

export type CourseKind = 'milestone' | 'graded' | 'standalone'

export interface CourseMaterialCourseRow {
  id: string
  name: string
  course_kind: CourseKind | string
  materials_count: number
}

export interface CourseMaterialRow {
  id: string
  course_id: string
  course_name: string | null
  course_kind: string
  phase_id: string | null
  topic_id: string | null
  title: string
  description: string | null
  original_filename: string
  mime_type: string
  file_size: number
  file_ext: string
  is_visible: boolean
  uploaded_by_user_id: string | null
  created_at: string
}

export interface CourseMaterialPhaseRow {
  id: string
  name: string
  order: number
}

export interface CourseMaterialTopicRow {
  id: string
  course_id: string
  title: string
  sort_order: number
}

export interface CourseMaterialBoard {
  phases: CourseMaterialPhaseRow[]
  topics: CourseMaterialTopicRow[]
  materials: CourseMaterialRow[]
}

export const COURSE_MATERIAL_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.ods,.odp,.txt,.rtf,.csv,.zip,.rar'

class CourseMaterialApi extends BaseApiService {
  async listCourses(schoolId?: string): Promise<CourseMaterialCourseRow[]> {
    const q = schoolId ? `?school_id=${schoolId}` : ''
    return this.get<CourseMaterialCourseRow[]>(`/course-materials/courses${q}`)
  }

  async list(schoolId: string | undefined, courseId: string): Promise<CourseMaterialRow[]> {
    const school = schoolId ? `school_id=${schoolId}&` : ''
    return this.get<CourseMaterialRow[]>(
      `/course-materials?${school}course_id=${encodeURIComponent(courseId)}`,
    )
  }

  async board(schoolId: string | undefined, courseId: string): Promise<CourseMaterialBoard> {
    const school = schoolId ? `school_id=${schoolId}&` : ''
    return this.get<CourseMaterialBoard>(
      `/course-materials/board?${school}course_id=${encodeURIComponent(courseId)}`,
    )
  }

  async createTopic(schoolId: string, courseId: string, title: string): Promise<CourseMaterialTopicRow> {
    return this.post<CourseMaterialTopicRow>('/course-materials/topics', {
      school_id: schoolId,
      course_id: courseId,
      title,
    })
  }

  async updateTopic(schoolId: string, topicId: string, title: string): Promise<CourseMaterialTopicRow> {
    return this.patch<CourseMaterialTopicRow>(
      `/course-materials/topics/${encodeURIComponent(topicId)}?school_id=${schoolId}`,
      { title },
    )
  }

  async removeTopic(schoolId: string, topicId: string): Promise<void> {
    await this.delete(
      `/course-materials/topics/${encodeURIComponent(topicId)}?school_id=${schoolId}`,
    )
  }

  async upload(params: {
    schoolId: string
    courseId: string
    title: string
    description?: string
    file: File
    phaseId?: string
    topicId?: string
  }): Promise<CourseMaterialRow> {
    const form = new FormData()
    form.append('file', params.file)
    form.append('school_id', String(params.schoolId))
    form.append('course_id', params.courseId)
    form.append('title', params.title)
    if (params.description) form.append('description', params.description)
    if (params.phaseId) form.append('phase_id', params.phaseId)
    if (params.topicId) form.append('topic_id', params.topicId)
    return super.upload<CourseMaterialRow>('/course-materials/upload', form)
  }

  async update(
    schoolId: string,
    id: string,
    body: { title?: string; description?: string | null; is_visible?: boolean },
  ): Promise<CourseMaterialRow> {
    return this.patch<CourseMaterialRow>(
      `/course-materials/${encodeURIComponent(id)}?school_id=${schoolId}`,
      body,
    )
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.delete(
      `/course-materials/${encodeURIComponent(id)}?school_id=${schoolId}`,
    )
  }

  /** Download via blob (keeps Authorization header). */
  async downloadBlob(schoolId: string | undefined, id: string): Promise<{ blob: Blob; filename: string }> {
    const school = schoolId ? `?school_id=${schoolId}` : ''
    const response = await apiClient.get(
      `/course-materials/${encodeURIComponent(id)}/download${school}`,
      { responseType: 'blob' },
    )
    const disposition = String(response.headers['content-disposition'] || '')
    let filename = 'download'
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
    if (m) {
      filename = decodeURIComponent((m[1] || m[2] || filename).trim())
    }
    return { blob: response.data as Blob, filename }
  }
}

export const courseMaterialService = new CourseMaterialApi()
export default courseMaterialService
