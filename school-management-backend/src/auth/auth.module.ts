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
import { RbacModule } from '../rbac/rbac.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'zinat_al_haya_jwt_secret_key_2024_very_secure_random_string',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' as any,
      },
    }),
    TypeOrmModule.forFeature([User, School]),
    forwardRef(() => RbacModule),
    NotificationsModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, UserTypeGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule, UserTypeGuard],
})
export class AuthModule {}
