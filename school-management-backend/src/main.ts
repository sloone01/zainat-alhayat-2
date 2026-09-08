// Load .env before anything else: requireJwtSecret() reads process.env at module-load
// time (AuthModule/JwtStrategy), which runs before Nest's ConfigModule is instantiated.
import 'dotenv/config';

// Import crypto polyfill first
import './crypto-polyfill';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { resolveCorsOrigins } from './common/security/runtime-secrets';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(
    helmet({
      // SPA + API often split hosts; tighten CSP at the nginx/frontend layer.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

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
