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
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('semesters')
@UseGuards(JwtAuthGuard)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(
    @Req() req: { user: User },
    @Query('academicYearId') academicYearId?: string,
  ) {
    try {
      const semesters = await this.semesterService.findAll(
        academicYearId,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: semesters,
        count: semesters.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const semester = await this.semesterService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: semester
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto, @Req() req: { user: User }) {
    try {
      const semester = await this.semesterService.update(id, updateSemesterDto, this.schoolOf(req));
      return {
        success: true,
        data: semester,
        message: 'Semester updated successfully'
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
      await this.semesterService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Semester deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}