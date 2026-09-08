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
  Request,
} from '@nestjs/common';
import { PhaseService } from '../services/phase.service';
import type { CreatePhaseDto, UpdatePhaseDto } from '../services/phase.service';
import { CourseService } from '../services/course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool } from '../common/security/school-access';

@Controller('phases')
@UseGuards(JwtAuthGuard)
@RequireClaim('courses', 'view')
export class PhaseController {
  constructor(
    private readonly phaseService: PhaseService,
    private readonly courseService: CourseService,
  ) {}

  private async assertCourseAccess(req: { user: User }, courseId: string) {
    const course = await this.courseService.findOne(courseId);
    assertSameSchool(req.user, course.school_id);
    return course;
  }

  private assertPhaseAccess(req: { user: User }, phase: { course?: { school_id?: number } }) {
    assertSameSchool(req.user, phase.course?.school_id);
  }

  @Post()
  @RequireClaim('courses', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createPhaseDto: CreatePhaseDto,
  ) {
    try {
      await this.assertCourseAccess(req, createPhaseDto.courseId);
      const phase = await this.phaseService.create(createPhaseDto);
      return {
        success: true,
        data: phase,
        message: 'Phase created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('course/:courseId')
  async findByCourse(
    @Request() req: { user: User },
    @Param('courseId') courseId: string,
  ) {
    try {
      await this.assertCourseAccess(req, courseId);
      const phases = await this.phaseService.findByCourse(courseId);
      return {
        success: true,
        data: phases,
        count: phases.length
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
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const phase = await this.phaseService.findOne(id);
      this.assertPhaseAccess(req, phase);
      return {
        success: true,
        data: phase
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
  @RequireClaim('courses', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updatePhaseDto: UpdatePhaseDto,
  ) {
    try {
      const existing = await this.phaseService.findOne(id);
      this.assertPhaseAccess(req, existing);
      if (updatePhaseDto.courseId) {
        await this.assertCourseAccess(req, updatePhaseDto.courseId);
      }
      const phase = await this.phaseService.update(id, updatePhaseDto);
      return {
        success: true,
        data: phase,
        message: 'Phase updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Post(':id/duplicate')
  @RequireClaim('courses', 'create')
  async duplicate(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() body: { newName?: string },
  ) {
    try {
      const existing = await this.phaseService.findOne(id);
      this.assertPhaseAccess(req, existing);
      const duplicatedPhase = await this.phaseService.duplicatePhase(id, body.newName);
      return {
        success: true,
        data: duplicatedPhase,
        message: 'Phase duplicated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch('course/:courseId/reorder')
  @RequireClaim('courses', 'edit')
  async reorderPhases(
    @Request() req: { user: User },
    @Param('courseId') courseId: string,
    @Body() body: { phaseOrders: { id: string; order: number }[] }
  ) {
    try {
      await this.assertCourseAccess(req, courseId);
      const phases = await this.phaseService.reorderPhases(courseId, body.phaseOrders);
      return {
        success: true,
        data: phases,
        message: 'Phases reordered successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('course/:courseId/next-order')
  async getNextOrder(
    @Request() req: { user: User },
    @Param('courseId') courseId: string,
  ) {
    try {
      await this.assertCourseAccess(req, courseId);
      const nextOrder = await this.phaseService.getNextOrder(courseId);
      return {
        success: true,
        data: { nextOrder }
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
  @RequireClaim('courses', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const phase = await this.phaseService.findOne(id);
      this.assertPhaseAccess(req, phase);
      await this.phaseService.remove(id);
      return {
        success: true,
        message: 'Phase deleted successfully'
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
