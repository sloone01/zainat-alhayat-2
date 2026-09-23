import {
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { User } from '../entities/user.entity';

export interface ActivityLogQuery {
  page?: number;
  limit?: number;
  method?: string;
  search?: string;
  user_id?: string;
  from?: string;
  to?: string;
}

/** Days of audit trail kept. Override with ACTIVITY_LOG_RETENTION_DAYS. */
const DEFAULT_RETENTION_DAYS = 30;
const RETENTION_SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class ActivityLogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ActivityLogService.name);
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: Repository<ActivityLog>,
  ) {}

  onModuleInit() {
    // Unbounded growth filled the 500 MB Postgres volume (Sep 2026). Sweep on boot,
    // then every 6h; no @nestjs/schedule dependency needed for a single timer.
    void this.purgeExpired();
    this.sweepTimer = setInterval(() => void this.purgeExpired(), RETENTION_SWEEP_INTERVAL_MS);
    this.sweepTimer.unref();
  }

  onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
  }

  /** Deletes rows older than the retention window. Never throws. */
  async purgeExpired(): Promise<number> {
    const days = Number(process.env.ACTIVITY_LOG_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    try {
      const result = await this.repo.delete({ created_at: LessThan(cutoff) });
      const removed = result.affected ?? 0;
      if (removed > 0) this.logger.log(`Purged ${removed} activity log rows older than ${days}d`);
      return removed;
    } catch (err) {
      this.logger.warn(`Activity log retention sweep failed: ${(err as Error).message}`);
      return 0;
    }
  }

  /** Never throws: a failed audit write must not fail the request it describes. */
  async record(entry: Partial<ActivityLog>) {
    try {
      await this.repo.insert(this.repo.create(entry));
    } catch (err) {
      this.logger.warn(`Failed to write activity log: ${(err as Error).message}`);
    }
  }

  private assertPlatformAccess(actor: User) {
    if (actor?.isSuperAdmin || actor?.isSystemUser) return;
    throw new ForbiddenException('Platform access required');
  }

  async list(actor: User, query: ActivityLogQuery) {
    this.assertPlatformAccess(actor);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 50));

    const qb = this.repo.createQueryBuilder('log');
    if (query.method) qb.andWhere('log.method = :method', { method: query.method.toUpperCase() });
    if (query.user_id) qb.andWhere('log.user_id = :userId', { userId: query.user_id });
    if (query.from) qb.andWhere('log.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('log.created_at <= :to', { to: query.to });
    if (query.search) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('LOWER(log.path) LIKE :term', { term })
            .orWhere('LOWER(log.username) LIKE :term', { term })
            .orWhere('LOWER(log.user_role) LIKE :term', { term })
            .orWhere("LOWER(COALESCE(log.checks::text, '')) LIKE :term", { term })
            .orWhere("LOWER(COALESCE(log.queries::text, '')) LIKE :term", { term });
        }),
      );
    }

    const [rows, total] = await qb
      .orderBy('log.created_at', 'DESC')
      .addOrderBy('log.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs: rows,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async methods(actor: User) {
    this.assertPlatformAccess(actor);
    const rows = await this.repo
      .createQueryBuilder('log')
      .select('DISTINCT log.method', 'method')
      .orderBy('method', 'ASC')
      .getRawMany<{ method: string }>();
    return rows.map((r) => r.method);
  }
}
