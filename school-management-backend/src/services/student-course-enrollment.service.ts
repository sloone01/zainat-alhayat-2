import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Course } from '../entities/course.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { CoursePaymentProfile } from '../entities/course-payment-profile.entity';
import { StudentPayment } from '../entities/student-payment.entity';
import { Parent } from '../entities/parent.entity';
import { Schedule } from '../entities/schedule.entity';
function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function computeCourseBaseTotal(profile: CoursePaymentProfile | null): number {
  if (!profile) return 0;
  const lines = profile.chargeLines ?? [];
  return roundMoney(lines.reduce((s, l) => s + Number(l.amount), 0));
}

export type CourseEnrollmentResult = {
  student_id: string;
  status: 'enrolled' | 'skipped' | 'error';
  enrollment_id?: string;
  message?: string;
};

@Injectable()
export class StudentCourseEnrollmentService {
  constructor(
    @InjectRepository(StudentCourseEnrollment)
    private readonly enrollmentRepo: Repository<StudentCourseEnrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CoursePaymentProfile)
    private readonly courseProfileRepo: Repository<CoursePaymentProfile>,
    @InjectRepository(StudentPayment)
    private readonly paymentRepo: Repository<StudentPayment>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  private assertSchool(user: User, schoolId: number): void {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only access your school');
    }
  }

  private async assertParentLinkedToStudent(user: User, studentId: string): Promise<void> {
    const cnt = await this.parentRepo
      .createQueryBuilder('p')
      .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
      .where('p.user_id = :uid', { uid: user.id })
      .andWhere('sp.student_id = :sid', { sid: studentId })
      .getCount();
    if (cnt === 0) {
      throw new ForbiddenException('You may only enroll your linked children');
    }
  }

  private async teacherTeachesCourse(userId: string, courseId: string): Promise<boolean> {
    const cnt = await this.scheduleRepo.count({
      where: { course_id: courseId, teacher_id: userId },
    });
    return cnt > 0;
  }

  private async teacherMayAccessStudent(userId: string, studentId: string): Promise<boolean> {
    const cnt = await this.studentRepo.manager
      .createQueryBuilder()
      .from('student_groups', 'sg')
      .innerJoin('groups', 'g', 'g.id = sg.group_id')
      .innerJoin('schedules', 'sch', 'sch.group_id = g.id AND sch.teacher_id = :tid', { tid: userId })
      .where('sg.student_id = :sid', { sid: studentId })
      .getCount();
    return cnt > 0;
  }

  private async assertCanEnrollStudents(user: User, course: Course, studentIds: string[]): Promise<void> {
    this.assertSchool(user, course.school_id);
    if (user.role === 'admin') return;
    if (user.role === 'teacher') {
      const teaches = await this.teacherTeachesCourse(user.id, course.id);
      if (!teaches) {
        throw new ForbiddenException('You may only enroll students in courses you teach');
      }
      for (const sid of studentIds) {
        const ok = await this.teacherMayAccessStudent(user.id, sid);
        if (!ok) {
          throw new ForbiddenException('One or more students are not in your groups');
        }
      }
      return;
    }
    if (user.role === 'parent') {
      if (studentIds.length !== 1) {
        throw new ForbiddenException('Parents enroll one child at a time');
      }
      await this.assertParentLinkedToStudent(user, studentIds[0]!);
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }

  private async assertCanEnrollCoursesForStudent(user: User, student: Student, courseIds: string[]): Promise<void> {
    this.assertSchool(user, student.school_id);
    if (user.role === 'admin') return;
    if (user.role === 'teacher') {
      for (const cid of courseIds) {
        const teaches = await this.teacherTeachesCourse(user.id, cid);
        if (!teaches) {
          throw new ForbiddenException('You may only enroll students in courses you teach');
        }
      }
      const ok = await this.teacherMayAccessStudent(user.id, student.id);
      if (!ok) {
        throw new ForbiddenException('This student is not in your groups');
      }
      return;
    }
    if (user.role === 'parent') {
      await this.assertParentLinkedToStudent(user, student.id);
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }

  private async loadCourseProfile(course: Course): Promise<CoursePaymentProfile> {
    const profile = await this.courseProfileRepo.findOne({
      where: { school_id: course.school_id, course_id: course.id },
      relations: ['chargeLines', 'chargeLines.chargeType'],
    });
    if (!profile) {
      throw new BadRequestException('COURSE_ENROLLMENT_NO_FEE_PROFILE');
    }
    const base = computeCourseBaseTotal(profile);
    if (base <= 0) {
      throw new BadRequestException('COURSE_ENROLLMENT_ZERO_FEES');
    }
    return profile;
  }

  private async assertCourseCapacity(courseId: string, adding: number): Promise<void> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    const max = course?.maxStudents;
    if (max == null || max <= 0) return;
    const active = await this.enrollmentRepo.count({
      where: { course_id: courseId, status: 'active' },
    });
    if (active + adding > max) {
      throw new BadRequestException('COURSE_ENROLLMENT_CAPACITY_FULL');
    }
  }

  private async enrollOne(
    user: User,
    student: Student,
    course: Course,
    profile: CoursePaymentProfile,
  ): Promise<CourseEnrollmentResult> {
    const existing = await this.enrollmentRepo.findOne({
      where: { student_id: student.id, course_id: course.id, status: 'active' },
    });
    if (existing) {
      return { student_id: student.id, status: 'skipped', message: 'Already enrolled' };
    }

    const base = computeCourseBaseTotal(profile);
    const currency = (profile.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();

    let payment = await this.paymentRepo.findOne({
      where: { student_id: student.id, course_id: course.id },
    });
    if (!payment) {
      payment = this.paymentRepo.create({
        student_id: student.id,
        school_id: student.school_id,
        course_id: course.id,
        course_payment_profile_id: profile.id,
        level_id: null,
        level_payment_profile_id: null,
        base_total_amount: String(base.toFixed(2)),
        admin_adjusted_total: null,
        currency,
      });
    } else {
      payment.course_payment_profile_id = profile.id;
      payment.base_total_amount = String(base.toFixed(2));
      payment.currency = currency;
      payment.admin_adjusted_total = null;
    }
    payment = await this.paymentRepo.save(payment);

    const enrollment = this.enrollmentRepo.create({
      student_id: student.id,
      course_id: course.id,
      school_id: course.school_id,
      status: 'active',
      student_payment_id: payment.id,
      enrolled_by_user_id: user.id,
      enrolled_at: new Date(),
      dropped_at: null,
    });
    const saved = await this.enrollmentRepo.save(enrollment);
    return { student_id: student.id, status: 'enrolled', enrollment_id: saved.id };
  }

  async list(
    user: User,
    filters: { school_id?: number; course_id?: string; student_id?: string; status?: string },
  ): Promise<StudentCourseEnrollment[]> {
    if (!['admin', 'teacher', 'parent'].includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.course_id) where.course_id = filters.course_id;
    if (filters.student_id) {
      if (user.role === 'parent') {
        await this.assertParentLinkedToStudent(user, filters.student_id);
      }
      where.student_id = filters.student_id;
    }
    if (filters.school_id != null) {
      this.assertSchool(user, filters.school_id);
      where.school_id = filters.school_id;
    } else if (user.school_id != null) {
      where.school_id = user.school_id;
    }

    if (user.role === 'teacher' && filters.course_id) {
      const teaches = await this.teacherTeachesCourse(user.id, filters.course_id);
      if (!teaches) throw new ForbiddenException('You may only view enrollments for courses you teach');
    }

    return this.enrollmentRepo.find({
      where,
      relations: ['student', 'course', 'studentPayment'],
      order: { enrolled_at: 'DESC' },
    });
  }

  async enrollStudentsToCourse(
    user: User,
    courseId: string,
    studentIds: string[],
  ): Promise<{ course_id: string; results: CourseEnrollmentResult[] }> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const uniqueIds = [...new Set(studentIds)];
    await this.assertCanEnrollStudents(user, course, uniqueIds);
    await this.assertCourseCapacity(courseId, uniqueIds.length);

    const profile = await this.loadCourseProfile(course);
    const students = await this.studentRepo.find({
      where: { id: In(uniqueIds), school_id: course.school_id },
    });
    const byId = new Map(students.map((s) => [s.id, s]));
    const results: CourseEnrollmentResult[] = [];

    for (const sid of uniqueIds) {
      const student = byId.get(sid);
      if (!student) {
        results.push({ student_id: sid, status: 'error', message: 'Student not found in this school' });
        continue;
      }
      try {
        results.push(await this.enrollOne(user, student, course, profile));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Enrollment failed';
        results.push({ student_id: sid, status: 'error', message: msg });
      }
    }

    return { course_id: courseId, results };
  }

  async enrollStudentInCourses(
    user: User,
    studentId: string,
    courseIds: string[],
  ): Promise<{ student_id: string; results: Array<{ course_id: string; status: string; enrollment_id?: string; message?: string }> }> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student?.school_id) throw new NotFoundException('Student not found');

    const uniqueCourseIds = [...new Set(courseIds)];
    await this.assertCanEnrollCoursesForStudent(user, student, uniqueCourseIds);

    const courses = await this.courseRepo.find({
      where: { id: In(uniqueCourseIds), school_id: student.school_id },
    });
    const courseById = new Map(courses.map((c) => [c.id, c]));
    const results: Array<{ course_id: string; status: string; enrollment_id?: string; message?: string }> = [];

    for (const cid of uniqueCourseIds) {
      const course = courseById.get(cid);
      if (!course) {
        results.push({ course_id: cid, status: 'error', message: 'Course not found' });
        continue;
      }
      try {
        await this.assertCourseCapacity(cid, 1);
        const profile = await this.loadCourseProfile(course);
        const r = await this.enrollOne(user, student, course, profile);
        results.push({
          course_id: cid,
          status: r.status,
          enrollment_id: r.enrollment_id,
          message: r.message,
        });
      } catch (e) {
        const msg =
          e instanceof BadRequestException
            ? String((e as BadRequestException).message)
            : e instanceof Error
              ? e.message
              : 'Enrollment failed';
        results.push({ course_id: cid, status: 'error', message: msg });
      }
    }

    return { student_id: studentId, results };
  }

  async drop(user: User, enrollmentId: string): Promise<StudentCourseEnrollment> {
    const row = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'student'],
    });
    if (!row) throw new NotFoundException('Enrollment not found');
    this.assertSchool(user, row.school_id);

    if (user.role === 'parent') {
      await this.assertParentLinkedToStudent(user, row.student_id);
    } else if (user.role === 'teacher') {
      const teaches = await this.teacherTeachesCourse(user.id, row.course_id);
      if (!teaches) throw new ForbiddenException('You may only drop enrollments for courses you teach');
    } else if (user.role !== 'admin') {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (row.status === 'dropped') return row;
    row.status = 'dropped';
    row.dropped_at = new Date();
    return this.enrollmentRepo.save(row);
  }

  /** Courses available for enrollment (active, with fee profile). */
  async listEnrollableCourses(user: User, schoolId: number, studentId?: string): Promise<
    Array<{
      course: Course;
      profile_id: string;
      base_total: number;
      currency: string;
      already_enrolled: boolean;
    }>
  > {
    this.assertSchool(user, schoolId);
    if (user.role === 'parent' && studentId) {
      await this.assertParentLinkedToStudent(user, studentId);
    }

    const courses = await this.courseRepo.find({
      where: { school_id: schoolId, is_active: true },
      order: { name: 'ASC' },
    });
    if (!courses.length) return [];

    const profiles = await this.courseProfileRepo.find({
      where: { school_id: schoolId, course_id: In(courses.map((c) => c.id)) },
      relations: ['chargeLines'],
    });
    const profileByCourse = new Map(profiles.map((p) => [p.course_id, p]));

    let enrolledCourseIds = new Set<string>();
    if (studentId) {
      const active = await this.enrollmentRepo.find({
        where: { student_id: studentId, status: 'active' },
        select: ['course_id'],
      });
      enrolledCourseIds = new Set(active.map((e) => e.course_id));
    }

    const out: Array<{
      course: Course;
      profile_id: string;
      base_total: number;
      currency: string;
      already_enrolled: boolean;
    }> = [];

    for (const course of courses) {
      if (user.role === 'teacher') {
        const teaches = await this.teacherTeachesCourse(user.id, course.id);
        if (!teaches) continue;
      }
      const profile = profileByCourse.get(course.id);
      if (!profile) continue;
      const base = computeCourseBaseTotal(profile);
      if (base <= 0) continue;
      out.push({
        course,
        profile_id: profile.id,
        base_total: base,
        currency: profile.currency ?? 'OMR',
        already_enrolled: enrolledCourseIds.has(course.id),
      });
    }

    return out;
  }
}
