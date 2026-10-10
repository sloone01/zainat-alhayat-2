import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { resolveActorSchoolId, RequestedSchoolIdPipe } from '../common/security/school-access';
import { wantsPage } from '../common/pagination';
import { User } from '../entities/user.entity';
import { StudentCourseEnrollmentService } from '../services/student-course-enrollment.service';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import {
  EnrollStudentInCoursesDto,
  EnrollStudentsToCourseDto,
} from '../dto/student-course-enrollment.dto';

@Controller('course-enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentCourseEnrollmentController {
  constructor(private readonly enrollmentService: StudentCourseEnrollmentService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  private toEnrollmentRow(r: StudentCourseEnrollment) {
    return {
      id: r.id,
      student_id: r.student_id,
      course_id: r.course_id,
      school_id: r.school_id,
      status: r.status,
      student_payment_id: r.student_payment_id,
      enrolled_at: r.enrolled_at,
      dropped_at: r.dropped_at,
      student: r.student
        ? {
            id: r.student.id,
            firstName: r.student.firstName,
            secondName: r.student.secondName,
            secondNameEn: r.student.secondNameEn,
            lastName: r.student.lastName,
            first_name_ar: r.student.first_name_ar,
            first_name_en: r.student.first_name_en,
            last_name_ar: r.student.last_name_ar,
            last_name_en: r.student.last_name_en,
          }
        : undefined,
      course: r.course
        ? {
            id: r.course.id,
            name: r.course.name ?? r.course.title,
            title: r.course.title,
          }
        : undefined,
      payment: r.studentPayment
        ? {
            id: r.studentPayment.id,
            base_total_amount: r.studentPayment.base_total_amount,
            currency: r.studentPayment.currency,
          }
        : null,
    };
  }

  @Get()
  @Roles('admin', 'teacher', 'parent')
  async list(
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('course_id') courseId: string | undefined,
    @Query('student_id') studentId: string | undefined,
    @Query('status') status: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: { user: User },
  ) {
    const school_id = resolveActorSchoolId(req.user, requestedSchoolId) ?? undefined;
    const filters = {
      school_id,
      course_id: courseId,
      student_id: studentId,
      status,
    };
    if (wantsPage(page)) {
      const data = await this.enrollmentService.listPage(req.user, filters, { page, limit });
      return { success: true, data: { ...data, items: data.items.map((r) => this.toEnrollmentRow(r)) } };
    }
    const rows = await this.enrollmentService.list(req.user, filters);
    return {
      success: true,
      data: rows.map((r) => this.toEnrollmentRow(r)),
      count: rows.length,
    };
  }

  @Get('enrollable-courses')
  @Roles('admin', 'teacher', 'parent')
  async enrollableCourses(
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('student_id') studentId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Request() req: { user: User },
  ) {
    const schoolId =
      req.user.role === 'parent' ? undefined : this.schoolOf(req, requestedSchoolId);
    if (wantsPage(page)) {
      const data = await this.enrollmentService.listEnrollableCoursesPage(
        req.user,
        schoolId,
        studentId,
        { page, limit },
      );
      return {
        success: true,
        data: {
          ...data,
          items: data.items.map((r) => ({
            course: {
              id: r.course.id,
              name: r.course.name ?? r.course.title,
              title: r.course.title,
              description: r.course.description,
              maxStudents: r.course.maxStudents,
            },
            profile_id: r.profile_id,
            base_total: r.base_total,
            currency: r.currency,
            already_enrolled: r.already_enrolled,
          })),
        },
      };
    }
    const rows = await this.enrollmentService.listEnrollableCourses(req.user, schoolId, studentId);
    return {
      success: true,
      data: rows.map((r) => ({
        course: {
          id: r.course.id,
          name: r.course.name ?? r.course.title,
          title: r.course.title,
          description: r.course.description,
          maxStudents: r.course.maxStudents,
        },
        profile_id: r.profile_id,
        base_total: r.base_total,
        currency: r.currency,
        already_enrolled: r.already_enrolled,
      })),
      count: rows.length,
    };
  }

  @Get('available-students')
  @Roles('admin', 'teacher')
  @RequireClaim('course_enrollments', 'view')
  async availableStudents(
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const rows = await this.enrollmentService.listAvailableStudents(req.user, schoolId);
    return { success: true, data: rows, count: rows.length };
  }

  @Post('enroll-course')
  @Roles('admin', 'teacher')
  @RequireClaim('course_enrollments', 'create')
  async enrollCourse(@Body() dto: EnrollStudentsToCourseDto, @Request() req: { user: User }) {
    const result = await this.enrollmentService.enrollStudentsToCourse(
      req.user,
      dto.course_id,
      dto.student_ids,
    );
    return { success: true, data: result, message: 'Enrollment processed' };
  }

  @Post('enroll-student')
  @Roles('admin', 'teacher', 'parent')
  async enrollStudent(@Body() dto: EnrollStudentInCoursesDto, @Request() req: { user: User }) {
    const result = await this.enrollmentService.enrollStudentInCourses(
      req.user,
      dto.student_id,
      dto.course_ids,
    );
    return { success: true, data: result, message: 'Enrollment processed' };
  }

  @Delete(':id')
  @Roles('admin', 'teacher', 'parent')
  async drop(@Param('id') id: string, @Request() req: { user: User }) {
    const row = await this.enrollmentService.drop(req.user, id);
    return { success: true, data: { id: row.id, status: row.status }, message: 'Enrollment dropped' };
  }
}
