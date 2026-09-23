// Load .env before anything else: requireJwtSecret() reads process.env at module-load
// time (AuthModule/JwtStrategy), which runs before Nest's ConfigModule is instantiated.
import './load-env';
import './crypto-polyfill';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { resolveCorsOrigins } from './common/security/runtime-secrets';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Behind Railway's edge proxy req.ip is the proxy hop (100.64.x.x), so the throttler
  // was rate-limiting all clients on a hop as one and could not isolate a scanner
  // (Sep 22: 12 "IPs" for 457k requests). Trust the first hop's X-Forwarded-For.
  app.set('trust proxy', 1);

  // Enrollment save (and public signup) currently send the student photo inline as a base64
  // data URL in the JSON body, which blows past body-parser's 100 KB default and fails with
  // PayloadTooLargeError (FIKR-260920-547566). Stop-gap: raise the limit until attachments
  // move to separate multipart uploads.
  app.useBodyParser('json', { limit: '15mb' });
  app.useBodyParser('urlencoded', { limit: '15mb', extended: true });

  app.use(
    helmet({
      // SPA + API often split hosts; tighten CSP at the nginx/frontend layer.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS preflights are answered by the cors middleware before Nest routing, so the
  // LoggingInterceptor never sees them: a dropped/rejected OPTIONS used to leave no trace
  // at all and surfaced in the SPA as a bare axios "Network Error" (FIKR-260920-99FABE).
  const preflightLogger = new Logger('CORS');
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS' && req.headers['access-control-request-method']) {
      preflightLogger.log(
        `preflight OPTIONS ${req.originalUrl || req.url} origin=${req.headers.origin ?? '-'} method=${req.headers['access-control-request-method']}`,
      );
    }
    next();
  });

  const corsOrigin = resolveCorsOrigins();
  if (isProd && (corsOrigin === true || (Array.isArray(corsOrigin) && corsOrigin.length === 0))) {
    throw new Error(
      'CORS_ORIGIN must be set to an explicit allowlist in production (comma-separated origins).',
    );
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'thawani-signature',
      'thawani-timestamp',
      'x-request-id',
    ],
    exposedHeaders: ['X-Request-Id'],
    // Cache the preflight for a day so cross-origin callers (native app, direct API
    // consumers) stop re-sending OPTIONS before every request/upload.
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Do NOT mount uploads as public static assets — serve only via authenticated FileUploadController.
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(`API endpoints available at: http://0.0.0.0:${port}/api`);
  logger.log(`Health check at: http://0.0.0.0:${port}/api/health`);
  if (process.env.ENABLE_DEBUG_ENDPOINTS === 'true') {
    logger.warn(`Debug endpoints enabled at: http://0.0.0.0:${port}/api/debug`);
  }
}
bootstrap();
