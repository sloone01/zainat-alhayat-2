// Import crypto polyfill first
import './crypto-polyfill';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProd
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: true,
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

  // Global validation pipe
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

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/files/',
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Listen on all interfaces
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
