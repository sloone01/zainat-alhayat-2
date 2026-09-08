import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import type { CreateCourseDto, UpdateCourseDto } from '../services/course.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId, assertSameSchool } from '../common/security/school-access';

@Controller('courses')
@RequireClaim('courses', 'view')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @RequireClaim('courses', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createCourseDto: CreateCourseDto,
  ) {
    const schoolId = this.schoolOf(req, createCourseDto.school_id);
    createCourseDto.school_id = schoolId;
    this.logger.log(`POST /courses - Creating course: ${JSON.stringify(createCourseDto)}`);
    try {
      const course = await this.courseService.create(createCourseDto);
      this.logger.log(`POST /courses - Course created successfully with id: ${course.id}`);
      return {
        success: true,
        data: course,
        message: 'Course created successfully',
      };
    } catch (error) {
      this.logger.error(`POST /courses - Error creating course: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Request() req: { user: User },
    @Query('school_id') schoolId?: string,
    @Query('course_kind') courseKind?: string,
  ) {
    const requested = schoolId ? parseInt(schoolId, 10) : undefined;
    const schoolIdNum = this.schoolOf(req, requested);
    this.logger.log(
      `GET /courses - school_id: ${schoolIdNum}, course_kind: ${courseKind ?? 'any'}`,
    );
    try {
      const courses = await this.courseService.findAll(schoolIdNum, courseKind);
      this.logger.log(`GET /courses - Retrieved ${courses.length} courses for school_id: ${schoolIdNum}`);
      return {
        success: true,
        data: courses,
        message: courses.length > 0 ? 'Courses retrieved successfully' : 'No courses found in database',
        count: courses.length
      };
    } catch (error) {
      this.logger.error(`GET /courses - Database error: ${error.message}`, error.stack);
      return {
        success: false,
        data: [],
        message: error.message,
        error: 'DATABASE_ERROR',
        count: 0
      };
    }
  }

  @Get('search')
  async search(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('term') searchTerm: string,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    return {
      success: true,
      data: await this.courseService.searchCourses(scopedSchoolId, searchTerm),
      message: 'Course search completed successfully',
    };
  }

  @Get('age-group/:minAge/:maxAge')
  async findByAgeGroup(
    @Request() req: { user: User },
    @Param('minAge', ParseIntPipe) minAge: number,
    @Param('maxAge', ParseIntPipe) maxAge: number,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    return {
      success: true,
      data: await this.courseService.findByAgeGroup(scopedSchoolId, minAge, maxAge),
      message: 'Courses by age group retrieved successfully',
    };
  }

  @Get('status/:isActive')
  async findByStatus(
    @Request() req: { user: User },
    @Param('isActive') isActive: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    const isActiveBool = isActive === 'true';
    return {
      success: true,
      data: await this.courseService.findByStatus(scopedSchoolId, isActiveBool),
      message: 'Courses by status retrieved successfully',
    };
  }

  @Get('active')
  async findActive(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    return {
      success: true,
      data: await this.courseService.findActiveCourses(scopedSchoolId),
      message: 'Active courses retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    this.logger.log(`GET /courses/${id} - Finding course with id: ${id}`);
    try {
      const course = await this.courseService.findOne(id);
      assertSameSchool(req.user, course.school_id);
      this.logger.log(`GET /courses/${id} - Course retrieved successfully`);
      return {
        success: true,
        data: course,
        message: 'Course retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`GET /courses/${id} - Error retrieving course: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/statistics')
  async getStatistics(@Request() req: { user: User }, @Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    assertSameSchool(req.user, course.school_id);
    return {
      success: true,
      data: await this.courseService.getCourseStatistics(id),
      message: 'Course statistics retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('courses', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.courseService.findOne(id);
    assertSameSchool(req.user, course.school_id);
    return {
      success: true,
      data: await this.courseService.update(id, updateCourseDto),
      message: 'Course updated successfully',
    };
  }

  @Patch(':id/status')
  @RequireClaim('courses', 'edit')
  async updateStatus(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    const course = await this.courseService.findOne(id);
    assertSameSchool(req.user, course.school_id);
    return {
      success: true,
      data: await this.courseService.updateStatus(id, isActive),
      message: 'Course status updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('courses', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    assertSameSchool(req.user, course.school_id);
    await this.courseService.remove(id);
    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  @Get('debug/schema')
  @RequireClaim('courses', 'manage')
  async getSchema() {
    return {
      success: true,
      data: await this.courseService.getTableSchema(),
      message: 'Database schema retrieved successfully',
    };
  }
}
