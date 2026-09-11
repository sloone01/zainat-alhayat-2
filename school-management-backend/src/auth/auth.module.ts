import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserTypeGuard } from './user-type.guard';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Staff } from '../entities/staff.entity';
import { RbacModule } from '../rbac/rbac.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { requireJwtSecret } from '../common/security/runtime-secrets';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: requireJwtSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
      },
    }),
    TypeOrmModule.forFeature([User, School, Staff]),
    forwardRef(() => RbacModule),
    NotificationsModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, UserTypeGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule, UserTypeGuard],
})
export class AuthModule {}
