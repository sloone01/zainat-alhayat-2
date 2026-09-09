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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { GradeService } from '../services/grade.service';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';

@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createGradeDto: CreateGradeDto) {
    try {
      const grade = await this.gradeService.create(createGradeDto);
      return {
        success: true,
        data: grade,
        message: 'Grade created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'view')
  async findAll() {
    try {
      const grades = await this.gradeService.findAll();
      return {
        success: true,
        data: grades,
        count: grades.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  // Public — used by the student enrollment form (no login required)
  @Get('active')
  @Public()
  async findActive() {
    try {
      const grades = await this.gradeService.findActive();
      return {
        success: true,
        data: grades,
        count: grades.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'view')
  async findOne(@Param('id') id: string) {
    try {
      const grade = await this.gradeService.findOne(id);
      return {
        success: true,
        data: grade
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    try {
      const grade = await this.gradeService.update(id, updateGradeDto);
      return {
        success: true,
        data: grade,
        message: 'Grade updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async reorder(@Body('gradeIds') gradeIds: string[]) {
    try {
      const grades = await this.gradeService.reorder(gradeIds);
      return {
        success: true,
        data: grades,
        message: 'Grades reordered successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post('initialize-defaults')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'create')
  @HttpCode(HttpStatus.OK)
  async initializeDefaults() {
    try {
      await this.gradeService.initializeDefaultGrades();
      return {
        success: true,
        message: 'Default grades initialized successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('grade_levels', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.gradeService.remove(id);
      return {
        success: true,
        message: 'Grade deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}