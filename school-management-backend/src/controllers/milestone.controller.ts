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
} from '@nestjs/common';
import { MilestoneService } from '../services/milestone.service';
import type { UpdateMilestoneDto } from '../services/milestone.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import { CreateMilestoneDto } from '../dto/create-core-records.dto';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMilestoneDto: CreateMilestoneDto, @Req() req: { user: User }) {
    try {
      const milestone = await this.milestoneService.create(createMilestoneDto, this.schoolOf(req));
      return {
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    try {
      const milestones = await this.milestoneService.findAll(this.schoolOf(req));
      return {
        success: true,
        data: milestones,
        count: milestones.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('phase/:phaseId')
  async findByPhase(@Param('phaseId') phaseId: string) {
    try {
      const milestones = await this.milestoneService.findByPhase(phaseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    try {
      const milestones = await this.milestoneService.findByCourse(courseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('phase/:phaseId/required')
  async getRequiredMilestones(@Param('phaseId') phaseId: string) {
    try {
      const milestones = await this.milestoneService.getRequiredMilestones(phaseId);
      return {
        success: true,
        data: milestones,
        count: milestones.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const milestone = await this.milestoneService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: milestone
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    try {
      const stats = await this.milestoneService.getMilestoneStats(id);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto, @Req() req: { user: User }) {
    try {
      const milestone = await this.milestoneService.update(id, updateMilestoneDto, this.schoolOf(req));
      return {
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Body() body: { newName?: string }) {
    try {
      const duplicatedMilestone = await this.milestoneService.duplicateMilestone(id, body.newName);
      return {
        success: true,
        data: duplicatedMilestone,
        message: 'Milestone duplicated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch('phase/:phaseId/reorder')
  async reorderMilestones(
    @Param('phaseId') phaseId: string,
    @Body() body: { milestoneOrders: { id: string; order: number }[] }
  ) {
    try {
      const milestones = await this.milestoneService.reorderMilestones(phaseId, body.milestoneOrders);
      return {
        success: true,
        data: milestones,
        message: 'Milestones reordered successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('phase/:phaseId/next-order')
  async getNextOrder(@Param('phaseId') phaseId: string) {
    try {
      const nextOrder = await this.milestoneService.getNextOrder(phaseId);
      return {
        success: true,
        data: { nextOrder }
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
      await this.milestoneService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Milestone deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}

