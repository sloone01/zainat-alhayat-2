import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity';
import { Group } from './entities/group.entity';
import { User } from './entities/user.entity';
import { SchoolSubscriptionService } from './services/school-subscription.service';
import { SchoolSubscriptionController } from './controllers/school-subscription.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([School, Group, User]), AuthModule],
  controllers: [SchoolSubscriptionController],
  providers: [SchoolSubscriptionService],
})
export class PublicSubscriptionModule {}
