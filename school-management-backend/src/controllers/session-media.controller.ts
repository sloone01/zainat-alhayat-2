import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { SessionMediaService, CreateSessionMediaDto } from '../services/session-media.service';
import { WeeklySessionPlanService } from '../services/weekly-session-plan.service';
import { SessionMedia } from '../entities/session-media.entity';
import { User } from '../entities/user.entity';
import { assertSameSchool } from '../common/security/school-access';

@Controller('session-media')
@UseGuards(JwtAuthGuard)
export class SessionMediaController {
  constructor(
    private readonly sessionMediaService: SessionMediaService,
    private readonly weeklySessionPlanService: WeeklySessionPlanService,
  ) {}

  private async assertSessionPlanSchool(user: User, sessionPlanId: string) {
    const plan = await this.weeklySessionPlanService.getWeeklySessionPlanById(sessionPlanId);
    assertSameSchool(user, plan.schedule?.group?.school_id);
    return plan;
  }

  private async assertMediaSchool(user: User, mediaId: string) {
    const media = await this.sessionMediaService.findById(mediaId);
    await this.assertSessionPlanSchool(user, media.session_plan_id);
    return media;
  }

  @Post('upload')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/session-media';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `session_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for videos
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/', 'video/'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (!isAllowed) {
          return cb(new BadRequestException('Only image and video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
    @Body('session_plan_id') sessionPlanId: string,
  ): Promise<{ success: boolean; data: SessionMedia | null; message: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!sessionPlanId) {
        throw new BadRequestException('session_plan_id is required');
      }

      await this.assertSessionPlanSchool(req.user, sessionPlanId);

      const createDto: CreateSessionMediaDto = {
        session_plan_id: sessionPlanId,
        file_name: file.originalname,
        file_path: `/api/files/session-media/${file.filename}`,
        file_type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id,
      };

      const media = await this.sessionMediaService.create(createDto);

      return {
        success: true,
        data: media,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      // Rethrow: a failed upload reported HTTP 200.
      throw error;
    }
  }

  @Post('upload-multiple')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/session-media';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `session_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/', 'video/'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (!isAllowed) {
          return cb(new BadRequestException('Only image and video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMultipleFiles(
    @Request() req: { user: User },
    @UploadedFiles() files: Express.Multer.File[],
    @Body('session_plan_id') sessionPlanId: string,
  ): Promise<{ success: boolean; data: SessionMedia[]; message: string }> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      if (!sessionPlanId) {
        throw new BadRequestException('session_plan_id is required');
      }

      await this.assertSessionPlanSchool(req.user, sessionPlanId);

      const createDtos: CreateSessionMediaDto[] = files.map(file => ({
        session_plan_id: sessionPlanId,
        file_name: file.originalname,
        file_path: `/api/files/session-media/${file.filename}`,
        file_type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.id,
      }));

      const media = await this.sessionMediaService.createMultiple(createDtos);

      return {
        success: true,
        data: media,
        message: `${files.length} files uploaded successfully`,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'File upload failed');
    }
  }

  @Get('session/:sessionPlanId')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'view' },
    { page: 'teacher_weekly_sessions', action: 'view' },
  )
  async getMediaBySessionPlan(
    @Request() req: { user: User },
    @Param('sessionPlanId') sessionPlanId: string,
  ): Promise<SessionMedia[]> {
    await this.assertSessionPlanSchool(req.user, sessionPlanId);
    return await this.sessionMediaService.findBySessionPlanId(sessionPlanId);
  }

  @Get(':id')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'view' },
    { page: 'teacher_weekly_sessions', action: 'view' },
  )
  async getMediaById(
    @Request() req: { user: User },
    @Param('id') id: string,
  ): Promise<SessionMedia> {
    return await this.assertMediaSchool(req.user, id);
  }

  @Delete(':id')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async deleteMedia(
    @Request() req: { user: User },
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.assertMediaSchool(req.user, id);
      await this.sessionMediaService.delete(id);
      return {
        success: true,
        message: 'Media deleted successfully',
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}
