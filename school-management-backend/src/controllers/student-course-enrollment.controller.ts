import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { resolveActorSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { StudentCourseEnrollmentService } from '../services/student-course-enrollment.service';
import {
  EnrollStudentInCoursesDto,
  EnrollStudentsToCourseDto,
} from '../dto/student-course-enrollment.dto';

@Controller('course-enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentCourseEnrollmentController {
  constructor(private readonly enrollmentService: StudentCourseEnrollmentService) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get()
  @Roles('admin', 'teacher', 'parent')
  async list(
    @Query('school_id') schoolIdRaw: string | undefined,
    @Query('course_id') courseId: string | undefined,
    @Query('student_id') studentId: string | undefined,
    @Query('status') status: string | undefined,
    @Request() req: { user: User },
  ) {
    const requested =
      schoolIdRaw != null && schoolIdRaw !== '' ? Number(schoolIdRaw) : undefined;
    const school_id = resolveActorSchoolId(req.user, requested) ?? undefined;
    const rows = await this.enrollmentService.list(req.user, {
      school_id,
      course_id: courseId,
      student_id: studentId,
      status,
    });
    return {
      success: true,
      data: rows.map((r) => ({
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
              lastName: r.student.lastName,
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
      })),
      count: rows.length,
    };
  }

  @Get('enrollable-courses')
  @Roles('admin', 'teacher', 'parent')
  async enrollableCourses(
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('student_id') studentId: string | undefined,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
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

  @Post('enroll-course')
  @Roles('admin', 'teacher')
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
