import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClassSettingsService } from '../services/class-settings.service';
import type { CreateClassSettingsDto, UpdateClassSettingsDto } from '../services/class-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('class-settings')
@UseGuards(JwtAuthGuard)
export class ClassSettingsController {
  constructor(private readonly classSettingsService: ClassSettingsService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassSettingsDto: CreateClassSettingsDto) {
    try {
      const classSettings = await this.classSettingsService.create(createClassSettingsDto);
      return {
        success: true,
        data: classSettings,
        message: 'Class settings created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    try {
      const classSettings = await this.classSettingsService.findAll(this.schoolOf(req));
      return {
        success: true,
        data: classSettings,
        count: classSettings.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('active')
  async findActive() {
    try {
      const activeSettings = await this.classSettingsService.findActive();
      return {
        success: true,
        data: activeSettings
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('default')
  async getOrCreateDefault() {
    try {
      const defaultSettings = await this.classSettingsService.getOrCreateDefault();
      return {
        success: true,
        data: defaultSettings
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('time-slots')
  async getAvailableTimeSlots() {
    try {
      const timeSlots = await this.classSettingsService.getAvailableTimeSlots();
      return {
        success: true,
        data: timeSlots
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const classSettings = await this.classSettingsService.findOne(id);
      return {
        success: true,
        data: classSettings
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClassSettingsDto: UpdateClassSettingsDto) {
    try {
      const classSettings = await this.classSettingsService.update(id, updateClassSettingsDto);
      return {
        success: true,
        data: classSettings,
        message: 'Class settings updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id/set-active')
  async setActive(@Param('id') id: string) {
    try {
      const classSettings = await this.classSettingsService.setActive(id);
      return {
        success: true,
        data: classSettings,
        message: 'Class settings activated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post('durations')
  async addDuration(@Body() body: { duration: number; name?: string }) {
    try {
      const classSettings = await this.classSettingsService.addDuration(body.duration, body.name);
      return {
        success: true,
        data: classSettings,
        message: 'Duration added successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch('durations/:id')
  async updateDuration(
    @Param('id') id: string,
    @Body() body: { duration: number; name?: string },
  ) {
    try {
      const classSettings = await this.classSettingsService.updateDuration(id, body);
      return {
        success: true,
        data: classSettings,
        message: 'Duration updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete('durations/:duration')
  async removeDuration(@Param('duration') duration: string) {
    try {
      const classSettings = await this.classSettingsService.removeDuration(parseInt(duration));
      return {
        success: true,
        data: classSettings,
        message: 'Duration removed successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post('start-times')
  async addStartTime(@Body() body: { startTime: string }) {
    try {
      const classSettings = await this.classSettingsService.addStartTime(body.startTime);
      return {
        success: true,
        data: classSettings,
        message: 'Start time added successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete('start-times/:startTime')
  async removeStartTime(@Param('startTime') startTime: string) {
    try {
      const classSettings = await this.classSettingsService.removeStartTime(startTime);
      return {
        success: true,
        data: classSettings,
        message: 'Start time removed successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch('default-duration')
  async setDefaultDuration(@Body() body: { duration: number }) {
    try {
      const classSettings = await this.classSettingsService.setDefaultDuration(body.duration);
      return {
        success: true,
        data: classSettings,
        message: 'Default duration set successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Post('validate-time-slot')
  async validateTimeSlot(@Body() body: { startTime: string; duration: number }) {
    try {
      const isValid = await this.classSettingsService.validateTimeSlot(body.startTime, body.duration);
      return {
        success: true,
        data: { isValid },
        message: isValid ? 'Time slot is valid' : 'Time slot is invalid'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.classSettingsService.remove(id);
      return {
        success: true,
        message: 'Class settings deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}

