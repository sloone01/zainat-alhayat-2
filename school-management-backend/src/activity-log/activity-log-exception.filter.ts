import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

export interface RecordedError {
  code: string;
  message: string;
}

/**
 * Stashes the failure on the request so the activity-log middleware can record it when
 * the response finishes. Formatting is left to Nest's default filter — this only observes.
 */
@Catch()
export class ActivityLogExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'http') {
      const req = host.switchToHttp().getRequest<{ activityLogError?: RecordedError }>();
      const err = exception as { name?: string; message?: string };
      if (req) {
        req.activityLogError = {
          code: String(err?.name || 'Error').slice(0, 100),
          message: String(err?.message || '').slice(0, 1000),
        };
      }
    }
    super.catch(exception, host);
  }
}
