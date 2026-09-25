import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { EnrollmentService } from '../services/enrollment.service';
import { SavePublicEnrollmentDraftDto } from '../dto/enrollment.dto';

/**
 * Outer `/student-enrollment` drafts — separate from staff `/students/register` student drafts.
 * Source for admins: enrollments.status=draft (public form).
 */
@Public()
@Controller('public/enrollments')
export class PublicEnrollmentsController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

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
