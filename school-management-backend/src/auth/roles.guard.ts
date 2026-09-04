import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

function deriveUserType(user: {
  user_type?: string;
  role?: string;
  isSuperAdmin?: boolean;
  isSystemUser?: boolean;
}): string {
  if (user.user_type) return user.user_type;
  if (user.isSuperAdmin || user.isSystemUser) return 'platform';
  if (user.role === 'parent') return 'parent';
  if (user.role === 'student') return 'student';
  if (user.role === 'admin' || user.role === 'teacher') return 'staff';
  return user.role || 'student';
}

/**
 * Legacy role guard. Matches:
 * - exact `users.role` (admin/teacher/student/parent)
 * - `users.user_type` (staff/parent/student/platform)
 * - staff users still match @Roles('admin'|'teacher') via their legacy role field
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const legacyRole = user.role as string | undefined;
    const userType = deriveUserType(user);

    return requiredRoles.some((required) => {
      if (required === legacyRole) return true;
      if (required === userType) return true;
      if (userType === 'staff' && (required === 'admin' || required === 'teacher')) {
        return legacyRole === required;
      }
      if (required === 'staff' && userType === 'staff') return true;
      return false;
    });
  }
}
