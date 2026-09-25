import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { EnrollmentService } from '../services/enrollment.service';
import { AttachmentService } from '../services/attachment.service';
import { SavePublicEnrollmentDraftDto } from '../dto/enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const PURPOSES = new Set([
  'enrollment_parent_id',
  'enrollment_birth_certificate',
  'enrollment_child_id',
  'enrollment_photo',
]);

/**
 * Outer `/student-enrollment` drafts + document uploads.
 * Binaries go through AttachmentService → AttachmentStorage (GCS when STORAGE_DRIVER=gcs).
 */
@Public()
@Controller('public/enrollments')
export class PublicEnrollmentsController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly attachments: AttachmentService,
    @InjectRepository(School) private readonly schoolRepository: Repository<School>,
  ) {}

  @Post('draft')
  async saveDraft(@Body() dto: SavePublicEnrollmentDraftDto) {
    const data = await this.enrollmentService.savePublicDraft(dto);
    return {
      success: true,
      data: {
        ...data,
        source: 'public_enrollment' as const,
      },
    };
  }

  /**
   * Multipart upload for the public wizard. Returns an attachment download path
   * to store on the enrollment (never base64 in JSON).
   */
  @Post('attachments')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
    }),
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('school_id') schoolId?: string,
    @Body('purpose') purpose?: string,
  ) {
    const sid = String(schoolId || '').trim();
    const why = String(purpose || '').trim();
    if (!sid) throw new BadRequestException('school_id is required');
    if (!PURPOSES.has(why)) {
      throw new BadRequestException(`purpose must be one of: ${[...PURPOSES].join(', ')}`);
    }
    if (!file?.buffer?.length) throw new BadRequestException('file is required');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG, PNG, or WebP files are allowed');
    }

    const school = await this.schoolRepository.findOne({ where: { id: sid } });
    if (!school || school.status === 'rejected' || school.status === 'suspended') {
      throw new BadRequestException('Invalid school');
    }

    const row = await this.attachments.register({
      file,
      uploadedBy: null,
      schoolId: sid,
      link: null,
    });

    return {
      success: true,
      data: {
        id: row.id,
        url: row.url,
        file_name: row.file_name,
        size_bytes: row.size_bytes,
        purpose: why,
        source: 'public_enrollment' as const,
      },
    };
  }

  @Get('lookup')
  async lookupByCivilId(
    @Query('civil_id') civilId?: string,
    @Query('school_id') schoolId?: string,
  ) {
    if (!civilId?.trim()) throw new BadRequestException('civil_id is required');
    if (!schoolId?.trim()) throw new BadRequestException('school_id is required');

    const submitted = await this.enrollmentService.findSubmittedApplicationByCivilId(
      civilId,
      schoolId,
    );
    if (submitted) {
      return {
        success: true,
        data: {
          exists: true,
          same_school: true,
          status: submitted.status,
          already_registered: true,
          allow_new: false,
          source: 'public_enrollment' as const,
          enrollment_draft: null,
        },
      };
    }

    const draft = await this.enrollmentService.findPublicDraftByCivilId(civilId, schoolId);
    if (!draft) {
      return {
        success: true,
        data: {
          exists: false,
          same_school: false,
          status: null,
          already_registered: false,
          allow_new: true,
          source: 'public_enrollment' as const,
          enrollment_draft: null,
        },
      };
    }

    return {
      success: true,
      data: {
        exists: true,
        same_school: true,
        status: 'draft' as const,
        already_registered: false,
        allow_new: false,
        source: 'public_enrollment' as const,
        enrollment_draft: {
          id: draft.id,
          payload: draft.draft_payload,
          updatedAt: draft.updatedAt,
        },
      },
    };
  }
}
