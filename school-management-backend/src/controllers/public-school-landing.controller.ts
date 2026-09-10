import { Controller, Get, Param } from '@nestjs/common';
import { SchoolLandingPageService } from '../services/school-landing-page.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('public/landing')
export class PublicSchoolLandingController {
  constructor(private readonly landingService: SchoolLandingPageService) {}

  @Get()
  async getDefault() {
    const data = await this.landingService.getPublicDefault();
    return { success: true, data };
  }

  /** Resolve school UUID from landing slug (enrollment CTA). Must stay above `:slug`. */
  @Get('school/:slug')
  async schoolBySlug(@Param('slug') slug: string) {
    const data = await this.landingService.getSchoolMetaBySlug(slug);
    return { success: true, data };
  }

  /** Public school name/logo for enrollment form branding. Must stay above `:slug`. */
  @Get('school-id/:id')
  async schoolById(@Param('id') id: string) {
    const data = await this.landingService.getSchoolMetaById(id);
    return { success: true, data };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.landingService.getPublicBySlug(slug);
    return { success: true, data };
  }
}
