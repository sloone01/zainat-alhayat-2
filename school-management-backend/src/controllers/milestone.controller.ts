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
import type { CreateMilestoneDto, UpdateMilestoneDto } from '../services/milestone.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMilestoneDto: CreateMilestoneDto) {
    try {
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

  @Get()
  async findAll() {
    try {
      const milestones = await this.milestoneService.findAll();
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      const milestone = await this.milestoneService.findOne(id);
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
  async getStats(@Param('id') id: string) {
    try {
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
  async update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto) {
    try {
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
  async duplicate(@Param('id') id: string, @Body() body: { newName?: string }) {
    try {
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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

