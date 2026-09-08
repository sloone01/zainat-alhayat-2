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
  Request,
} from '@nestjs/common';
import { ClassSettingsService } from '../services/class-settings.service';
import type { CreateClassSettingsDto, UpdateClassSettingsDto } from '../services/class-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('class-settings')
@UseGuards(JwtAuthGuard)
@RequireClaim('settings', 'view')
export class ClassSettingsController {
  constructor(private readonly classSettingsService: ClassSettingsService) {}

  private schoolOf(req: { user: User }): number {
    const schoolId = resolveActorSchoolId(req.user);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  private async assertSettingsAccess(req: { user: User }, id: string) {
    const classSettings = await this.classSettingsService.findOne(id);
    assertSameSchool(req.user, classSettings.school_id);
    return classSettings;
  }

  @Post()
  @RequireClaim('settings', 'edit')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createClassSettingsDto: CreateClassSettingsDto,
  ) {
    try {
      const classSettings = await this.classSettingsService.create(
        createClassSettingsDto,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: classSettings,
        message: 'Class settings created successfully',
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
  async findAll(@Request() req: { user: User }) {
    try {
      const classSettings = await this.classSettingsService.findAll(this.schoolOf(req));
      return {
        success: true,
        data: classSettings,
        count: classSettings.length,
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
  async findActive(@Request() req: { user: User }) {
    try {
      const activeSettings = await this.classSettingsService.findActive(this.schoolOf(req));
      return {
        success: true,
        data: activeSettings,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('default')
  async getOrCreateDefault(@Request() req: { user: User }) {
    try {
      const defaultSettings = await this.classSettingsService.getOrCreateDefault(this.schoolOf(req));
      return {
        success: true,
        data: defaultSettings,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('time-slots')
  async getAvailableTimeSlots(@Request() req: { user: User }) {
    try {
      const timeSlots = await this.classSettingsService.getAvailableTimeSlots(this.schoolOf(req));
      return {
        success: true,
        data: timeSlots,
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
      const classSettings = await this.assertSettingsAccess(req, id);
      return {
        success: true,
        data: classSettings,
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
    @Body() updateClassSettingsDto: UpdateClassSettingsDto,
  ) {
    try {
      const classSettings = await this.classSettingsService.update(
        id,
        updateClassSettingsDto,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: classSettings,
        message: 'Class settings updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':id/set-active')
  @RequireClaim('settings', 'edit')
  async setActive(@Request() req: { user: User }, @Param('id') id: string) {
    try {
      const classSettings = await this.classSettingsService.setActive(id, this.schoolOf(req));
      return {
        success: true,
        data: classSettings,
        message: 'Class settings activated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Post('durations')
  @RequireClaim('settings', 'edit')
  async addDuration(@Request() req: { user: User }, @Body() body: { duration: number; name?: string }) {
    try {
      const classSettings = await this.classSettingsService.addDuration(
        body.duration,
        this.schoolOf(req),
        body.name,
      );
      return {
        success: true,
        data: classSettings,
        message: 'Duration added successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch('durations/:id')
  @RequireClaim('settings', 'edit')
  async updateDuration(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() body: { duration: number; name?: string },
  ) {
    try {
      const classSettings = await this.classSettingsService.updateDuration(
        id,
        this.schoolOf(req),
        body,
      );
      return {
        success: true,
        data: classSettings,
        message: 'Duration updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Delete('durations/:duration')
  @RequireClaim('settings', 'edit')
  async removeDuration(@Request() req: { user: User }, @Param('duration') duration: string) {
    try {
      await this.classSettingsService.removeDuration(parseInt(duration, 10), this.schoolOf(req));
      return {
        success: true,
        message: 'Duration removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Post('start-times')
  @RequireClaim('settings', 'edit')
  async addStartTime(@Request() req: { user: User }, @Body() body: { startTime: string }) {
    try {
      const classSettings = await this.classSettingsService.addStartTime(
        body.startTime,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: classSettings,
        message: 'Start time added successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Delete('start-times/:startTime')
  @RequireClaim('settings', 'edit')
  async removeStartTime(@Request() req: { user: User }, @Param('startTime') startTime: string) {
    try {
      await this.classSettingsService.removeStartTime(startTime, this.schoolOf(req));
      return {
        success: true,
        message: 'Start time removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch('default-duration')
  @RequireClaim('settings', 'edit')
  async setDefaultDuration(@Request() req: { user: User }, @Body() body: { duration: number }) {
    try {
      const classSettings = await this.classSettingsService.setDefaultDuration(
        body.duration,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: classSettings,
        message: 'Default duration set successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Post('validate-time-slot')
  async validateTimeSlot(
    @Request() req: { user: User },
    @Body() body: { startTime: string; duration: number },
  ) {
    try {
      const isValid = await this.classSettingsService.validateTimeSlot(
        body.startTime,
        body.duration,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: { isValid },
        message: isValid ? 'Time slot is valid' : 'Time slot is invalid',
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
      await this.classSettingsService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Class settings deleted successfully',
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
