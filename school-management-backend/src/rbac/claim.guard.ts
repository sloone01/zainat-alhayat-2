import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import {
  CLAIM_ANY_KEY,
  CLAIM_KEY,
  type RequiredClaim,
} from './require-claim.decorator';
import { RbacPermissionService } from './rbac-permission.service';
import { User } from '../entities/user.entity';

/** Pages a legacy teacher JWT could use before claims were enforced. */
const LEGACY_TEACHER_PAGES = new Set([
  'attendance',
  'attendance_sessions',
  'groups',
  'courses',
  'schedules',
  'activities',
  'progress',
  'students',
  'weekly_session_plans',
  'teacher_weekly_sessions',
  'teacher_schedule',
  'teacher_graded_tasks',
  'teacher_graded_marks',
]);

@Injectable()
export class ClaimGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: RbacPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const handlerAny = this.reflector.get<RequiredClaim[]>(CLAIM_ANY_KEY, context.getHandler());
    const handlerClaim = this.reflector.get<RequiredClaim>(CLAIM_KEY, context.getHandler());
    const classAny = this.reflector.get<RequiredClaim[]>(CLAIM_ANY_KEY, context.getClass());
    const classClaim = this.reflector.get<RequiredClaim>(CLAIM_KEY, context.getClass());

    const anyRequired = handlerAny?.length ? handlerAny : handlerClaim ? undefined : classAny;
    const required = handlerClaim ?? (handlerAny?.length ? undefined : classClaim);

    if (!required && !anyRequired?.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    if (user.isSuperAdmin || user.isSystemUser) return true;

    // Transition: school admins retain access to user-group management until fully claim-driven
    const pages = [
      ...(required ? [required.page] : []),
      ...(anyRequired || []).map((c) => c.page),
    ];
    if (
      user.role === 'admin' &&
      pages.some((p) => p === 'user_groups' || p === 'platform_user_groups')
    ) {
      return true;
    }

    if (anyRequired?.length) {
      for (const claim of anyRequired) {
        if (await this.permissionService.hasClaim(user.id, claim.page, claim.action)) {
          return true;
        }
      }
      if (await this.legacyRoleFallback(user, anyRequired.map((c) => c.page))) {
        return true;
      }
      throw new ForbiddenException(
        `Missing one of: ${anyRequired.map((c) => `${c.page}:${c.action}`).join(', ')}`,
      );
    }

    const ok = await this.permissionService.hasClaim(user.id, required!.page, required!.action);
    if (!ok) {
      if (await this.legacyRoleFallback(user, [required!.page])) {
        return true;
      }
      throw new ForbiddenException(`Missing claim ${required!.page}:${required!.action}`);
    }
    return true;
  }

  /**
   * Until a staff user is assigned to a user group, honor the legacy users.role
   * for school pages. Once they have any claims, Role Management is authoritative.
   */
  private async legacyRoleFallback(user: User, pages: string[]): Promise<boolean> {
    if (pages.some((p) => p.startsWith('platform_'))) return false;
    const claims = await this.permissionService.getEffectiveClaims(user.id);
    if (claims.length > 0) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'teacher') {
      return pages.some((p) => LEGACY_TEACHER_PAGES.has(p));
    }
    return false;
  }
}
