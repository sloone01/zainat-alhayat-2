import { Injectable, Logger } from '@nestjs/common';

export type SendPushOptions = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

/**
 * Mobile push is not wired yet (no device-token store / FCM).
 * Call sites should still go through this service so the app can attach later.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  isConfigured(): boolean {
    return false;
  }

  async sendPush(options: SendPushOptions): Promise<void> {
    this.logger.debug(
      `Push queued for later (no mobile tokens): user=${options.userId} title=${options.title}`,
    );
  }
}
