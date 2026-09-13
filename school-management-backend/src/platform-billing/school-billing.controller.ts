import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import { PlatformBillingService } from './platform-billing.service';
import { SchoolBillingThawaniConfirmDto, SchoolBillingThawaniSessionDto } from './dto/platform-billing.dto';

@Controller('school-billing')
@UseGuards(JwtAuthGuard, ClaimGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true }),
)
export class SchoolBillingController {
  constructor(private readonly billing: PlatformBillingService) {}

  private schoolIdOf(user: User): string {
    const schoolId = resolveActorSchoolId(user);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get('me')
  @RequireClaim('school_billing', 'view')
  async me(@Req() req: { user: User }) {
    const data = await this.billing.getSchoolSelfBilling(req.user, this.schoolIdOf(req.user));
    return { success: true, data };
  }

  @Post('thawani/session')
  @RequireClaim('school_billing', 'create')
  async createThawaniSession(
    @Req() req: { user: User },
    @Body() dto: SchoolBillingThawaniSessionDto,
  ) {
    const data = await this.billing.createSchoolThawaniSession(
      req.user,
      this.schoolIdOf(req.user),
      { successUrl: dto.success_url, cancelUrl: dto.cancel_url },
    );
    return { success: true, data };
  }

  @Post('thawani/confirm')
  @RequireClaim('school_billing', 'create')
  async confirmThawani(
    @Req() req: { user: User },
    @Body() dto: SchoolBillingThawaniConfirmDto,
  ) {
    const data = await this.billing.confirmSchoolThawani(
      req.user,
      this.schoolIdOf(req.user),
      dto.invoice_id,
    );
    return { success: true, data };
  }
}
