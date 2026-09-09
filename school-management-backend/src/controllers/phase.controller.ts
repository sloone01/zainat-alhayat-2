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
import type { UpdatePhaseDto } from '../services/phase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import { CreatePhaseDto } from '../dto/create-core-records.dto';

@Controller('phases')
@UseGuards(JwtAuthGuard)
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPhaseDto: CreatePhaseDto, @Req() req: { user: User }) {
    try {
      const phase = await this.phaseService.create(createPhaseDto, this.schoolOf(req));
      return {
        success: true,
        data: phase,
        message: 'Phase created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    try {
      const phases = await this.phaseService.findAll(this.schoolOf(req));
      return {
        success: true,
        data: phases,
        count: phases.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const phase = await this.phaseService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: phase
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto, @Req() req: { user: User }) {
    try {
      const phase = await this.phaseService.update(id, updatePhaseDto, this.schoolOf(req));
      return {
        success: true,
        data: phase,
        message: 'Phase updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Body() body: { newName?: string }, @Req() req: { user: User }) {
    try {
      const duplicatedPhase = await this.phaseService.duplicatePhase(id, body.newName, this.schoolOf(req));
      return {
        success: true,
        data: duplicatedPhase,
        message: 'Phase duplicated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch('course/:courseId/reorder')
  async reorderPhases(
    @Param('courseId') courseId: string,
    @Body() body: { phaseOrders: { id: string; order: number }[] },
    @Req() req: { user: User },
  ) {
    try {
      const phases = await this.phaseService.reorderPhases(courseId, body.phaseOrders, this.schoolOf(req));
      return {
        success: true,
        data: phases,
        message: 'Phases reordered successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
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
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      await this.phaseService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Phase deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

}

