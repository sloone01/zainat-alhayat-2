import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { EnrollmentFeePreviewService } from '../services/enrollment-fee-preview.service';

@Public()
@Controller('public/enrollment-fees')
export class PublicEnrollmentFeesController {
  constructor(private readonly fees: EnrollmentFeePreviewService) {}

  @Get('plans')
  async plans(@Query('school_id') schoolId?: string) {
    if (!schoolId?.trim()) throw new BadRequestException('school_id is required');
    const data = await this.fees.listPlans(schoolId.trim());
    return { success: true, data, count: data.length };
  }

  @Get('preview')
  async preview(
    @Query('school_id') schoolId?: string,
    @Query('grade_level') gradeLevel?: string,
    @Query('installment_plan_id') installmentPlanId?: string,
  ) {
    if (!schoolId?.trim()) throw new BadRequestException('school_id is required');
    if (!gradeLevel?.trim()) throw new BadRequestException('grade_level is required');
    const data = await this.fees.preview(
      schoolId.trim(),
      gradeLevel.trim(),
      installmentPlanId?.trim() || null,
    );
    return { success: true, data };
  }
}
