import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SendSmsOptions = {
  to: string;
  body: string;
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    const provider = this.provider();
    if (provider === 'log') return true;
    if (provider === 'http') return !!this.config.get<string>('SMS_HTTP_URL')?.trim();
    return false;
  }

  private provider(): string {
    return (this.config.get<string>('SMS_PROVIDER') || 'log').trim().toLowerCase();
  }

  async sendSms(options: SendSmsOptions): Promise<void> {
    const to = options.to?.trim();
    const body = options.body?.trim();
    if (!to) throw new Error('Recipient phone is required');
    if (!body) throw new Error('SMS body is required');

    const provider = this.provider();
    if (provider === 'http') {
      const url = this.config.get<string>('SMS_HTTP_URL')?.trim();
      if (!url) {
        this.logger.warn(`SMS skipped (SMS_HTTP_URL missing) to ${to}`);
        return;
      }
      const token = this.config.get<string>('SMS_HTTP_TOKEN')?.trim();
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ to, body }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`SMS HTTP ${res.status} ${text.slice(0, 200)}`);
      }
      this.logger.log(`SMS sent to ${to} via HTTP`);
      return;
    }

    this.logger.log(`[SMS:${provider}] to=${to} body=${body.slice(0, 160)}`);
  }
}
