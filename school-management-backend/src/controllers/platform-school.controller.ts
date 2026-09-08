import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { PlatformSchoolService } from '../services/platform-school.service';
import { User } from '../entities/user.entity';
import { UpdatePlatformSchoolDto } from '../dto/update-platform-school.dto';

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

  @Get(':id')
  @RequireClaim('platform_schools', 'view')
  async getOne(@Req() req: { user: User }, @Param('id', ParseIntPipe) id: number) {
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
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlatformSchoolDto,
  ) {
    const data = await this.platformSchoolService.updateSchool(req.user, id, dto);
    return { success: true, data, message: 'School updated' };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('platform_schools', 'manage')
  async approve(@Req() req: { user: User }, @Param('id', ParseIntPipe) id: number) {
    const data = await this.platformSchoolService.approveSchool(req.user, id);
    return {
      success: true,
      data,
      message: 'School approved. Owner can now sign in as school administrator.',
    };
  }
}
