import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { PlatformSchoolService } from '../services/platform-school.service';
import { User } from '../entities/user.entity';
import { UpdatePlatformSchoolDto } from '../dto/update-platform-school.dto';
import { RejectPlatformSchoolDto } from '../dto/reject-platform-school.dto';
import { CreatePlatformSchoolDto } from '../dto/create-platform-school.dto';

const docMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

function subscriptionDocFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (docMime.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException('Only PDF or image files are allowed for documents'), false);
}

@Controller('platform/schools')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class PlatformSchoolController {
  constructor(private readonly platformSchoolService: PlatformSchoolService) {}

  @Get()
  @RequireClaim('platform_schools', 'view')
  async list(@Req() req: { user: User }) {
    const data = await this.platformSchoolService.listRegisteredSchools(req.user);
    return { success: true, data, count: data.length };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireClaim('platform_schools', 'manage')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cr_copy', maxCount: 1 },
        { name: 'id_copy', maxCount: 1 },
        { name: 'receipt', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (_req, file, cb) => {
            const dir =
              file.fieldname === 'receipt'
                ? './uploads/platform-invoice-receipts'
                : './uploads/subscription-docs';
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            cb(null, dir);
          },
          filename: (_req, file, cb) => {
            const ts = Date.now();
            const rand = Math.random().toString(36).slice(2, 12);
            const ext = (file.originalname.split('.').pop() || 'bin').slice(0, 8);
            const prefix = file.fieldname === 'receipt' ? 'inv' : 'plat';
            cb(null, `${prefix}_${ts}_${rand}.${ext}`);
          },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: subscriptionDocFilter,
      },
    ),
  )
  async create(
    @Req() req: { user: User },
    @Body() dto: CreatePlatformSchoolDto,
    @UploadedFiles()
    files?: {
      cr_copy?: Express.Multer.File[];
      id_copy?: Express.Multer.File[];
      receipt?: Express.Multer.File[];
    },
  ) {
    const cr = files?.cr_copy?.[0];
    const idf = files?.id_copy?.[0];
    const receipt = files?.receipt?.[0];
    const data = await this.platformSchoolService.createSchool(req.user, dto, {
      crRelativeUrl: cr?.filename ? `/api/files/subscription-docs/${cr.filename}` : null,
      idRelativeUrl: idf?.filename ? `/api/files/subscription-docs/${idf.filename}` : null,
      paidReceiptUrl: receipt?.filename
        ? `/api/files/platform-invoice-receipts/${receipt.filename}`
        : null,
    });
    return {
      success: true,
      data,
      message:
        data.status === 'active'
          ? 'School registered and activated. Owner was emailed credentials and the payment receipt.'
          : 'School saved as draft (pending).',
    };
  }

  @Get(':id')
  @RequireClaim('platform_schools', 'view')
  async getOne(@Req() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.platformSchoolService.getRegisteredSchool(req.user, id);
    return { success: true, data };
  }

  /** Correct the details a school submitted at registration. */
  @Put(':id')
  @RequireClaim('platform_schools', 'manage')
  @UsePipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  async update(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlatformSchoolDto,
  ) {
    const data = await this.platformSchoolService.updateSchool(req.user, id, dto);
    return { success: true, data, message: 'School updated' };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('platform_schools', 'manage')
  async approve(@Req() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.platformSchoolService.approveSchool(req.user, id);
    return {
      success: true,
      data,
      message: 'School approved. Owner can now sign in as school administrator.',
    };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('platform_schools', 'manage')
  @UsePipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  async reject(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectPlatformSchoolDto,
  ) {
    const data = await this.platformSchoolService.rejectSchool(req.user, id, dto);
    return {
      success: true,
      data,
      message: 'School registration rejected.',
    };
  }
}
