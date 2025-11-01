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
import { AcademicYearService } from '../services/academic-year.service';
import type { CreateAcademicYearDto, UpdateAcademicYearDto } from '../services/academic-year.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
    try {
      const academicYear = await this.academicYearService.create(createAcademicYearDto);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year created successfully'
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
  async findAll(@Query('schoolId') schoolId?: string) {
    try {
      const academicYears = await this.academicYearService.findAll(
        schoolId ? parseInt(schoolId) : undefined
      );
      return {
        success: true,
        data: academicYears,
        count: academicYears.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('active')
  async findActive(@Query('schoolId') schoolId?: string) {
    try {
      const activeYear = await this.academicYearService.findActive(
        schoolId ? parseInt(schoolId) : undefined
      );
      return {
        success: true,
        data: activeYear
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
  async getStatistics(@Query('schoolId') schoolId?: string) {
    try {
      const statistics = await this.academicYearService.getStatistics(
        schoolId ? parseInt(schoolId) : undefined
      );
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const academicYear = await this.academicYearService.findOne(id);
      return {
        success: true,
        data: academicYear
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
  async update(@Param('id') id: string, @Body() updateAcademicYearDto: UpdateAcademicYearDto) {
    try {
      const academicYear = await this.academicYearService.update(id, updateAcademicYearDto);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/activate')
  async setActive(@Param('id') id: string) {
    try {
      const academicYear = await this.academicYearService.setActive(id);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year activated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    try {
      const academicYear = await this.academicYearService.archive(id);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year archived successfully'
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
      await this.academicYearService.remove(id);
      return {
        success: true,
        message: 'Academic year deleted successfully'
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