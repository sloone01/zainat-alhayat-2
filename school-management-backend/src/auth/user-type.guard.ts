import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPES_KEY } from './user-type.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(USER_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userType =
      user.user_type ||
      (user.isSuperAdmin || user.isSystemUser
        ? 'platform'
        : user.role === 'parent'
          ? 'parent'
          : user.role === 'student'
            ? 'student'
            : 'staff');

    return required.includes(userType);
  }
}
