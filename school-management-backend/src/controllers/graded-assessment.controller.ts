import {
  BadRequestException,
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
  Request,
} from '@nestjs/common';
import { GradedAssessmentService } from '../services/graded-assessment.service';
import {
  CreateGradedCourseBodyDto,
  UpdateGradedCourseBodyDto,
} from '../dto/graded-assessment.dto';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('graded-assessment')
@RequireClaim('graded_courses', 'view')
export class GradedAssessmentController {
  private readonly logger = new Logger(GradedAssessmentController.name);

  constructor(
    private readonly gradedAssessmentService: GradedAssessmentService,
  ) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post('courses')
  @RequireClaim('graded_courses', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() body: CreateGradedCourseBodyDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    this.logger.log(`POST /graded-assessment/courses — ${body.name}`);
    const data = await this.gradedAssessmentService.createFull({
      ...body,
      school_id: schoolId,
    });
    return {
      success: true,
      data,
      message: 'Graded course created successfully',
    };
  }

  @Get('courses')
  async list(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
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
    @Request() req: { user: User },
    @Param('courseId') courseId: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
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
  @RequireClaim('graded_courses', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('courseId') courseId: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Body() body: UpdateGradedCourseBodyDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
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
