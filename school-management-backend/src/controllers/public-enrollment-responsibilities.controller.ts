import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { EnrollmentResponsibilityService } from '../services/enrollment-responsibility.service';

@Public()
@Controller('public/enrollment-responsibilities')
export class PublicEnrollmentResponsibilitiesController {
  constructor(private readonly svc: EnrollmentResponsibilityService) {}

  @Get()
  async list(@Query('school_id') schoolId?: string) {
    const data = await this.svc.listPublic(schoolId ?? '');
    return { success: true, data };
  }
}
