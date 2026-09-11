import { BaseApiService } from './api'
import type { Course } from './course.service'

export type AggregationMethod = 'sum' | 'average'

export interface GradedCriterionPayload {
  label: string
  max_marks: number
}

export interface GradedSemesterPayload {
  title?: string
  criteria: GradedCriterionPayload[]
}

export interface CreateGradedCoursePayload {
  school_id: string
  name: string
  description?: string
  academic_year_id?: string
  level_id?: string
  save_as_draft?: boolean
  total_marks: number
  aggregation_method: AggregationMethod
  semesters: GradedSemesterPayload[]
}

/** PATCH /graded-assessment/courses/:id — `school_id` is sent as a query param. */
export type UpdateGradedCoursePayload = Omit<CreateGradedCoursePayload, 'school_id' | 'academic_year_id'>

export interface GradedSchemeSemester {
  id: string
  semester_index: number
  title: string | null
  criteria?: Array<{
    id: string
    label: string
    max_marks: string
    sort_order: number
  }>
}

export interface GradedScheme {
  id: string
  course_id: string
  total_marks: string
  aggregation_method: string
  semesters?: GradedSchemeSemester[]
}

export type GradedCourseWithScheme = Course & {
  course_kind?: string
  graded_scheme?: GradedScheme | null
}

class GradedAssessmentService extends BaseApiService {
  async list(schoolId: string): Promise<GradedCourseWithScheme[]> {
    return this.get<GradedCourseWithScheme[]>(
      `/graded-assessment/courses?school_id=${schoolId}`,
    )
  }

  async create(payload: CreateGradedCoursePayload): Promise<GradedCourseWithScheme> {
    return this.post<GradedCourseWithScheme>('/graded-assessment/courses', payload)
  }

  async update(
    courseId: string,
    schoolId: string,
    payload: UpdateGradedCoursePayload,
  ): Promise<GradedCourseWithScheme> {
    return this.patch<GradedCourseWithScheme>(
      `/graded-assessment/courses/${courseId}?school_id=${schoolId}`,
      payload,
    )
  }

  async getByCourseId(
    courseId: string,
    schoolId: string,
  ): Promise<GradedCourseWithScheme> {
    return this.get<GradedCourseWithScheme>(
      `/graded-assessment/courses/${courseId}?school_id=${schoolId}`,
    )
  }

  async deleteDraft(courseId: string, schoolId: string): Promise<void> {
    await this.delete<void>(
      `/graded-assessment/courses/${courseId}?school_id=${schoolId}`,
    )
  }

  async duplicate(
    courseId: string,
    schoolId: string,
    newName?: string,
  ): Promise<GradedCourseWithScheme> {
    return this.post<GradedCourseWithScheme>(
      `/graded-assessment/courses/${courseId}/duplicate?school_id=${schoolId}`,
      { newName },
    )
  }
}

export const gradedAssessmentService = new GradedAssessmentService()
export default gradedAssessmentService
