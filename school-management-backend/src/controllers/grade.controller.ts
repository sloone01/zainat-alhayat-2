import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  Request,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { GradeService } from '../services/grade.service';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';
import { User } from '../entities/user.entity';
import {
  resolveActorSchoolId,
  RequestedSchoolIdPipe,
  coerceRequestedSchoolId,
} from '../common/security/school-access';

@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Request() req: { user: User },
    @Body() createGradeDto: CreateGradeDto,
  ) {
    const schoolId = this.schoolOf(req);
    const grade = await this.gradeService.create(schoolId, createGradeDto);
    return {
      success: true,
      data: grade,
      message: 'Grade created successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'view')
  async findAll(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const grades = await this.gradeService.findAll(schoolId);
    return {
      success: true,
      data: grades,
      count: grades.length,
    };
  }

  /** Public — enrollment form. Requires school_id (UUID). */
  @Get('active')
  @Public()
  async findActive(
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const schoolId = coerceRequestedSchoolId(requestedSchoolId);
    if (!schoolId) {
      throw new BadRequestException('school_id is required');
    }
    const grades = await this.gradeService.findActive(schoolId);
    return {
      success: true,
      data: grades,
      count: grades.length,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'view')
  async findOne(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const grade = await this.gradeService.findOne(id, schoolId);
    return {
      success: true,
      data: grade,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    const schoolId = this.schoolOf(req);
    const grade = await this.gradeService.update(id, schoolId, updateGradeDto);
    return {
      success: true,
      data: grade,
      message: 'Grade updated successfully',
    };
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async reorder(
    @Request() req: { user: User },
    @Body('gradeIds') gradeIds: string[],
  ) {
    const schoolId = this.schoolOf(req);
    const grades = await this.gradeService.reorder(schoolId, gradeIds);
    return {
      success: true,
      data: grades,
      message: 'Grades reordered successfully',
    };
  }

  @Post('initialize-defaults')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'create')
  @HttpCode(HttpStatus.OK)
  async initializeDefaults(@Request() req: { user: User }) {
    const schoolId = this.schoolOf(req);
    await this.gradeService.initializeDefaultGrades(schoolId);
    return {
      success: true,
      message: 'Default grades initialized successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const schoolId = this.schoolOf(req);
    await this.gradeService.remove(id, schoolId);
    return {
      success: true,
      message: 'Grade deleted successfully',
    };
  }
}
