import { Controller, Get, Param } from '@nestjs/common';
import { SchoolLandingPageService } from '../services/school-landing-page.service';

@Controller('public/landing')
export class PublicSchoolLandingController {
  constructor(private readonly landingService: SchoolLandingPageService) {}

  @Get()
  async getDefault() {
    const data = await this.landingService.getPublicDefault();
    return { success: true, data };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.landingService.getPublicBySlug(slug);
    return { success: true, data };
  }
}
