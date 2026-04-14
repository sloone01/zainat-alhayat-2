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
import { GradeService } from '../services/grade.service';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';

@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get()
  async findAll() {
    try {
      const grades = await this.gradeService.findAll();
      return {
        success: true,
        data: grades,
        count: grades.length
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
  async findActive() {
    try {
      const grades = await this.gradeService.findActive();
      return {
        success: true,
        data: grades,
        count: grades.length
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
      const grade = await this.gradeService.findOne(id);
      return {
        success: true,
        data: grade
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Post('reorder')
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Post('initialize-defaults')
  @HttpCode(HttpStatus.OK)
  async initializeDefaults() {
    try {
      await this.gradeService.initializeDefaultGrades();
      return {
        success: true,
        message: 'Default grades initialized successfully'
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
      await this.gradeService.remove(id);
      return {
        success: true,
        message: 'Grade deleted successfully'
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