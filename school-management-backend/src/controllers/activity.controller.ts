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
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ActivityService } from '../services/activity.service';
import { ActivityQueryDto, CreateActivityDto, UpdateActivityDto } from '../dto/activity.dto';
import { RequireClaim } from '../rbac/require-claim.decorator';

@Controller('activities')
@RequireClaim('activities', 'view')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @RequireClaim('activities', 'create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createActivityDto: CreateActivityDto) {
    try {
      const activity = await this.activityService.create(createActivityDto);
      return {
        success: true,
        data: activity,
        message: 'Activity created successfully',
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() query: ActivityQueryDto) {
    try {
      const activities = await this.activityService.findAll(query);
      return {
        success: true,
        data: activities,
        count: activities.length,
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const activity = await this.activityService.findOne(id);
      return {
        success: true,
        data: activity,
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  @RequireClaim('activities', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    try {
      const activity = await this.activityService.update(id, updateActivityDto);
      return {
        success: true,
        data: activity,
        message: 'Activity updated successfully',
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Delete(':id')
  @RequireClaim('activities', 'delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      await this.activityService.remove(id);
      return {
        success: true,
        message: 'Activity deleted successfully',
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}
