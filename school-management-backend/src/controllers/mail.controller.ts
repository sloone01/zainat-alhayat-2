import { BadRequestException, Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { MailService } from '../services/mail.service';

@Controller('mail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get('status')
  status() {
    return { success: true, data: this.mail.getStatus() };
  }

  @Post('test')
  async sendTest(@Request() req: { user: User }, @Body() body: { to?: string }) {
    const to = (body?.to ?? req.user.email)?.trim();
    if (!to) {
      throw new BadRequestException('Provide body.to or ensure your admin user has an email address');
    }
    await this.mail.sendTest(to);
    return {
      success: true,
      data: {
        message: `Test email sent to ${to}. Check inbox and spam folder.`,
      },
    };
  }
}
