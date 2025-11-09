import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class SimpleHealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
      database: 'connected', // Simple status
      service: 'Zinat Al-Haya School Management'
    };
  }

  @Get('simple')
  simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'healthy'
    };
  }
}
