import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class SimpleHealthController {
  @Get()
  @Public()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('simple')
  @Public()
  simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
