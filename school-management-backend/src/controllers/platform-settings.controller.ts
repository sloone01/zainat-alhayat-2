import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { ThawaniService } from '../services/thawani.service';

class SetThawaniDto {
  @IsBoolean()
  enabled: boolean;
}

/** Super-admin platform configuration (online payments on/off). */
@Controller('platform/settings')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class PlatformSettingsController {
  constructor(private readonly thawani: ThawaniService) {}

  private async thawaniState() {
    const enabled = await this.thawani.isEnabled();
    const configured = this.thawani.isConfigured();
    return { enabled, configured, available: enabled && configured };
  }

  @Get('thawani')
  @RequireAnyClaim({ page: 'platform_schools', action: 'view' })
  async getThawani() {
    return { success: true, data: await this.thawaniState() };
  }

  @Put('thawani')
  @RequireAnyClaim({ page: 'platform_schools', action: 'manage' })
  async setThawani(@Request() req: { user: User }, @Body() body: SetThawaniDto) {
    await this.thawani.setEnabled(body.enabled, req.user.id);
    return { success: true, data: await this.thawaniState() };
  }
}
