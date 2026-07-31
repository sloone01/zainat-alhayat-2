import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformPlan } from './entities/platform-plan.entity';
import { PlatformPlanPrice } from './entities/platform-plan-price.entity';
import { PlatformPlanFeature } from './entities/platform-plan-feature.entity';
import { PlatformAddon } from './entities/platform-addon.entity';
import { SchoolPlatformSubscription } from './entities/school-platform-subscription.entity';
import { SchoolPlatformSubscriptionAddon } from './entities/school-platform-subscription-addon.entity';
import { PlatformInvoice } from './entities/platform-invoice.entity';
import { School } from '../entities/school.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { PlatformBillingService } from './platform-billing.service';
import { PlatformBillingController } from './platform-billing.controller';
import { PublicPlatformPlansController } from './public-platform-plans.controller';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';

export const PLATFORM_BILLING_ENTITIES = [
  PlatformPlan,
  PlatformPlanPrice,
  PlatformPlanFeature,
  PlatformAddon,
  SchoolPlatformSubscription,
  SchoolPlatformSubscriptionAddon,
  PlatformInvoice,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...PLATFORM_BILLING_ENTITIES,
      School,
      Student,
      User,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => RbacModule),
  ],
  controllers: [PlatformBillingController, PublicPlatformPlansController],
  providers: [PlatformBillingService],
  exports: [PlatformBillingService, TypeOrmModule],
})
export class PlatformBillingModule {}
