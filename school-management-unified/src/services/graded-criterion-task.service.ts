import { BaseApiService } from './api'

export interface EligibleGradedCourse {
  course_id: string
  course_name: string
  groups: { id: string; name: string }[]
}

export interface GradedCriterionTaskRow {
  id: string
  description: string | null
  due_date: string | null
  sort_order: number
  is_system_default: boolean
}

export interface CriterionTaskSummary {
  criterion_id: string
  label: string
  semester_index: number
  semester_title: string | null
  groups: {
    group_id: string
    group_name: string
    tasks: GradedCriterionTaskRow[]
  }[]
}

export interface AppendTaskBody {
  graded_criterion_id: string
  group_id: string
  description?: string
  due_date?: string | null
}

export interface SyncTasksBody {
  graded_criterion_id: string
  apply_to_all_classes: boolean
  group_ids?: string[]
  tasks: { description?: string; due_date?: string | null }[]
}

export interface MarksGridTaskCol {
  id: string
  description: string | null
  due_date: string | null
  sort_order: number
}

export interface MarksGridStudentRow {
  id: string
  name: string
}

export interface MarksGridData {
  graded_criterion_id: string
  criterion_label: string
  criterion_max_marks: string
  tasks: MarksGridTaskCol[]
  students: MarksGridStudentRow[]
  marks: Record<string, string | null>
}

export interface SaveMarksGridEntry {
  student_id: string
  graded_criterion_teacher_task_id: string
  mark?: number | null
}

export interface SaveMarksGridBody {
  group_id: string
  course_id: string
  graded_criterion_id: string
  entries: SaveMarksGridEntry[]
}

class GradedCriterionTaskApi extends BaseApiService {
  async getEligibleCourses(schoolId: number): Promise<EligibleGradedCourse[]> {
    return this.get<EligibleGradedCourse[]>(
      `/graded-criterion-tasks/eligible-courses?school_id=${schoolId}`,
    )
  }

  async getSummary(courseId: string, schoolId: number): Promise<CriterionTaskSummary[]> {
    return this.get<CriterionTaskSummary[]>(
      `/graded-criterion-tasks/courses/${encodeURIComponent(courseId)}/summary?school_id=${schoolId}`,
    )
  }

  async appendTask(body: AppendTaskBody): Promise<GradedCriterionTaskRow & { id: string }> {
    return this.post(`/graded-criterion-tasks`, body)
  }

  async syncTasks(body: SyncTasksBody): Promise<{ groups_touched: number; tasks_created: number }> {
    return this.post(`/graded-criterion-tasks/sync`, body)
  }

  async patchTask(
    taskId: string,
    body: { description?: string | null; due_date?: string | null; sort_order?: number },
  ): Promise<GradedCriterionTaskRow & { id: string }> {
    return this.patch(`/graded-criterion-tasks/${encodeURIComponent(taskId)}`, body)
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.delete(`/graded-criterion-tasks/${encodeURIComponent(taskId)}`)
  }

  async getMarksGrid(params: {
    schoolId: number
    groupId: string
    courseId: string
    gradedCriterionId: string
  }): Promise<MarksGridData> {
    const q = new URLSearchParams({
      school_id: String(params.schoolId),
      group_id: params.groupId,
      course_id: params.courseId,
      graded_criterion_id: params.gradedCriterionId,
    })
    return this.get<MarksGridData>(`/graded-criterion-tasks/marks-grid?${q.toString()}`)
  }

  async saveMarksGrid(schoolId: number, body: SaveMarksGridBody): Promise<{ saved: number }> {
    return this.post<{ saved: number }>(
      `/graded-criterion-tasks/marks-grid?school_id=${schoolId}`,
      body,
    )
  }
}

export const gradedCriterionTaskService = new GradedCriterionTaskApi()
export default gradedCriterionTaskService
