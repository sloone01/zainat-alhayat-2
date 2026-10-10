import { BaseApiService } from './api'
import type { PageResult } from '@/composables/useServerPagination'

export interface CourseEnrollmentRow {
  id: string
  student_id: string
  course_id: string
  school_id: string
  status: 'active' | 'dropped'
  student_payment_id: string | null
  enrolled_at: string
  dropped_at: string | null
  student?: {
    id: string
    firstName: string
    secondName?: string | null
    secondNameEn?: string | null
    lastName: string
    first_name_ar?: string | null
    first_name_en?: string | null
    last_name_ar?: string | null
    last_name_en?: string | null
  }
  course?: { id: string; name: string; title?: string }
  payment?: { id: string; base_total_amount: string; currency: string } | null
}

export interface EnrollableCourseRow {
  course: { id: string; name: string; title?: string; description?: string; maxStudents?: number }
  profile_id: string
  base_total: number
  currency: string
  already_enrolled: boolean
}

export interface CourseEnrollmentStudentRow {
  id: string
  firstName: string
  lastName: string
}

export interface EnrollCourseResult {
  course_id: string
  results: Array<{ student_id: string; status: string; enrollment_id?: string; message?: string }>
}

export interface EnrollStudentResult {
  student_id: string
  results: Array<{ course_id: string; status: string; enrollment_id?: string; message?: string }>
}

class CourseEnrollmentService extends BaseApiService {
  list(params: { school_id?: string; course_id?: string; student_id?: string; status?: string }) {
    return this.get<CourseEnrollmentRow[]>('/course-enrollments', params)
  }

  listPage(params: {
    school_id?: string
    course_id?: string
    student_id?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<PageResult<CourseEnrollmentRow>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.school_id) query.school_id = params.school_id
    if (params.course_id) query.course_id = params.course_id
    if (params.student_id) query.student_id = params.student_id
    if (params.status) query.status = params.status
    return this.get('/course-enrollments', query)
  }

  listEnrollableCourses(schoolId?: string, studentId?: string) {
    return this.get<EnrollableCourseRow[]>('/course-enrollments/enrollable-courses', {
      ...(schoolId ? { school_id: schoolId } : {}),
      ...(studentId ? { student_id: studentId } : {}),
    })
  }

  listEnrollableCoursesPage(params: {
    schoolId?: string
    studentId?: string
    page?: number
    limit?: number
  }): Promise<PageResult<EnrollableCourseRow>> {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
    if (params.schoolId) query.school_id = params.schoolId
    if (params.studentId) query.student_id = params.studentId
    return this.get('/course-enrollments/enrollable-courses', query)
  }

  listAvailableStudents() {
    return this.get<CourseEnrollmentStudentRow[]>('/course-enrollments/available-students', undefined, {
      timeout: 60000,
    })
  }

  enrollStudentsToCourse(courseId: string, studentIds: string[]) {
    return this.post<EnrollCourseResult>('/course-enrollments/enroll-course', {
      course_id: courseId,
      student_ids: studentIds,
    })
  }

  enrollStudentInCourses(studentId: string, courseIds: string[]) {
    return this.post<EnrollStudentResult>('/course-enrollments/enroll-student', {
      student_id: studentId,
      course_ids: courseIds,
    })
  }

  drop(enrollmentId: string) {
    return this.delete<{ id: string; status: string }>(`/course-enrollments/${enrollmentId}`)
  }
}

export const courseEnrollmentService = new CourseEnrollmentService()
export default courseEnrollmentService
