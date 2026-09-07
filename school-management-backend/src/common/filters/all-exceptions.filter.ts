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
import { ErrorAlertService } from '../errors/error-alert.service';

type RequestUser = {
  id?: number | string;
  sub?: number | string;
  school_id?: number | string | null;
  schoolId?: number | string | null;
};

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly errorAlert: ErrorAlertService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & { user?: RequestUser; requestId?: string }
    >();

    const status = this.resolveStatus(exception);
    const { message, errorName, details } = this.resolveBody(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    const requestId =
      request.requestId ||
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined);

    const user = request.user;
    const userId = user?.id ?? user?.sub ?? null;
    const schoolId = user?.school_id ?? user?.schoolId ?? null;

    const logLine = `${request.method} ${request.url} → ${status} [${errorName}] ${message}${requestId ? ` (req=${requestId})` : ''}`;

    if (status >= 500) {
      this.logger.error(logLine, stack);
      this.errorAlert.notify({
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

    if (response.headersSent) return;

    response.status(status).json({
      success: false,
      message,
      error: errorName,
      statusCode: status,
      ...(requestId ? { requestId } : {}),
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
        } else {
          message = exception.message || 'Request failed';
        }
        return {
          message,
          errorName: String(obj.error || exception.name),
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
