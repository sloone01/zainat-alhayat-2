import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { User } from './entities/user.entity';
import { SchoolSubscriptionService } from './services/school-subscription.service';
import { SignupEmailOtpService } from './services/signup-email-otp.service';
import { SchoolSubscriptionController } from './controllers/school-subscription.controller';
import { PlatformBillingModule } from './platform-billing/platform-billing.module';
import { PlatformCustomPlanRequest } from './platform-billing/entities/platform-custom-plan-request.entity';
import { PlatformModule } from './platform-billing/entities/platform-module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User, PlatformCustomPlanRequest, PlatformModule]),
    PlatformBillingModule,
  ],
  controllers: [SchoolSubscriptionController],
  providers: [SchoolSubscriptionService, SignupEmailOtpService],
  exports: [SchoolSubscriptionService],
})
export class PublicSubscriptionModule {}
