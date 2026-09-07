import {
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

@Controller('graded-criterion-marks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GradedCriterionMarksController {
  constructor(private readonly marksService: GradedCriterionMarksService) {}

  /** Students × criteria grid for a graded course + class */
  @Get('grid')
  async grid(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
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
    @Request() req: any,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: SaveCriterionMarksGridDto,
  ) {
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
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
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
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('student_id', ParseUUIDPipe) studentId: string,
  ) {
    const data = await this.marksService.studentReport(studentId, schoolId);
    return { success: true, data };
  }
}
