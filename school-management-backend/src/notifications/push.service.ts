import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { UserPushToken, type PushPlatform } from '../entities/user-push-token.entity';

export type SendPushOptions = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export type SendPushResult = {
  sent: number;
  failed: number;
};

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

/**
 * Mobile push via FCM (Capacitor `@capacitor/push-notifications` tokens).
 * Registers tokens even when FCM credentials are missing; send is a no-op until configured.
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private messaging: admin.messaging.Messaging | null = null;
  private projectId: string | null = null;

  constructor(
    @InjectRepository(UserPushToken)
    private readonly tokenRepo: Repository<UserPushToken>,
  ) {}

  onModuleInit(): void {
    this.messaging = this.initFirebase();
  }

  isConfigured(): boolean {
    return this.messaging != null;
  }

  async registerToken(input: {
    userId: string;
    token: string;
    platform: PushPlatform;
    deviceId?: string | null;
  }): Promise<UserPushToken> {
    const token = input.token.trim();
    const deviceId = input.deviceId?.trim() || null;

    const byToken = await this.tokenRepo.findOne({ where: { token } });
    if (byToken) {
      byToken.user_id = input.userId;
      byToken.platform = input.platform;
      if (deviceId) byToken.device_id = deviceId;
      return this.tokenRepo.save(byToken);
    }

    if (deviceId) {
      const byDevice = await this.tokenRepo.findOne({
        where: { user_id: input.userId, device_id: deviceId },
      });
      if (byDevice) {
        byDevice.token = token;
        byDevice.platform = input.platform;
        return this.tokenRepo.save(byDevice);
      }
    }

    return this.tokenRepo.save(
      this.tokenRepo.create({
        user_id: input.userId,
        token,
        platform: input.platform,
        device_id: deviceId,
      }),
    );
  }

  async unregisterToken(input: {
    userId: string;
    token?: string | null;
    deviceId?: string | null;
  }): Promise<number> {
    const token = input.token?.trim();
    const deviceId = input.deviceId?.trim();
    if (token) {
      const res = await this.tokenRepo.delete({ user_id: input.userId, token });
      return res.affected ?? 0;
    }
    if (deviceId) {
      const res = await this.tokenRepo.delete({ user_id: input.userId, device_id: deviceId });
      return res.affected ?? 0;
    }
    const res = await this.tokenRepo.delete({ user_id: input.userId });
    return res.affected ?? 0;
  }

  async sendPush(options: SendPushOptions): Promise<SendPushResult> {
    const rows = await this.tokenRepo.find({ where: { user_id: options.userId } });
    if (!rows.length) {
      this.logger.debug(`Push skipped (no tokens): user=${options.userId}`);
      return { sent: 0, failed: 0 };
    }

    if (!this.messaging) {
      this.logger.debug(
        `Push queued for later (FCM not configured): user=${options.userId} tokens=${rows.length} title=${options.title}`,
      );
      return { sent: 0, failed: 0 };
    }

    const data: Record<string, string> = {};
    if (options.data) {
      for (const [k, v] of Object.entries(options.data)) {
        if (v != null) data[String(k)] = String(v);
      }
    }

    let sent = 0;
    let failed = 0;
    const stale: string[] = [];

    for (const row of rows) {
      try {
        await this.messaging.send({
          token: row.token,
          notification: {
            title: options.title,
            body: options.body,
          },
          data,
          android: {
            priority: 'high',
            notification: { channelId: 'fikr_default' },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        });
        sent += 1;
      } catch (err) {
        failed += 1;
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as { code?: string }).code || '')
            : '';
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`FCM send failed user=${options.userId} code=${code}: ${msg}`);
        if (
          code.includes('registration-token-not-registered') ||
          code.includes('invalid-registration-token') ||
          /not.?registered|invalid.?token/i.test(msg)
        ) {
          stale.push(row.id);
        }
      }
    }

    if (stale.length) {
      await this.tokenRepo.delete(stale);
    }

    return { sent, failed };
  }

  /** Test helper — list tokens for a user (count only in production logs). */
  async countTokensForUser(userId: string): Promise<number> {
    return this.tokenRepo.count({ where: { user_id: userId } });
  }

  private initFirebase(): admin.messaging.Messaging | null {
    try {
      if (admin.apps.length) {
        this.projectId = admin.app().options.projectId ?? null;
        return admin.messaging();
      }

      const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
      const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
      let credential: admin.ServiceAccount | null = null;

      if (jsonRaw) {
        const parsed = JSON.parse(jsonRaw) as ServiceAccountJson;
        credential = {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key?.replace(/\\n/g, '\n'),
        };
        this.projectId = parsed.project_id ?? null;
      } else if (path) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const parsed = require(path) as ServiceAccountJson;
        credential = {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key?.replace(/\\n/g, '\n'),
        };
        this.projectId = parsed.project_id ?? null;
      } else {
        const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()?.replace(/\\n/g, '\n');
        if (projectId && clientEmail && privateKey) {
          credential = { projectId, clientEmail, privateKey };
          this.projectId = projectId;
        }
      }

      if (!credential?.projectId || !credential.clientEmail || !credential.privateKey) {
        this.logger.log('Push: FCM credentials not set — token register works; send is a no-op');
        return null;
      }

      admin.initializeApp({
        credential: admin.credential.cert(credential),
        projectId: credential.projectId,
      });
      this.logger.log(`Push: FCM ready (project=${this.projectId})`);
      return admin.messaging();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Push: failed to init Firebase — ${msg}`);
      return null;
    }
  }
}
