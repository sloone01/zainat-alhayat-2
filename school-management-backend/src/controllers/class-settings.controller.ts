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
import { ClassSettingsService } from '../services/class-settings.service';
import type { CreateClassSettingsDto, UpdateClassSettingsDto } from '../services/class-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('class-settings')
@UseGuards(JwtAuthGuard)
export class ClassSettingsController {
  constructor(private readonly classSettingsService: ClassSettingsService) {}

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
      const classSettings = await this.classSettingsService.findAll();
      return {
        success: true,
        data: classSettings,
        count: classSettings.length
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
      const activeSettings = await this.classSettingsService.findActive();
      return {
        success: true,
        data: activeSettings
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      const classSettings = await this.classSettingsService.findOne(id);
      return {
        success: true,
        data: classSettings
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
  async update(@Param('id') id: string, @Body() updateClassSettingsDto: UpdateClassSettingsDto) {
    try {
      const classSettings = await this.classSettingsService.update(id, updateClassSettingsDto);
      return {
        success: true,
        data: classSettings,
        message: 'Class settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Post('durations')
  async addDuration(@Body() body: { duration: number }) {
    try {
      const classSettings = await this.classSettingsService.addDuration(body.duration);
      return {
        success: true,
        data: classSettings,
        message: 'Duration added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      return {
        success: false,
        message: error.message,
        error: error.name
      };
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
      await this.classSettingsService.remove(id);
      return {
        success: true,
        message: 'Class settings deleted successfully'
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

