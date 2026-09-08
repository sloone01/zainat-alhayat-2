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
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import type { CreateCourseDto, UpdateCourseDto } from '../services/course.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('courses')
@RequireClaim('courses', 'view')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) {}

  /** School the caller may act in; a mismatched ?school_id is rejected, not honoured. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n =
      requested == null || requested === ''
        ? undefined
        : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @RequireClaim('courses', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: CreateCourseDto, @Req() req: { user: User }) {
    this.logger.log(`POST /courses - Creating course: ${JSON.stringify(createCourseDto)}`);
    try {
      const course = await this.courseService.create(
        createCourseDto,
        this.schoolOf(req, createCourseDto.school_id),
      );
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
    @Req() req: { user: User },
    @Query('school_id') schoolId?: string,
    @Query('course_kind') courseKind?: string,
  ) {
    // Derived from the token: a query param alone used to return any school's courses.
    const schoolIdNum = this.schoolOf(req, schoolId) ?? undefined;
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
      // Rethrow: returning an empty list with HTTP 200 hid the failure (and hid a
      // 403 'Wrong school' behind what looked like "this school has no courses").
      throw error;
    }
  }

  @Get('search')
  async search(
    @Req() req: { user: User },
    @Query('term') searchTerm: string,
    @Query('school_id') schoolId?: string,
  ) {
    return {
      success: true,
      data: await this.courseService.searchCourses(
        this.schoolOf(req, schoolId) as number,
        searchTerm,
      ),
      message: 'Course search completed successfully',
    };
  }

  @Get('age-group/:minAge/:maxAge')
  async findByAgeGroup(
    @Req() req: { user: User },
    @Param('minAge', ParseIntPipe) minAge: number,
    @Param('maxAge', ParseIntPipe) maxAge: number,
    @Query('school_id') schoolId?: string,
  ) {
    return {
      success: true,
      data: await this.courseService.findByAgeGroup(
        this.schoolOf(req, schoolId) as number,
        minAge,
        maxAge,
      ),
      message: 'Courses by age group retrieved successfully',
    };
  }

  @Get('status/:isActive')
  async findByStatus(
    @Req() req: { user: User },
    @Param('isActive') isActive: string,
    @Query('school_id') schoolId?: string,
  ) {
    const isActiveBool = isActive === 'true';
    return {
      success: true,
      data: await this.courseService.findByStatus(
        this.schoolOf(req, schoolId) as number,
        isActiveBool,
      ),
      message: 'Courses by status retrieved successfully',
    };
  }

  @Get('active')
  async findActive(@Req() req: { user: User }, @Query('school_id') schoolId?: string) {
    return {
      success: true,
      data: await this.courseService.findActiveCourses(
        this.schoolOf(req, schoolId) as number,
      ),
      message: 'Active courses retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    this.logger.log(`GET /courses/${id} - Finding course with id: ${id}`);
    try {
      const course = await this.courseService.findOne(id, this.schoolOf(req));
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
  async getStatistics(@Param('id') id: string, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.courseService.getCourseStatistics(id, this.schoolOf(req)),
      message: 'Course statistics retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('courses', 'edit')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.courseService.update(id, updateCourseDto, this.schoolOf(req)),
      message: 'Course updated successfully',
    };
  }

  @Patch(':id/status')
  @RequireClaim('courses', 'edit')
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.courseService.updateStatus(id, isActive, this.schoolOf(req)),
      message: 'Course status updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('courses', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    await this.courseService.remove(id, this.schoolOf(req));
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

