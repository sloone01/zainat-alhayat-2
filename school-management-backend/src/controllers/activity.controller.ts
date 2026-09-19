import {
  BadRequestException,
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
  Request,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ActivityService } from '../services/activity.service';
import { ActivityQueryDto, CreateActivityDto, UpdateActivityDto } from '../dto/activity.dto';
import { RequireAnyClaim, RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('activities')
@RequireClaim('activities', 'view')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @RequireClaim('activities', 'create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Request() req: { user: User }, @Body() createActivityDto: CreateActivityDto) {
    createActivityDto.school_id = this.schoolOf(req, createActivityDto.school_id ?? null);
    const activity = await this.activityService.create(createActivityDto);
    return {
      success: true,
      data: activity,
      message: 'Activity created successfully',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Request() req: { user: User }, @Query() query: ActivityQueryDto) {
    const schoolId = this.schoolOf(req, query.school_id);
    const activities = await this.activityService.findAll({ ...query, school_id: schoolId });
    return {
      success: true,
      data: activities,
      count: activities.length,
    };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const activity = await this.activityService.findOne(id);
    assertSameSchool(req.user, activity.school_id);
    return {
      success: true,
      data: activity,
    };
  }

  @Patch(':id')
  @RequireClaim('activities', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    const existing = await this.activityService.findOne(id);
    assertSameSchool(req.user, existing.school_id);
    const activity = await this.activityService.update(id, updateActivityDto);
    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully',
    };
  }

  @Post(':id/image')
  @RequireAnyClaim(
    { page: 'activities', action: 'create' },
    { page: 'activities', action: 'edit' },
  )
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/activities';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
          cb(null, `activity_${Date.now()}_${randomUUID()}${ext.startsWith('.') ? ext : `.${ext}`}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Only PNG, JPEG, GIF, or WebP images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @Request() req: { user: User },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const existing = await this.activityService.findOne(id);
    assertSameSchool(req.user, existing.school_id);
    const activity = await this.activityService.setImage(id, file.filename);
    return {
      success: true,
      data: activity,
      message: 'Activity image saved',
    };
  }

  @Delete(':id')
  @RequireClaim('activities', 'delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    const existing = await this.activityService.findOne(id);
    assertSameSchool(req.user, existing.school_id);
    await this.activityService.remove(id);
    return {
      success: true,
      message: 'Activity deleted successfully',
    };
  }
}
