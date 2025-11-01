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
import { PhaseService } from '../services/phase.service';
import type { CreatePhaseDto, UpdatePhaseDto } from '../services/phase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('phases')
@UseGuards(JwtAuthGuard)
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPhaseDto: CreatePhaseDto) {
    try {
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

  @Get()
  async findAll() {
    try {
      const phases = await this.phaseService.findAll();
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

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    try {
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
  async findOne(@Param('id') id: string) {
    try {
      const phase = await this.phaseService.findOne(id);
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
  async update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto) {
    try {
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
  async duplicate(@Param('id') id: string, @Body() body: { newName?: string }) {
    try {
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
  async reorderPhases(
    @Param('courseId') courseId: string,
    @Body() body: { phaseOrders: { id: string; order: number }[] }
  ) {
    try {
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
  async getNextOrder(@Param('courseId') courseId: string) {
    try {
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
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

