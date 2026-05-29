import { BaseApiService } from './api'

export interface CourseEnrollmentRow {
  id: string
  student_id: string
  course_id: string
  school_id: number
  status: 'active' | 'dropped'
  student_payment_id: string | null
  enrolled_at: string
  dropped_at: string | null
  student?: { id: string; firstName: string; lastName: string }
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

export interface EnrollCourseResult {
  course_id: string
  results: Array<{ student_id: string; status: string; enrollment_id?: string; message?: string }>
}

export interface EnrollStudentResult {
  student_id: string
  results: Array<{ course_id: string; status: string; enrollment_id?: string; message?: string }>
}

class CourseEnrollmentService extends BaseApiService {
  list(params: { school_id?: number; course_id?: string; student_id?: string; status?: string }) {
    return this.get<CourseEnrollmentRow[]>('/course-enrollments', params)
  }

  listEnrollableCourses(schoolId: number, studentId?: string) {
    return this.get<EnrollableCourseRow[]>('/course-enrollments/enrollable-courses', {
      school_id: schoolId,
      ...(studentId ? { student_id: studentId } : {}),
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
