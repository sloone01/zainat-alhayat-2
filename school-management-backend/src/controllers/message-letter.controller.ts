import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { resolveActorSchoolId, RequestedSchoolIdPipe } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { MessageLetterService } from '../services/message-letter.service';
import {
  MESSAGE_LETTER_FILE_ALLOWED_EXTS,
  MESSAGE_LETTER_FILE_MAX_BYTES,
} from '../constants/message-letter-files';
import {
  CreateSchoolMessageLetterDto,
  DispatchSchoolMessageLetterDto,
  MessageLetterAudiencePreviewDto,
  RemindSchoolMessageLetterDto,
  UpdateSchoolMessageLetterDto,
} from '../dto/message-letter.dto';

@Controller('message-letters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MessageLetterController {
  constructor(private readonly messageLetters: MessageLetterService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get('variable-hints')
  variableHints() {
    return { success: true, data: this.messageLetters.variableHints() };
  }

  @Post('audience-preview')
  @HttpCode(HttpStatus.OK)
  async audiencePreview(
    @Request() req: { user: User },
    @Body() body: MessageLetterAudiencePreviewDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.audiencePreview(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Get('sample-variables')
  async sampleVariables(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.sampleVariables(req.user, schoolId);
    return { success: true, data };
  }

  @Get()
  async list(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.list(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get('approval-recipients')
  async approvalRecipients(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('letter_id') letterId?: string,
    @Query('recipient_user_id') recipientUserId?: string,
    @Query('student_id') studentId?: string,
    @Query('activity_id') activityId?: string,
    @Query('approval_status') approvalStatus?: 'not_sent' | 'pending' | 'approved' | 'rejected',
    @Query('locale') locale?: 'en' | 'ar',
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.listApprovalRecipients(req.user, schoolId, {
      letter_id: letterId,
      recipient_user_id: recipientUserId,
      student_id: studentId,
      activity_id: activityId,
      approval_status: approvalStatus,
      locale: locale === 'en' ? 'en' : 'ar',
    });
    return { success: true, data, count: data.length };
  }

  @Post(':id/remind')
  @HttpCode(HttpStatus.OK)
  async remind(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RemindSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.remindApproval(req.user, id, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Post(':id/dispatch')
  @RequireClaim('message_letters', 'edit')
  @HttpCode(HttpStatus.OK)
  async dispatch(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DispatchSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.dispatch(req.user, id, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Get(':id')
  async one(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.getOne(req.user, schoolId, id);
    return { success: true, data };
  }

  @Post()
  async create(
    @Request() req: { user: User },
    @Body() body: CreateSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.create(req.user, { ...body, school_id: schoolId });
    return { success: true, data, message: 'Letter saved' };
  }

  @Put(':id')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: UpdateSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.update(req.user, schoolId, id, body);
    return { success: true, data, message: 'Letter updated' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    await this.messageLetters.remove(req.user, schoolId, id);
    return { success: true, message: 'Letter deleted' };
  }

  @Post(':id/files')
  @RequireClaim('message_letters', 'edit')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/message-letter-files';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).slice(2, 12);
          const ext = extname(file.originalname || '').toLowerCase() || '.bin';
          cb(null, `mlf_${timestamp}_${random}${ext}`);
        },
      }),
      limits: { fileSize: MESSAGE_LETTER_FILE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        if (!(MESSAGE_LETTER_FILE_ALLOWED_EXTS as readonly string[]).includes(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed: ${MESSAGE_LETTER_FILE_ALLOWED_EXTS.join(', ')}`,
            ) as Error,
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async addFile(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.addFile(req.user, schoolId, id, file);
    return { success: true, data };
  }

  @Delete(':id/files/:fileId')
  @RequireClaim('message_letters', 'delete')
  @HttpCode(HttpStatus.OK)
  async removeFile(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    await this.messageLetters.removeFile(req.user, schoolId, id, fileId);
    return { success: true, message: 'File deleted' };
  }
}
