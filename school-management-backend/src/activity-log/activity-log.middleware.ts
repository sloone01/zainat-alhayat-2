import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ActivityLogService } from './activity-log.service';
import type { RecordedError } from '../common/filters/all-exceptions.filter';
import { User } from '../entities/user.entity';
import { runWithRequestAudit, snapshotRequestAudit } from './request-audit.context';

/**
 * Records each HTTP request (including GET fetches). Middleware so guard
 * rejections (401/403) are captured — Nest runs guards before interceptors.
 */
@Injectable()
export class ActivityLogMiddleware implements NestMiddleware {
  constructor(private readonly logs: ActivityLogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    runWithRequestAudit((store) => {
      const startedAt = Date.now();
      res.on('finish', () => {
        if (this.shouldSkip(req)) return;
        const user = (req as Request & { user?: User }).user;
        const failure = (req as Request & { activityLogError?: RecordedError }).activityLogError;
        const audit = snapshotRequestAudit(store);
        void this.logs.record({
          error_code: failure?.code ?? null,
          error_message: failure?.message || null,
          user_id: user?.id ?? null,
          username: user?.username ?? null,
          user_role: user?.role ?? null,
          school_id: (user as unknown as { school_id?: string })?.school_id ?? null,
          method: req.method,
          path: String(req.originalUrl || req.url || '').slice(0, 500),
          status_code: res.statusCode,
          duration_ms: Date.now() - startedAt,
          ip: String(req.ip || req.socket?.remoteAddress || '').slice(0, 64) || null,
          user_agent: String(req.headers?.['user-agent'] || '').slice(0, 500) || null,
          checks: audit.checks.length ? audit.checks : null,
          queries: audit.queries.length ? audit.queries : null,
        });
      });
      next();
    });
  }

  private shouldSkip(req: Request): boolean {
    const method = String(req.method || '').toUpperCase();
    if (method === 'OPTIONS') return true;
    const url = String(req.originalUrl || req.url || '');
    return (
      url.startsWith('/api/health') ||
      url === '/api' ||
      url.startsWith('/api/files/') ||
      url.startsWith('/api/platform/logs')
    );
  }
}
