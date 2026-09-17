import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { AuthService } from '../auth/auth.service';
import { DemoSessionDto } from '../dto/demo-session.dto';

@Public()
@Controller('public/demo')
export class PublicDemoController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async session(@Body() dto: DemoSessionDto) {
    return {
      success: true,
      data: await this.authService.issueDemoSession(dto.audience),
    };
  }
}
