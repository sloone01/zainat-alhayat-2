import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GradedCriterionMarksService } from '../services/graded-criterion-marks.service';
import { SaveCriterionMarksGridDto } from '../dto/graded-criterion-marks.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('graded-criterion-marks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GradedCriterionMarksController {
  constructor(private readonly marksService: GradedCriterionMarksService) {}

  private schoolOf(req: { user: User }, requested: number): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  /** Students × criteria grid for a graded course + class */
  @Get('grid')
  async grid(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.getMarksGrid(
      courseId,
      groupId,
      schoolId,
    );
    return { success: true, data };
  }

  @Post('grid')
  @HttpCode(HttpStatus.OK)
  async saveGrid(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
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
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
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
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('student_id', ParseUUIDPipe) studentId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.marksService.studentReport(studentId, schoolId);
    return { success: true, data };
  }
}
