import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOutboxJob } from '../entities/notification-outbox.entity';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import type { NotifyRequest } from './notification.types';

const MAX_ATTEMPTS = 5;
const POLL_MS = 4000;
const STALE_CLAIM_SQL = `status = 'sending' AND claimed_at < NOW() - INTERVAL '2 minutes'`;

/**
 * Stores a template send, then delivers it off the HTTP request.
 * One table and one in-process worker: local `node dist/main.js` and the server run the same code.
 * `FOR UPDATE SKIP LOCKED` keeps two server instances from sending the same row.
 */
@Injectable()
export class NotificationOutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationOutboxService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private pumping = false;

  constructor(
    @InjectRepository(NotificationOutboxJob)
    private readonly repo: Repository<NotificationOutboxJob>,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  onModuleInit(): void {
    void this.releaseStaleClaims().then(() => this.pump());
    this.timer = setInterval(() => void this.pump(), POLL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async enqueue(request: NotifyRequest): Promise<void> {
    const row = this.repo.create({
      school_id: request.schoolId,
      template_key: request.templateKey,
      locale: request.locale || 'ar',
      variables: request.variables,
      recipients: request.recipients,
      channels: request.channels ?? null,
      push_data: request.pushData ?? null,
      status: 'pending',
      attempts: 0,
      last_error: null,
      available_at: new Date(),
      claimed_at: null,
      sent_at: null,
    });
    await this.repo.save(row);
    void this.pump();
  }

  private async releaseStaleClaims(): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NotificationOutboxJob)
      .set({ status: 'pending' })
      .where(STALE_CLAIM_SQL)
      .execute();
  }

  private async pump(): Promise<void> {
    if (this.pumping) return;
    this.pumping = true;
    try {
      for (;;) {
        const job = await this.claimNext();
        if (!job) break;
        await this.deliver(job);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Notification queue pump failed: ${msg}`);
    } finally {
      this.pumping = false;
    }
  }

  private async claimNext(): Promise<NotificationOutboxJob | null> {
    return this.repo.manager.transaction(async (manager) => {
      const job = await manager
        .getRepository(NotificationOutboxJob)
        .createQueryBuilder('job')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('job.status = :status', { status: 'pending' })
        .andWhere('job.available_at <= NOW()')
        .orderBy('job.created_at', 'ASC')
        .limit(1)
        .getOne();
      if (!job) return null;
      job.status = 'sending';
      job.attempts += 1;
      job.claimed_at = new Date();
      return manager.save(job);
    });
  }

  private async deliver(job: NotificationOutboxJob): Promise<void> {
    try {
      const result = await this.notifications.notify({
        schoolId: job.school_id,
        templateKey: job.template_key,
        locale: job.locale === 'en' ? 'en' : 'ar',
        variables: job.variables || {},
        recipients: job.recipients || [],
        channels: job.channels ?? undefined,
        pushData: job.push_data ?? undefined,
      });
      const delivered = result.emailSent + result.smsSent + result.whatsappSent + result.pushQueued;
      if (!delivered && result.errors.length) {
        await this.retryOrFail(job, result.errors.join('; '));
        return;
      }
      await this.repo.update(job.id, {
        status: 'sent',
        sent_at: new Date(),
        last_error: result.errors.length ? result.errors.join('; ') : null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.retryOrFail(job, msg);
    }
  }

  private async retryOrFail(job: NotificationOutboxJob, message: string): Promise<void> {
    if (job.attempts >= MAX_ATTEMPTS) {
      this.logger.error(`Notification ${job.template_key} failed after ${job.attempts} tries: ${message}`);
      await this.repo.update(job.id, { status: 'failed', last_error: message });
      return;
    }
    const waitMs = job.attempts * 20_000;
    this.logger.warn(`Notification ${job.template_key} retry ${job.attempts}: ${message}`);
    await this.repo.update(job.id, {
      status: 'pending',
      last_error: message,
      available_at: new Date(Date.now() + waitMs),
    });
  }
}
