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
  Query,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { CreateAttachmentLinkDto, UploadAttachmentDto } from '../dto/attachment.dto';
import { coerceRequestedSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
/** Images, PDF, Office documents, plain text/CSV. Extend deliberately, not by default. */
const ALLOWED_MIME =
  /^(image\/(png|jpe?g|gif|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/vnd\.ms-excel|text\/(plain|csv))$/i;

/**
 * Generic attachments: upload once, link to any entity (student, staff, course, …),
 * list per entity, download, delete. Any signed-in user may use it; downloads go
 * through this controller so auth always applies (files are never served statically).
 */
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly service: AttachmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      // Buffer in memory; AttachmentStorage decides where the bytes land (local disk or GCS).
      storage: memoryStorage(),
      limits: { fileSize: MAX_ATTACHMENT_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.test(file.mimetype)) {
          return cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
        }
        cb(null, true);
      },
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async upload(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    if (!file) throw new BadRequestException('No file provided (multipart field "file")');
    if ((dto.entity_type && !dto.entity_id) || (!dto.entity_type && dto.entity_id)) {
      throw new BadRequestException('entity_type and entity_id must be sent together');
    }
    const row = await this.service.register({
      file,
      uploadedBy: req.user.id,
      schoolId: coerceRequestedSchoolId(req.user.school_id),
      link:
        dto.entity_type && dto.entity_id
          ? { entityType: dto.entity_type, entityId: dto.entity_id, purpose: dto.purpose ?? null }
          : null,
    });
    return { success: true, data: row, message: 'Attachment uploaded' };
  }

  /** All attachments of one entity, e.g. GET /attachments/entity/student/<uuid>?purpose=photo. */
  @Get('entity/:entityType/:entityId')
  async listForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('purpose') purpose?: string,
  ) {
    const rows = await this.service.listForEntity(entityType, entityId, purpose || undefined);
    return { success: true, data: rows, count: rows.length };
  }

  @Post(':id/links')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async addLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAttachmentLinkDto,
  ) {
    const link = await this.service.addLink(id, dto.entity_type, dto.entity_id, dto.purpose ?? null);
    return { success: true, data: link, message: 'Attachment linked' };
  }

  @Delete('links/:linkId')
  async removeLink(@Param('linkId', ParseUUIDPipe) linkId: string) {
    await this.service.removeLink(linkId);
    return { success: true, message: 'Attachment unlinked' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const row = await this.service.findOne(id);
    return { success: true, data: row };
  }

  @Get(':id/download')
  async download(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { row, stream } = await this.service.openStream(id);
    res.setHeader('Content-Type', row.mime_type);
    res.setHeader('Content-Length', String(row.size_bytes));
    // RFC 5987 filename* so Arabic/unicode names survive.
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,
    );
    stream.pipe(res);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return { success: true, message: 'Attachment deleted' };
  }
}
