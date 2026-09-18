import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { BIZ_LOG_KEY } from '../logging/biz-log.decorator';
import { bizLogAction } from '../logging/biz-log.catalog';
import { ActorLogLabelService } from '../logging/actor-log-label.service';
import {
  criteriaFromRequest,
  formatBizLine,
  resultCountFromPayload,
} from '../logging/format-biz-log';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly biz = new Logger('Controller');

  constructor(
    private readonly reflector: Reflector,
    private readonly actorLabel: ActorLogLabelService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<
      Request & { requestId?: string; user?: { id?: string; school_id?: string | null } }
    >();
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
    void this.logControllerStart(context, request, requestId);

    return next.handle().pipe(
      tap({
        next: (payload) => {
          const ms = Date.now() - started;
          const count = resultCountFromPayload(payload);
          this.logger.log(
            `← ${method} ${url} ${response.statusCode} ${ms}ms req=${requestId}${count ? ` ${count}` : ''}`,
          );
        },
        error: () => {
          const ms = Date.now() - started;
          this.logger.warn(`← ${method} ${url} ERROR ${ms}ms req=${requestId}`);
        },
      }),
    );
  }

  private async logControllerStart(
    context: ExecutionContext,
    request: Request & { user?: { id?: string; school_id?: string | null } },
    requestId: string,
  ) {
    try {
      const override = this.reflector.getAllAndOverride<string>(BIZ_LOG_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const controller = context.getClass()?.name || 'Controller';
      const method = context.getHandler()?.name || 'handle';
      const action = bizLogAction(controller, method, override);
      const { userId, schoolName } = await this.actorLabel.format(request.user);
      const criteria = criteriaFromRequest({
        params: request.params as Record<string, unknown>,
        query: request.query as Record<string, unknown>,
      });
      this.biz.log(
        formatBizLine(action, userId, schoolName, `${criteria} req=${requestId}`.trim()),
      );
    } catch {
      /* never fail the request because of logging */
    }
  }

  private shouldSkip(url: string): boolean {
    return (
      url.startsWith('/api/health') ||
      url === '/api' ||
      url.startsWith('/api/files/')
    );
  }
}
