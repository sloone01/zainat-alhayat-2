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
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ActivityService } from '../services/activity.service';
import { ActivityQueryDto, CreateActivityDto, UpdateActivityDto } from '../dto/activity.dto';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('activities')
@RequireClaim('activities', 'view')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /** School the caller may act in; derived from the token, never from the query. */
  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

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
  async findAll(@Query() query: ActivityQueryDto, @Req() req: { user: User }) {
    try {
      const activities = await this.activityService.findAll(query, this.schoolOf(req));
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
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      const activity = await this.activityService.findOne(id, this.schoolOf(req));
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
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto, @Req() req: { user: User }) {
    try {
      const activity = await this.activityService.update(id, updateActivityDto, this.schoolOf(req));
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
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    try {
      await this.activityService.remove(id, this.schoolOf(req));
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
