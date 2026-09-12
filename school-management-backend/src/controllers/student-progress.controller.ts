import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { StudentProgressService } from '../services/student-progress.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import type {
  CreateProgressDto,
  UpdateProgressDto,
  BulkProgressUpdateDto
} from '../services/student-progress.service';

@Controller('student-progress')
@RequireClaim('progress', 'view')
export class StudentProgressController {
  constructor(private readonly progressService: StudentProgressService) {}

  @Post()
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createProgressDto: CreateProgressDto,
  ) {
    return {
      success: true,
      data: await this.progressService.create(createProgressDto, req.user),
      message: 'Progress record created successfully',
    };
  }

  @Post('bulk-update')
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(
    @Request() req: { user: User },
    @Body() bulkUpdateDto: BulkProgressUpdateDto,
  ) {
    return {
      success: true,
      data: await this.progressService.bulkUpdate(bulkUpdateDto, req.user),
      message: 'Bulk progress update completed successfully',
    };
  }

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.progressService.findAll(),
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
    @Param('studentId') studentId: string,
    @Param('milestoneId') milestoneId: string,
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
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.progressService.findOne(id),
      message: 'Progress record retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('progress', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return {
      success: true,
      data: await this.progressService.update(id, updateProgressDto, req.user),
      message: 'Progress record updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('progress', 'edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.progressService.remove(id);
    return {
      success: true,
      message: 'Progress record deleted successfully',
    };
  }
}

