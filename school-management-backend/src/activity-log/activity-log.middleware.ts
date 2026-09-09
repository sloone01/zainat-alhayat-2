import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ActivityLogService } from './activity-log.service';
import type { RecordedError } from '../common/filters/all-exceptions.filter';
import { User } from '../entities/user.entity';

const LOGGED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Records every mutating request. This is middleware rather than an interceptor so
 * that guard-rejected requests (401/403) are captured too — Nest runs guards before
 * interceptors, so a blocked attempt would never reach one.
 */
@Injectable()
export class ActivityLogMiddleware implements NestMiddleware {
  constructor(private readonly logs: ActivityLogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!LOGGED_METHODS.has(req.method)) return next();

    const startedAt = Date.now();
    res.on('finish', () => {
      // req.user is populated by the auth guard before the response finishes.
      const user = (req as Request & { user?: User }).user;
      const failure = (req as Request & { activityLogError?: RecordedError }).activityLogError;
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
      });
    });

    next();
  }
}
