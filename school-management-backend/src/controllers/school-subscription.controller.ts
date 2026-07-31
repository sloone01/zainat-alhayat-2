import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { SchoolSubscriptionRegisterDto } from '../dto/school-subscription.dto';
import { SchoolSubscriptionService } from '../services/school-subscription.service';

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

@Controller('public/school-subscription')
export class SchoolSubscriptionController {
  constructor(private readonly subscriptionService: SchoolSubscriptionService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
      ],
      {
        storage: diskStorage({
          destination: (_req, _file, cb) => {
            cb(null, './uploads/subscription-docs');
          },
          filename: (_req, file, cb) => {
            const ts = Date.now();
            const rand = Math.random().toString(36).slice(2, 12);
            const ext = (file.originalname.split('.').pop() || 'bin').slice(0, 8);
            cb(null, `sub_${ts}_${rand}.${ext}`);
          },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: subscriptionDocFilter,
      },
    ),
  )
  async register(
    @Body() dto: SchoolSubscriptionRegisterDto,
    @UploadedFiles()
    files: {
      cr_copy?: Express.Multer.File[];
      id_copy?: Express.Multer.File[];
    },
  ) {
    const cr = files?.cr_copy?.[0];
    const idf = files?.id_copy?.[0];
    if (!cr?.filename || !idf?.filename) {
      throw new BadRequestException(
        'Both files are required: cr_copy (commercial registration) and id_copy (ID card).',
      );
    }
    const crUrl = `/api/files/subscription-docs/${cr.filename}`;
    const idUrl = `/api/files/subscription-docs/${idf.filename}`;
    const data = await this.subscriptionService.registerWithDocuments(dto, crUrl, idUrl);
    return {
      success: true,
      data,
      message:
        'Registration submitted. Your school is pending platform approval. You can sign in after approval.',
    };
  }
}
