import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { SupportRequestService } from '../services/support-request.service';
import {
  CreateSupportRequestDto,
  SupportRequestQueryDto,
  UpdateSupportRequestStatusDto,
} from '../dto/support-request.dto';
import { User } from '../entities/user.entity';
import { coerceRequestedSchoolId, isPlatformActor } from '../common/security/school-access';

/**
 * Support page: any signed-in user can submit a request (title + rich-text
 * description with images) and list their own requests. Platform admins see all.
 * No @RequireClaim on purpose: every authenticated user may use it.
 */
@Controller('support-requests')
export class SupportRequestController {
  constructor(private readonly supportService: SupportRequestService) {}

  private assertPlatform(user: User): void {
    if (!isPlatformActor(user)) throw new ForbiddenException('Platform admin only');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Request() req: { user: User }, @Body() dto: CreateSupportRequestDto) {
    const row = await this.supportService.create({
      userId: req.user.id,
      schoolId: coerceRequestedSchoolId(req.user.school_id),
      title: dto.title,
      descriptionHtml: dto.description_html,
    });
    return { success: true, data: row, message: 'Support request submitted' };
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/support';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
          cb(null, `support_${Date.now()}_${randomUUID()}${ext.startsWith('.') ? ext : `.${ext}`}`);
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
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      success: true,
      data: { filename: file.filename, url: `/api/files/support/${file.filename}` },
    };
  }

  @Get('mine')
  async mine(@Request() req: { user: User }) {
    const rows = await this.supportService.findForUser(req.user.id);
    return { success: true, data: rows, count: rows.length };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Request() req: { user: User }, @Query() query: SupportRequestQueryDto) {
    this.assertPlatform(req.user);
    const rows = await this.supportService.findAll(query.status);
    return { success: true, data: rows, count: rows.length };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    const row = await this.supportService.findOne(id);
    if (row.user_id !== req.user.id) this.assertPlatform(req.user);
    return { success: true, data: row };
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateStatus(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupportRequestStatusDto,
  ) {
    this.assertPlatform(req.user);
    const row = await this.supportService.updateStatus(id, dto.status);
    return { success: true, data: row, message: 'Status updated' };
  }
}
