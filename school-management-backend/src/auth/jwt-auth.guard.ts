import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { recordAuditCheck } from '../activity-log/request-audit.context';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      recordAuditCheck({
        name: 'JwtAuthGuard',
        checking: '@Public route (JWT optional)',
        result: 'pass',
      });
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status): any {
    if (err || !user) {
      recordAuditCheck({
        name: 'JwtAuthGuard',
        checking: 'JWT signature and expiry',
        result: 'fail: Invalid or expired token',
      });
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    recordAuditCheck({
      name: 'JwtAuthGuard',
      checking: 'JWT signature and expiry',
      result: `pass user=${user.id ?? user.sub ?? 'unknown'}`,
    });
    return user;
  }
}

