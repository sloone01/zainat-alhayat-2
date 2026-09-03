import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacAction } from '../entities/rbac-action.entity';
import { RbacPage } from '../entities/rbac-page.entity';
import { RbacPageAction } from '../entities/rbac-page-action.entity';
import { RbacGroup } from '../entities/rbac-group.entity';
import { RbacGroupPermission } from '../entities/rbac-group-permission.entity';
import { RbacUserGroupMember } from '../entities/rbac-user-group-member.entity';
import { RbacUserPermissionOverride } from '../entities/rbac-user-permission-override.entity';
import { RbacRole } from '../entities/rbac-role.entity';
import { RbacRolePermission } from '../entities/rbac-role-permission.entity';
import { RbacUserGroupRole } from '../entities/rbac-user-group-role.entity';
import { User } from '../entities/user.entity';
import { SchoolModule } from '../platform-billing/entities/school-module.entity';
import { RbacPermissionService } from './rbac-permission.service';
import { RbacGroupService } from './rbac-group.service';
import { RbacController } from './rbac.controller';
import { ClaimGuard } from './claim.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([
      RbacAction,
      RbacPage,
      RbacPageAction,
      RbacGroup,
      RbacGroupPermission,
      RbacUserGroupMember,
      RbacUserPermissionOverride,
      RbacRole,
      RbacRolePermission,
      RbacUserGroupRole,
      SchoolModule,
      User,
    ]),
  ],
  controllers: [RbacController],
  providers: [RbacPermissionService, RbacGroupService, ClaimGuard],
  exports: [RbacPermissionService, RbacGroupService, ClaimGuard, TypeOrmModule],
})
export class RbacModule {}
