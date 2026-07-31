import {
  Body,
  Controller,
  Get,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { SchoolLandingPageService } from '../services/school-landing-page.service';
import { UpsertSchoolLandingPageDto } from '../dto/school-landing-page.dto';

@Controller('school-landing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class SchoolLandingPageController {
  constructor(private readonly landingService: SchoolLandingPageService) {}

  @Get()
  async getMine(@Request() req: { user: User }) {
    const data = await this.landingService.getForAdmin(req.user);
    return { success: true, data };
  }

  @Put()
  async upsert(
    @Request() req: { user: User },
    @Body() dto: UpsertSchoolLandingPageDto,
  ) {
    const data = await this.landingService.upsertForAdmin(req.user, dto);
    return { success: true, data };
  }
}
