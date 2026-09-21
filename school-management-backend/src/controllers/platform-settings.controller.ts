import { Body, Controller, ForbiddenException, Get, Put, Request, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ThawaniService } from '../services/thawani.service';

class SetThawaniDto {
  @IsBoolean()
  enabled: boolean;
}

/** Super-admin platform configuration (online payments on/off). Super admin only. */
@Controller('platform/settings')
@UseGuards(JwtAuthGuard)
export class PlatformSettingsController {
  constructor(private readonly thawani: ThawaniService) {}

  private assertSuperAdmin(user: User) {
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Only the super admin can change platform settings');
    }
  }

  private async thawaniState() {
    const enabled = await this.thawani.isEnabled();
    const configured = this.thawani.isConfigured();
    return { enabled, configured, available: enabled && configured };
  }

  @Get('thawani')
  async getThawani(@Request() req: { user: User }) {
    this.assertSuperAdmin(req.user);
    return { success: true, data: await this.thawaniState() };
  }

  @Put('thawani')
  async setThawani(@Request() req: { user: User }, @Body() body: SetThawaniDto) {
    this.assertSuperAdmin(req.user);
    await this.thawani.setEnabled(body.enabled, req.user.id);
    return { success: true, data: await this.thawaniState() };
  }
}
