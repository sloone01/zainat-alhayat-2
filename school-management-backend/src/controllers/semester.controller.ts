import {
  BadRequestException,
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
  Request,
} from '@nestjs/common';
import { SemesterService } from '../services/semester.service';
import type { CreateSemesterDto, UpdateSemesterDto } from '../services/semester.service';
import { AcademicYearService } from '../services/academic-year.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('semesters')
@UseGuards(JwtAuthGuard)
@RequireClaim('settings', 'view')
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
    private readonly academicYearService: AcademicYearService,
  ) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  private async assertAcademicYearAccess(req: { user: User }, academicYearId: string) {
    const academicYear = await this.academicYearService.findOne(academicYearId);
    assertSameSchool(req.user, academicYear.school_id);
    return academicYear;
  }

  private async assertSemesterAccess(req: { user: User }, id: string) {
    const semester = await this.semesterService.findOne(id);
    assertSameSchool(req.user, semester.academicYear?.school_id);
    return semester;
  }

  @Post()
  @RequireClaim('settings', 'edit')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: { user: User }, @Body() createSemesterDto: CreateSemesterDto) {
    try {
      const schoolId = this.schoolOf(req);
      await this.assertAcademicYearAccess(req, createSemesterDto.academic_year_id);
      const semester = await this.semesterService.create(createSemesterDto, schoolId);
      return {
        success: true,
        data: semester,
        message: 'Semester created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get()
  async findAll(
    @Request() req: { user: User },
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      if (academicYearId) {
        await this.assertAcademicYearAccess(req, academicYearId);
      }
      const semesters = await this.semesterService.findAll(resolvedSchoolId, academicYearId);
      return {
        success: true,
        data: semesters,
        count: semesters.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('current')
  async findCurrentSemester(
    @Request() req: { user: User },
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      if (academicYearId) {
        await this.assertAcademicYearAccess(req, academicYearId);
      }
      const currentSemester = await this.semesterService.findCurrentSemester(
        resolvedSchoolId,
        academicYearId,
      );
      return {
        success: true,
        data: currentSemester,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('statistics')
  async getStatistics(
    @Request() req: { user: User },
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      if (academicYearId) {
        await this.assertAcademicYearAccess(req, academicYearId);
      }
      const statistics = await this.semesterService.getStatistics(resolvedSchoolId, academicYearId);
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Request() req: { user: User },
    @Param('academicYearId') academicYearId: string,
  ) {
    try {
      await this.assertAcademicYearAccess(req, academicYearId);
      const semesters = await this.semesterService.findByAcademicYear(academicYearId);
      return {
        success: true,
        data: semesters,
        count: semesters.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('academic-year/:academicYearId/validate')
  async validateSemesterOrder(
    @Request() req: { user: User },
    @Param('academicYearId') academicYearId: string,
  ) {
    try {
      await this.assertAcademicYearAccess(req, academicYearId);
      const validation = await this.semesterService.validateSemesterOrder(academicYearId);
      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const semester = await this.assertSemesterAccess(req, id);
      return {
        success: true,
        data: semester,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':id')
  @RequireClaim('settings', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    try {
      await this.assertSemesterAccess(req, id);
      const semester = await this.semesterService.update(id, updateSemesterDto);
      return {
        success: true,
        data: semester,
        message: 'Semester updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Delete(':id')
  @RequireClaim('settings', 'manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      await this.assertSemesterAccess(req, id);
      await this.semesterService.remove(id);
      return {
        success: true,
        message: 'Semester deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }
}
