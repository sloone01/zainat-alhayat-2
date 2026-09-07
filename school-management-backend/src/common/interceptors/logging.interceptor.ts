import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request & { requestId?: string; user?: { id?: number } }>();
    const response = http.getResponse<Response>();

    const incomingId = request.headers['x-request-id'];
    const requestId =
      typeof incomingId === 'string' && incomingId.trim()
        ? incomingId.trim().slice(0, 64)
        : randomUUID();
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    const { method } = request;
    const url = request.originalUrl || request.url;
    if (this.shouldSkip(url)) {
      return next.handle();
    }

    const started = Date.now();
    const userPart = request.user?.id != null ? ` user=${request.user.id}` : '';

    this.logger.log(`→ ${method} ${url}${userPart} req=${requestId}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(`← ${method} ${url} ${response.statusCode} ${ms}ms req=${requestId}`);
        },
        error: () => {
          const ms = Date.now() - started;
          // Status may not be set yet; filter will log the failure details.
          this.logger.warn(`← ${method} ${url} ERROR ${ms}ms req=${requestId}`);
        },
      }),
    );
  }

  private shouldSkip(url: string): boolean {
    return (
      url.startsWith('/api/health') ||
      url === '/api' ||
      url.startsWith('/api/files/')
    );
  }
}
