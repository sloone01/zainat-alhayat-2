import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // DEVELOPMENT MODE: Disable authentication temporarily
    console.log('🚧 DEVELOPMENT MODE: JWT Auth Guard disabled');
    return true;

    // PRODUCTION CODE (commented out for development):
    /*
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
    */
  }

  handleRequest(err, user, info, context, status): any {
    // DEVELOPMENT MODE: Return mock user
    console.log('🚧 DEVELOPMENT MODE: Returning mock user');
    return {
      id: 'bd306529-6a0f-4e42-9dce-3928af367e94',
      email: 'admin@zinatalhaykindergarten.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      school_id: 1,
      isActive: true
    };

    // PRODUCTION CODE (commented out for development):
    /*
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
    */
  }
}

