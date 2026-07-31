import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { User } from './entities/user.entity';
import { SchoolSubscriptionService } from './services/school-subscription.service';
import { SchoolSubscriptionController } from './controllers/school-subscription.controller';
import { PlatformBillingModule } from './platform-billing/platform-billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User]),
    PlatformBillingModule,
  ],
  controllers: [SchoolSubscriptionController],
  providers: [SchoolSubscriptionService],
})
export class PublicSubscriptionModule {}
