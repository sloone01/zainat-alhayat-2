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
import { AcademicYearService } from '../services/academic-year.service';
import type { CreateAcademicYearDto, UpdateAcademicYearDto } from '../services/academic-year.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('academic-years')
@UseGuards(JwtAuthGuard)
@RequireClaim('settings', 'view')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  private async assertYearAccess(req: { user: User }, id: string) {
    const academicYear = await this.academicYearService.findOne(id);
    assertSameSchool(req.user, academicYear.school_id);
    return academicYear;
  }

  @Post()
  @RequireClaim('settings', 'edit')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createAcademicYearDto: CreateAcademicYearDto,
    @Query('schoolId') schoolId?: string,
  ) {
    try {
      const resolvedSchoolId = this.schoolOf(
        req,
        schoolId != null ? parseInt(schoolId, 10) : createAcademicYearDto.school_id,
      );
      const academicYear = await this.academicYearService.create({
        ...createAcademicYearDto,
        school_id: resolvedSchoolId,
      });
      return {
        success: true,
        data: academicYear,
        message: 'Academic year created successfully',
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
  async findAll(@Request() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      const academicYears = await this.academicYearService.findAll(resolvedSchoolId);
      return {
        success: true,
        data: academicYears,
        count: academicYears.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('active')
  async findActive(@Request() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      const activeYear = await this.academicYearService.findActive(resolvedSchoolId);
      return {
        success: true,
        data: activeYear,
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
  async getStatistics(@Request() req: { user: User }, @Query('schoolId') schoolId?: string) {
    try {
      const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
      const statistics = await this.academicYearService.getStatistics(resolvedSchoolId);
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

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const academicYear = await this.assertYearAccess(req, id);
      return {
        success: true,
        data: academicYear,
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
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
  ) {
    try {
      await this.assertYearAccess(req, id);
      const academicYear = await this.academicYearService.update(id, updateAcademicYearDto);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':id/activate')
  @RequireClaim('settings', 'edit')
  async setActive(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      await this.assertYearAccess(req, id);
      const academicYear = await this.academicYearService.setActive(id);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year activated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':id/archive')
  @RequireClaim('settings', 'edit')
  async archive(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      await this.assertYearAccess(req, id);
      const academicYear = await this.academicYearService.archive(id);
      return {
        success: true,
        data: academicYear,
        message: 'Academic year archived successfully',
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
      await this.assertYearAccess(req, id);
      await this.academicYearService.remove(id);
      return {
        success: true,
        message: 'Academic year deleted successfully',
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
