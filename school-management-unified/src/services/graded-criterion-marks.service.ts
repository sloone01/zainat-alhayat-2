import { BaseApiService } from './api'

export interface CriterionCol {
  id: string
  label: string
  max_marks: number
  sort_order: number
  semester_index: number
  semester_title: string | null
}

export interface CriterionMarksGridData {
  course_id: string
  course_name: string
  group_id: string
  group_name: string
  total_marks: number
  aggregation_method: string
  criteria: CriterionCol[]
  students: { id: string; name: string }[]
  marks: Record<string, string | null>
  active_semester?: {
    id: string
    title: string
    semester_index: number
  } | null
}

export interface SaveCriterionMarkEntry {
  student_id: string
  graded_criterion_id: string
  mark?: number | null
}

export interface ClassMarksReport {
  course_id: string
  course_name: string
  group_id: string
  group_name: string
  total_marks: number
  aggregation_method: string
  criteria: CriterionCol[]
  students: {
    id: string
    name: string
    marks: Record<string, number | null>
    semester_scores: { semester_index: number; score: number; max: number }[]
    course_score: number
    course_max: number
  }[]
}

export interface StudentMarksReport {
  student_id: string
  student_name: string
  courses: {
    course_id: string
    course_name: string
    total_marks: number
    aggregation_method: string
    semester_scores: {
      semester_index: number
      title: string | null
      score: number
      max: number
    }[]
    course_score: number
    course_max: number
    criteria: {
      id: string
      label: string
      max_marks: number
      semester_index: number
      mark: number | null
    }[]
  }[]
}

class GradedCriterionMarksApi extends BaseApiService {
  async getGrid(params: {
    schoolId: string
    groupId: string
    courseId: string
  }): Promise<CriterionMarksGridData> {
    const q = new URLSearchParams({
      school_id: String(params.schoolId),
      group_id: params.groupId,
      course_id: params.courseId,
    })
    return this.get<CriterionMarksGridData>(`/graded-criterion-marks/grid?${q}`)
  }

  async saveGrid(
    schoolId: string,
    body: {
      group_id: string
      course_id: string
      entries: SaveCriterionMarkEntry[]
    },
  ): Promise<{ saved: number }> {
    return this.post<{ saved: number }>(
      `/graded-criterion-marks/grid?school_id=${schoolId}`,
      body,
    )
  }

  async classReport(params: {
    schoolId: string
    groupId: string
    courseId: string
  }): Promise<ClassMarksReport> {
    const q = new URLSearchParams({
      school_id: String(params.schoolId),
      group_id: params.groupId,
      course_id: params.courseId,
    })
    return this.get<ClassMarksReport>(`/graded-criterion-marks/reports/class?${q}`)
  }

  async studentReport(params: {
    schoolId: string
    studentId: string
  }): Promise<StudentMarksReport> {
    const q = new URLSearchParams({
      school_id: String(params.schoolId),
      student_id: params.studentId,
    })
    return this.get<StudentMarksReport>(
      `/graded-criterion-marks/reports/student?${q}`,
    )
  }
}

export const gradedCriterionMarksService = new GradedCriterionMarksApi()
export default gradedCriterionMarksService
