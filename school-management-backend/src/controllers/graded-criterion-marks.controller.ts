import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { GradedCriterionMarksService } from '../services/graded-criterion-marks.service';
import { SaveCriterionMarksGridDto } from '../dto/graded-criterion-marks.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId, RequestedSchoolIdPipe } from '../common/security/school-access';
import { wantsPage } from '../common/pagination';

@Controller('graded-criterion-marks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
@RequireClaim('teacher_graded_marks', 'view')
export class GradedCriterionMarksController {
  constructor(private readonly marksService: GradedCriterionMarksService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  /** Groups the marks screen lists (admin: school, teacher: assigned classes). */
  @Get('groups')
  async groups(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    if (!wantsPage(page)) {
      throw new BadRequestException('page is required');
    }
    const data = await this.marksService.listGroupsPage(schoolId, req.user, { page, limit });
    return { success: true, data };
  }

  /** Graded courses scheduled for one class. */
  @Get('group-courses')
  async groupCourses(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    if (!wantsPage(page)) {
      throw new BadRequestException('page is required');
    }
    const data = await this.marksService.listGroupCoursesPage(schoolId, groupId, req.user, {
      page,
      limit,
    });
    return { success: true, data };
  }

  /** Students × criteria grid for a graded course + class */
  @Get('grid')
  async grid(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.getMarksGrid(
      courseId,
      groupId,
      schoolId,
      wantsPage(page) ? { page, limit } : undefined,
    );
    return { success: true, data };
  }

  @Post('grid')
  @RequireClaim('teacher_graded_marks', 'edit')
  @HttpCode(HttpStatus.OK)
  async saveGrid(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: SaveCriterionMarksGridDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.saveMarksGrid(
      schoolId,
      body,
      req.user.id,
    );
    return { success: true, data, message: 'Marks saved' };
  }

  /** Course/class report: students and their marks + totals */
  @Get('reports/class')
  async classReport(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.classReport(
      courseId,
      groupId,
      schoolId,
    );
    return { success: true, data };
  }

  /** Student report: courses and calculated scores */
  @Get('reports/student')
  async studentReport(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('student_id', ParseUUIDPipe) studentId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.studentReport(studentId, schoolId);
    return { success: true, data };
  }
}
