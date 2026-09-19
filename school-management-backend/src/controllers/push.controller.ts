import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { RegisterPushTokenDto, UnregisterPushTokenDto } from '../dto/push-token.dto';
import { PushService } from '../notifications/push.service';

/**
 * Authenticated self-routes — any logged-in user registers their own device token.
 * No staff claim required (device belongs to req.user.id).
 */
@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post('register')
  async register(
    @Request() req: { user: User },
    @Body() body: RegisterPushTokenDto,
  ) {
    const row = await this.push.registerToken({
      userId: req.user.id,
      token: body.token,
      platform: body.platform,
      deviceId: body.device_id,
    });
    return {
      success: true,
      data: {
        id: row.id,
        platform: row.platform,
        fcm_configured: this.push.isConfigured(),
      },
    };
  }

  @Post('unregister')
  @HttpCode(HttpStatus.OK)
  async unregister(
    @Request() req: { user: User },
    @Body() body: UnregisterPushTokenDto,
  ) {
    const removed = await this.push.unregisterToken({
      userId: req.user.id,
      token: body.token,
      deviceId: body.device_id,
    });
    return { success: true, data: { removed } };
  }
}
