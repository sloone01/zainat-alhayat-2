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
import { recordAuditCheck } from '../activity-log/request-audit.context';

/** Pages a legacy teacher JWT could use before claims were enforced. */
const LEGACY_TEACHER_PAGES = new Set([
  'attendance',
  'attendance_sessions',
  'groups',
  'courses',
  'course_enrollments',
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
    if (isPublic) {
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: '@Public route',
        result: 'pass',
      });
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const actor = req.user as User | undefined;
    if (actor?.must_change_password) {
      const method = String(req.method || '').toUpperCase();
      const url = String(req.originalUrl || req.url || '');
      const allowed = method === 'POST' && /\/auth\/change-password(?:\?|$)/.test(url);
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: `must_change_password; ${method} ${url}`,
        result: allowed ? 'pass (change-password)' : 'fail',
      });
      if (!allowed) {
        throw new ForbiddenException('Password change required');
      }
    }

    const handlerAny = this.reflector.get<RequiredClaim[]>(CLAIM_ANY_KEY, context.getHandler());
    const handlerClaim = this.reflector.get<RequiredClaim>(CLAIM_KEY, context.getHandler());
    const classAny = this.reflector.get<RequiredClaim[]>(CLAIM_ANY_KEY, context.getClass());
    const classClaim = this.reflector.get<RequiredClaim>(CLAIM_KEY, context.getClass());

    const anyRequired = handlerAny?.length ? handlerAny : handlerClaim ? undefined : classAny;
    const required = handlerClaim ?? (handlerAny?.length ? undefined : classClaim);

    if (!required && !anyRequired?.length) {
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: 'no @RequireClaim on this route',
        result: 'pass',
      });
      return true;
    }

    const user = req.user as User | undefined;
    if (!user?.id) {
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: 'authenticated user',
        result: 'fail: Not authenticated',
      });
      throw new ForbiddenException('Not authenticated');
    }

    if (user.isSuperAdmin || user.isSystemUser) {
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: 'isSuperAdmin or isSystemUser',
        result: 'pass',
      });
      return true;
    }

    // Transition: school admins retain access to user-group management until fully claim-driven
    const pages = [
      ...(required ? [required.page] : []),
      ...(anyRequired || []).map((c) => c.page),
    ];
    if (
      user.role === 'admin' &&
      pages.some((p) => p === 'user_groups' || p === 'platform_user_groups')
    ) {
      recordAuditCheck({
        name: 'ClaimGuard',
        checking: `admin role + user_groups page (${pages.join(', ')})`,
        result: 'pass',
      });
      return true;
    }

    if (anyRequired?.length) {
      const wanted = anyRequired.map((c) => `${c.page}:${c.action}`).join(', ');
      for (const claim of anyRequired) {
        const hit = await this.permissionService.hasClaim(user.id, claim.page, claim.action);
        recordAuditCheck({
          name: 'ClaimGuard.hasClaim',
          checking: `${claim.page}:${claim.action}`,
          result: hit,
        });
        if (hit) return true;
      }
      const legacy = await this.legacyRoleFallback(user, anyRequired.map((c) => c.page));
      recordAuditCheck({
        name: 'ClaimGuard.legacyRoleFallback',
        checking: `role=${user.role}; any of ${wanted}`,
        result: legacy,
      });
      if (legacy) return true;
      throw new ForbiddenException(`Missing one of: ${wanted}`);
    }

    const ok = await this.permissionService.hasClaim(user.id, required!.page, required!.action);
    recordAuditCheck({
      name: 'ClaimGuard.hasClaim',
      checking: `${required!.page}:${required!.action}`,
      result: ok,
    });
    if (!ok) {
      const legacy = await this.legacyRoleFallback(user, [required!.page]);
      recordAuditCheck({
        name: 'ClaimGuard.legacyRoleFallback',
        checking: `role=${user.role}; ${required!.page}:${required!.action}`,
        result: legacy,
      });
      if (legacy) return true;
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
