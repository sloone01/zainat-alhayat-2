import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { SemesterService } from '../services/semester.service';
import type { CreateSemesterDto, UpdateSemesterDto } from '../services/semester.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('semesters')
@UseGuards(JwtAuthGuard)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    try {
      const semester = await this.semesterService.create(createSemesterDto);
      return {
        success: true,
        data: semester,
        message: 'Semester created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get()
  async findAll(@Query('academicYearId') academicYearId?: string) {
    try {
      const semesters = await this.semesterService.findAll(academicYearId);
      return {
        success: true,
        data: semesters,
        count: semesters.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('current')
  async findCurrentSemester(@Query('academicYearId') academicYearId?: string) {
    try {
      const currentSemester = await this.semesterService.findCurrentSemester(academicYearId);
      return {
        success: true,
        data: currentSemester
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('statistics')
  async getStatistics(@Query('academicYearId') academicYearId?: string) {
    try {
      const statistics = await this.semesterService.getStatistics(academicYearId);
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(@Param('academicYearId') academicYearId: string) {
    try {
      const semesters = await this.semesterService.findByAcademicYear(academicYearId);
      return {
        success: true,
        data: semesters,
        count: semesters.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('academic-year/:academicYearId/validate')
  async validateSemesterOrder(@Param('academicYearId') academicYearId: string) {
    try {
      const validation = await this.semesterService.validateSemesterOrder(academicYearId);
      return {
        success: true,
        data: validation
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const semester = await this.semesterService.findOne(id);
      return {
        success: true,
        data: semester
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
    try {
      const semester = await this.semesterService.update(id, updateSemesterDto);
      return {
        success: true,
        data: semester,
        message: 'Semester updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.semesterService.remove(id);
      return {
        success: true,
        message: 'Semester deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }
}