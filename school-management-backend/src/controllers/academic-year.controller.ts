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
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  /** School the caller may act in; a mismatched ?schoolId is rejected, not honoured. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAcademicYearDto: CreateAcademicYearDto,
    @Req() req: { user: User },
  ) {
    try {
      const academicYear = await this.academicYearService.create(
        createAcademicYearDto,
        this.schoolOf(req, createAcademicYearDto.school_id),
      );
      return {
        success: true,
        data: academicYear,
        message: 'Academic year created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      // Derived from the token: the query param alone returned every school's years.
      const academicYears = await this.academicYearService.findAll(
        this.schoolOf(req, schoolId) ?? undefined,
      );
      return {
        success: true,
        data: academicYears,
        count: academicYears.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('active')
  async findActive(@Req() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      const activeYear = await this.academicYearService.findActive(
        this.schoolOf(req, schoolId) ?? undefined,
      );
      return {
        success: true,
        data: activeYear
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('statistics')
  async getStatistics(@Req() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      const statistics = await this.academicYearService.getStatistics(
        this.schoolOf(req, schoolId) ?? undefined,
      );
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const academicYear = await this.academicYearService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: academicYear
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
    @Req() req: { user: User },
  ) {
    try {
      const academicYear = await this.academicYearService.update(
        id,
        updateAcademicYearDto,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: academicYear,
        message: 'Academic year updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id/activate')
  async setActive(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const academicYear = await this.academicYearService.setActive(id, this.schoolOf(req));
      return {
        success: true,
        data: academicYear,
        message: 'Academic year activated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const academicYear = await this.academicYearService.archive(id, this.schoolOf(req));
      return {
        success: true,
        data: academicYear,
        message: 'Academic year archived successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      await this.academicYearService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Academic year deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}