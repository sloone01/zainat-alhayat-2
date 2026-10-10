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
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { SessionMediaService } from '../services/session-media.service';
import { WeeklySessionPlanService } from '../services/weekly-session-plan.service';
import { AttachmentService } from '../services/attachment.service';
import { SessionMedia } from '../entities/session-media.entity';
import { User } from '../entities/user.entity';
import { assertSameSchool, coerceRequestedSchoolId } from '../common/security/school-access';

const sessionMediaUpload = {
  storage: memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    const mime = String(file.mimetype || '').toLowerCase()
    const name = String(file.originalname || '').toLowerCase()
    const allowed =
      mime.startsWith('image/') ||
      mime.startsWith('video/') ||
      mime === 'application/pdf' ||
      mime === 'application/msword' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.(pdf|docx?)$/.test(name)
    if (!allowed) {
      return cb(new BadRequestException('Only image, video, PDF, and Word files are allowed'), false)
    }
    cb(null, true)
  },
}

function mediaKind(file: Express.Multer.File): 'photo' | 'video' | 'file' {
  const mime = String(file.mimetype || '')
  if (mime.startsWith('image/')) return 'photo'
  if (mime.startsWith('video/')) return 'video'
  return 'file'
}

@Controller('session-media')
@UseGuards(JwtAuthGuard)
export class SessionMediaController {
  constructor(
    private readonly sessionMediaService: SessionMediaService,
    private readonly weeklySessionPlanService: WeeklySessionPlanService,
    private readonly attachments: AttachmentService,
  ) {}

  /** Bytes go through AttachmentService; the plan row keeps the download path. */
  private async storeFile(user: User, sessionPlanId: string, file: Express.Multer.File, notify = true): Promise<SessionMedia> {
    const attachment = await this.attachments.register({
      file,
      uploadedBy: user.id,
      schoolId: coerceRequestedSchoolId(user.school_id),
      link: { entityType: 'weekly_session_plan', entityId: sessionPlanId, purpose: 'session_media' },
    });
    return this.sessionMediaService.create({
      session_plan_id: sessionPlanId,
      file_name: attachment.file_name,
      file_path: attachment.url,
      file_type: mediaKind(file),
      file_size: Number(attachment.size_bytes) || file.size,
      mime_type: attachment.mime_type,
      uploaded_by: user.id,
      notify,
    });
  }

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
    { page: 'teacher_weekly_sessions', action: 'view' },
  )
  @UseInterceptors(FileInterceptor('file', sessionMediaUpload))
  async uploadFile(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
    @Body('session_plan_id') sessionPlanId: string,
    @Body('notify') notify?: string,
  ): Promise<{ success: boolean; data: SessionMedia | null; message: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!sessionPlanId) {
      throw new BadRequestException('session_plan_id is required');
    }
    await this.assertSessionPlanSchool(req.user, sessionPlanId);
    const media = await this.storeFile(req.user, sessionPlanId, file, notify !== 'false');
    return {
      success: true,
      data: media,
      message: 'File uploaded successfully',
    };
  }

  @Post('upload-multiple')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'view' },
  )
  @UseInterceptors(FilesInterceptor('files', 10, sessionMediaUpload))
  async uploadMultipleFiles(
    @Request() req: { user: User },
    @UploadedFiles() files: Express.Multer.File[],
    @Body('session_plan_id') sessionPlanId: string,
    @Body('notify') notify?: string,
  ): Promise<{ success: boolean; data: SessionMedia[]; message: string }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    if (!sessionPlanId) {
      throw new BadRequestException('session_plan_id is required');
    }
    await this.assertSessionPlanSchool(req.user, sessionPlanId);
    const media: SessionMedia[] = [];
    for (const file of files) {
      media.push(await this.storeFile(req.user, sessionPlanId, file, notify !== 'false'));
    }
    return {
      success: true,
      data: media,
      message: `${files.length} files uploaded successfully`,
    };
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
    { page: 'teacher_weekly_sessions', action: 'view' },
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
