import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Listen on all interfaces
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  console.log(`📋 API endpoints available at: http://0.0.0.0:${port}/api`);
  console.log(`🔍 Health check at: http://0.0.0.0:${port}/api/health`);
  console.log(`🔧 Debug endpoints at: http://0.0.0.0:${port}/api/debug`);
}
bootstrap();
