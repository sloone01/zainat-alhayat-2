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

@Controller('courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: CreateCourseDto) {
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
  async findAll(@Query('school_id') schoolId?: string) {
    const schoolIdNum = schoolId ? parseInt(schoolId) : undefined;
    this.logger.log(`GET /courses - Finding all courses for school_id: ${schoolIdNum}`);
    try {
      const courses = await this.courseService.findAll(schoolIdNum);
      this.logger.log(`GET /courses - Retrieved ${courses.length} courses for school_id: ${schoolIdNum}`);
      return {
        success: true,
        data: courses,
        message: 'Courses retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`GET /courses - Error retrieving courses for school_id ${schoolIdNum}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('search')
  async search(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('term') searchTerm: string,
  ) {
    return {
      success: true,
      data: await this.courseService.searchCourses(schoolId, searchTerm),
      message: 'Course search completed successfully',
    };
  }

  @Get('age-group/:minAge/:maxAge')
  async findByAgeGroup(
    @Param('minAge', ParseIntPipe) minAge: number,
    @Param('maxAge', ParseIntPipe) maxAge: number,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    return {
      success: true,
      data: await this.courseService.findByAgeGroup(schoolId, minAge, maxAge),
      message: 'Courses by age group retrieved successfully',
    };
  }

  @Get('status/:isActive')
  async findByStatus(
    @Param('isActive') isActive: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const isActiveBool = isActive === 'true';
    return {
      success: true,
      data: await this.courseService.findByStatus(schoolId, isActiveBool),
      message: 'Courses by status retrieved successfully',
    };
  }

  @Get('active')
  async findActive(@Query('school_id', ParseIntPipe) schoolId: number) {
    return {
      success: true,
      data: await this.courseService.findActiveCourses(schoolId),
      message: 'Active courses retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /courses/${id} - Finding course with id: ${id}`);
    try {
      const course = await this.courseService.findOne(id);
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
  async getStatistics(@Param('id') id: string) {
    return {
      success: true,
      data: await this.courseService.getCourseStatistics(id),
      message: 'Course statistics retrieved successfully',
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return {
      success: true,
      data: await this.courseService.update(id, updateCourseDto),
      message: 'Course updated successfully',
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return {
      success: true,
      data: await this.courseService.updateStatus(id, isActive),
      message: 'Course status updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.courseService.remove(id);
    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  @Get('debug/schema')
  async getSchema() {
    return {
      success: true,
      data: await this.courseService.getTableSchema(),
      message: 'Database schema retrieved successfully',
    };
  }
}

