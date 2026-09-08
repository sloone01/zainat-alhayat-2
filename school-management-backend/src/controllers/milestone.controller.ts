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
import { MilestoneService } from '../services/milestone.service';
import type { CreateMilestoneDto, UpdateMilestoneDto } from '../services/milestone.service';
import { PhaseService } from '../services/phase.service';
import { CourseService } from '../services/course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool } from '../common/security/school-access';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
@RequireClaim('courses', 'view')
export class MilestoneController {
  constructor(
    private readonly milestoneService: MilestoneService,
    private readonly phaseService: PhaseService,
    private readonly courseService: CourseService,
  ) {}

  private async assertCourseAccess(req: { user: User }, courseId: string) {
    const course = await this.courseService.findOne(courseId);
    assertSameSchool(req.user, course.school_id);
    return course;
  }

  private async assertPhaseAccess(req: { user: User }, phaseId: string) {
    const phase = await this.phaseService.findOne(phaseId);
    this.assertPhaseSchool(req, phase);
    return phase;
  }

  private assertPhaseSchool(req: { user: User }, phase: { course?: { school_id?: number } }) {
    assertSameSchool(req.user, phase.course?.school_id);
  }

  private assertMilestoneAccess(req: { user: User }, milestone: { phase?: { course?: { school_id?: number } } }) {
    assertSameSchool(req.user, milestone.phase?.course?.school_id);
  }

  @Post()
  @RequireClaim('courses', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createMilestoneDto: CreateMilestoneDto,
  ) {
    try {
      await this.assertPhaseAccess(req, createMilestoneDto.phaseId);
      const milestone = await this.milestoneService.create(createMilestoneDto);
      return {
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('phase/:phaseId')
  async findByPhase(
    @Request() req: { user: User },
    @Param('phaseId') phaseId: string,
  ) {
    try {
      await this.assertPhaseAccess(req, phaseId);
      const milestones = await this.milestoneService.findByPhase(phaseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
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
      const milestones = await this.milestoneService.findByCourse(courseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('phase/:phaseId/required')
  async getRequiredMilestones(
    @Request() req: { user: User },
    @Param('phaseId') phaseId: string,
  ) {
    try {
      await this.assertPhaseAccess(req, phaseId);
      const milestones = await this.milestoneService.getRequiredMilestones(phaseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
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
      const milestone = await this.milestoneService.findOne(id);
      this.assertMilestoneAccess(req, milestone);
      return {
        success: true,
        data: milestone
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id/stats')
  async getStats(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const milestone = await this.milestoneService.findOne(id);
      this.assertMilestoneAccess(req, milestone);
      const stats = await this.milestoneService.getMilestoneStats(id);
      return {
        success: true,
        data: stats
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
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    try {
      const existing = await this.milestoneService.findOne(id);
      this.assertMilestoneAccess(req, existing);
      if (updateMilestoneDto.phaseId) {
        await this.assertPhaseAccess(req, updateMilestoneDto.phaseId);
      }
      const milestone = await this.milestoneService.update(id, updateMilestoneDto);
      return {
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
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
      const existing = await this.milestoneService.findOne(id);
      this.assertMilestoneAccess(req, existing);
      const duplicatedMilestone = await this.milestoneService.duplicateMilestone(id, body.newName);
      return {
        success: true,
        data: duplicatedMilestone,
        message: 'Milestone duplicated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch('phase/:phaseId/reorder')
  @RequireClaim('courses', 'edit')
  async reorderMilestones(
    @Request() req: { user: User },
    @Param('phaseId') phaseId: string,
    @Body() body: { milestoneOrders: { id: string; order: number }[] }
  ) {
    try {
      await this.assertPhaseAccess(req, phaseId);
      const milestones = await this.milestoneService.reorderMilestones(phaseId, body.milestoneOrders);
      return {
        success: true,
        data: milestones,
        message: 'Milestones reordered successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('phase/:phaseId/next-order')
  async getNextOrder(
    @Request() req: { user: User },
    @Param('phaseId') phaseId: string,
  ) {
    try {
      await this.assertPhaseAccess(req, phaseId);
      const nextOrder = await this.milestoneService.getNextOrder(phaseId);
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
      const milestone = await this.milestoneService.findOne(id);
      this.assertMilestoneAccess(req, milestone);
      await this.milestoneService.remove(id);
      return {
        success: true,
        message: 'Milestone deleted successfully'
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
