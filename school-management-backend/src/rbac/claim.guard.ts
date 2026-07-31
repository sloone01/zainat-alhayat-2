import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLAIM_KEY, type RequiredClaim } from './require-claim.decorator';
import { RbacPermissionService } from './rbac-permission.service';
import { User } from '../entities/user.entity';

@Injectable()
export class ClaimGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: RbacPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredClaim | undefined>(CLAIM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    if (user.isSuperAdmin || user.isSystemUser) return true;

    // Transition: school admins retain access to user-group management until fully claim-driven
    if (
      user.role === 'admin' &&
      (required.page === 'user_groups' || required.page === 'platform_user_groups')
    ) {
      return true;
    }

    const ok = await this.permissionService.hasClaim(user.id, required.page, required.action);
    if (!ok) {
      throw new ForbiddenException(
        `Missing claim ${required.page}:${required.action}`,
      );
    }
    return true;
  }
}
