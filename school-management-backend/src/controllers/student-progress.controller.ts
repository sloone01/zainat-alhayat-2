import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { StudentProgressService } from '../services/student-progress.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import type { UpdateProgressDto, BulkProgressUpdateDto } from '../services/student-progress.service';
import { CreateProgressDto } from '../dto/create-core-records.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('student-progress')
@RequireClaim('progress', 'view')
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post()
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProgressDto: CreateProgressDto,
    @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.progressService.create(createProgressDto, this.schoolOf(req)),
      message: 'Progress record created successfully',
    };
  }

  @Post('bulk-update')
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(@Body() bulkUpdateDto: BulkProgressUpdateDto) {
    return {
      success: true,
      data: await this.progressService.bulkUpdate(bulkUpdateDto),
      message: 'Bulk progress update completed successfully',
    };
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    return {
      success: true,
      data: await this.progressService.findAll(this.schoolOf(req)),
      message: 'Progress records retrieved successfully',
    };
  }

  @Get('student/:studentId')
  async findByStudent(@Param('studentId') studentId: string) {
    return {
      success: true,
      data: await this.progressService.findByStudent(studentId),
      message: 'Student progress records retrieved successfully',
    };
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    return {
      success: true,
      data: await this.progressService.findByCourse(courseId),
      message: 'Course progress records retrieved successfully',
    };
  }

  @Get('milestone/:milestoneId')
  async findByMilestone(@Param('milestoneId') milestoneId: string) {
    return {
      success: true,
      data: await this.progressService.findByMilestone(milestoneId),
      message: 'Milestone progress records retrieved successfully',
    };
  }

  @Get('student/:studentId/course/:courseId')
  async findByStudentAndCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.progressService.findByStudentAndCourse(studentId, courseId),
      message: 'Student course progress retrieved successfully',
    };
  }

  @Get('student/:studentId/milestone/:milestoneId')
  async findByStudentAndMilestone(
    @Param('studentId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    studentId: string,
    @Param('milestoneId', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }))
    milestoneId: string,
  ) {
    return {
      success: true,
      data: await this.progressService.findByStudentAndMilestone(studentId, milestoneId),
      message: 'Student milestone progress retrieved successfully',
    };
  }

  @Get('summary/student/:studentId/course/:courseId')
  async getStudentCourseProgress(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.progressService.getStudentCourseProgress(studentId, courseId),
      message: 'Student course progress summary retrieved successfully',
    };
  }

  @Get('summary/course/:courseId')
  async getCourseProgressSummary(@Param('courseId') courseId: string) {
    return {
      success: true,
      data: await this.progressService.getCourseProgressSummary(courseId),
      message: 'Course progress summary retrieved successfully',
    };
  }

  @Get('summary/milestone/:milestoneId')
  async getMilestoneProgressSummary(@Param('milestoneId') milestoneId: string) {
    return {
      success: true,
      data: await this.progressService.getMilestoneProgressSummary(milestoneId),
      message: 'Milestone progress summary retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      success: true,
      data: await this.progressService.findOne(id),
      message: 'Progress record retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('progress', 'edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.progressService.update(id, updateProgressDto, this.schoolOf(req)),
      message: 'Progress record updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: User }) {
    await this.progressService.remove(id, this.schoolOf(req));
    return {
      success: true,
      message: 'Progress record deleted successfully',
    };
  }
}

