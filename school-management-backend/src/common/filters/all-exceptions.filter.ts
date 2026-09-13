import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorTicketService } from '../errors/error-ticket.service';

/** Stashed for the activity-log middleware, which records it when the response ends. */
export interface RecordedError {
  code: string;
  message: string;
}

type RequestUser = {
  id?: number | string;
  sub?: number | string;
  school_id?: string | string | null;
  schoolId?: string | string | null;
};

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly errorTickets: ErrorTicketService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & {
        user?: RequestUser;
        requestId?: string;
        activityLogError?: RecordedError;
      }
    >();

    const status = this.resolveStatus(exception);
    const { message, errorName, details, code } = this.resolveBody(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    const requestId =
      request.requestId ||
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined);

    const user = request.user;
    const userId = user?.id ?? user?.sub ?? null;
    const schoolId = user?.school_id ?? user?.schoolId ?? null;

    // The activity log records the outcome of every request; without this it can see the
    // status code but not what actually went wrong.
    const logLine = `${request.method} ${request.url} → ${status} [${errorName}] ${message}${requestId ? ` (req=${requestId})` : ''}`;

    let ticket: string | undefined;
    if (status >= 500) {
      ticket = this.errorTickets.open({
        source: 'api',
        message,
        stack,
        statusCode: status,
        method: request.method,
        path: request.originalUrl || request.url,
        userId,
        schoolId,
        requestId,
        userAgent: request.headers['user-agent'],
        extra: details ? { details } : undefined,
      });
    } else if (status >= 400) {
      this.logger.warn(logLine);
    } else {
      this.logger.log(logLine);
    }

    request.activityLogError = {
      code: String(errorName || 'Error').slice(0, 100),
      message: String(ticket ? `${ticket}: ${message}` : message || '').slice(0, 1000),
    };

    if (response.headersSent) return;

    response.status(status).json({
      success: false,
      message,
      error: errorName,
      statusCode: status,
      ...(code ? { code } : {}),
      ...(requestId ? { requestId } : {}),
      ...(ticket ? { ticket } : {}),
      ...(process.env.NODE_ENV !== 'production' && details ? { details } : {}),
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveBody(exception: unknown): {
    message: string;
    errorName: string;
    code?: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { message: res, errorName: exception.name };
      }
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        const rawMessage = obj.message;
        let message: string;
        if (Array.isArray(rawMessage)) {
          message = rawMessage.map(String).join('; ');
        } else if (typeof rawMessage === 'string' && rawMessage.trim()) {
          message = rawMessage;
        } else if (
          rawMessage &&
          typeof rawMessage === 'object' &&
          typeof (rawMessage as { message?: unknown }).message === 'string'
        ) {
          message = String((rawMessage as { message: string }).message);
        } else {
          message = exception.message || 'Request failed';
        }
        const codeRaw = obj.code ?? (rawMessage as { code?: unknown } | undefined)?.['code'];
        const code =
          typeof codeRaw === 'string' && codeRaw.trim() ? codeRaw.trim() : undefined;
        return {
          message,
          errorName: String(obj.error || exception.name),
          code,
          details: Array.isArray(rawMessage) ? rawMessage : undefined,
        };
      }
      return { message: exception.message, errorName: exception.name };
    }

    if (exception instanceof Error) {
      const isProd = process.env.NODE_ENV === 'production';
      return {
        message: isProd ? 'Internal server error' : exception.message || 'Internal server error',
        errorName: 'INTERNAL_ERROR',
      };
    }

    return {
      message: 'Internal server error',
      errorName: 'INTERNAL_ERROR',
    };
  }
}
