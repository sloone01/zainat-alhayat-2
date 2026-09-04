import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GradedAssessmentService } from '../services/graded-assessment.service';
import {
  CreateGradedCourseBodyDto,
  UpdateGradedCourseBodyDto,
} from '../dto/graded-assessment.dto';

@Controller('graded-assessment')
@UseGuards(JwtAuthGuard)
export class GradedAssessmentController {
  private readonly logger = new Logger(GradedAssessmentController.name);

  constructor(
    private readonly gradedAssessmentService: GradedAssessmentService,
  ) {}

  @Post('courses')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateGradedCourseBodyDto) {
    this.logger.log(`POST /graded-assessment/courses — ${body.name}`);
    const data = await this.gradedAssessmentService.createFull(body);
    return {
      success: true,
      data,
      message: 'Graded course created successfully',
    };
  }

  @Get('courses')
  async list(@Query('school_id', ParseIntPipe) schoolId: number) {
    const data = await this.gradedAssessmentService.findGradedBySchool(schoolId);
    return {
      success: true,
      data,
      count: data.length,
      message:
        data.length > 0
          ? 'Graded courses retrieved successfully'
          : 'No graded courses found',
    };
  }

  @Get('courses/:courseId')
  async findOne(
    @Param('courseId') courseId: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.gradedAssessmentService.findGradedOne(
      courseId,
      schoolId,
    );
    return {
      success: true,
      data,
      message: 'Graded course retrieved successfully',
    };
  }

  @Patch('courses/:courseId')
  async update(
    @Param('courseId') courseId: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: UpdateGradedCourseBodyDto,
  ) {
    const data = await this.gradedAssessmentService.updateFull(
      courseId,
      schoolId,
      body,
    );
    return {
      success: true,
      data,
      message: 'Graded course updated successfully',
    };
  }
}
