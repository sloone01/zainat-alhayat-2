import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGroupService, type GroupPermissionInput } from './rbac-group.service';
import { RbacPermissionService } from './rbac-permission.service';
import { RequireClaim } from './require-claim.decorator';
import { ClaimGuard } from './claim.guard';
import { User } from '../entities/user.entity';

@Controller('rbac')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class RbacController {
  constructor(
    private readonly groupService: RbacGroupService,
    private readonly permissionService: RbacPermissionService,
  ) {}

  /** Catalog is readable by any authenticated user who can open group management (or super admin). */
  @Get('catalog')
  async catalog(@Req() req: { user: User }) {
    if (!req.user.isSuperAdmin && !req.user.isSystemUser && req.user.role !== 'admin') {
      const ok = await this.permissionService.hasClaim(req.user.id, 'user_groups', 'view');
      if (!ok) {
        return { success: false, message: 'Missing claim user_groups:view' };
      }
    }
    return { success: true, data: await this.groupService.listCatalog() };
  }

  @Get('me/claims')
  async myClaims(@Req() req: { user: User }) {
    const claims = await this.permissionService.getEffectiveClaims(req.user.id);
    const map = await this.permissionService.getClaimsMap(req.user.id);
    const entitled =
      req.user.school_id != null
        ? await this.permissionService.getEntitledPageKeys(req.user.school_id)
        : null;
    return {
      success: true,
      data: {
        claims,
        permissions: map,
        isSuperAdmin: !!req.user.isSuperAdmin,
        isSystemUser: !!req.user.isSystemUser,
        schoolId: req.user.school_id ?? null,
        userType: req.user.user_type ?? null,
        entitledPageKeys: entitled ? [...entitled] : null,
      },
    };
  }

  @Get('groups')
  @RequireClaim('user_groups', 'view')
  async listGroups(
    @Req() req: { user: User },
    @Query('schoolId') schoolId?: string,
  ) {
    const sid =
      schoolId === undefined || schoolId === ''
        ? undefined
        : schoolId === '0' || schoolId === 'null'
          ? null
          : Number(schoolId);
    const groups = await this.groupService.listGroups(req.user, sid);
    return { success: true, data: groups, count: groups.length };
  }

  @Get('groups/:id')
  @RequireClaim('user_groups', 'view')
  async getGroup(@Param('id') id: string) {
    return { success: true, data: await this.groupService.getGroup(id) };
  }

  @Post('groups')
  @RequireClaim('user_groups', 'create')
  async createGroup(
    @Req() req: { user: User },
    @Body()
    body: {
      name: string;
      description?: string;
      schoolId?: number | null;
      color?: string;
      code?: string;
      groupType?: 'system' | 'staff' | 'parent' | 'student';
    },
  ) {
    const group = await this.groupService.createGroup(req.user, body);
    return { success: true, data: group };
  }

  @Patch('groups/:id')
  @RequireClaim('user_groups', 'edit')
  async updateGroup(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; color?: string; isActive?: boolean; code?: string },
  ) {
    return { success: true, data: await this.groupService.updateGroup(req.user, id, body) };
  }

  @Delete('groups/:id')
  @RequireClaim('user_groups', 'delete')
  async deleteGroup(@Req() req: { user: User }, @Param('id') id: string) {
    await this.groupService.deleteGroup(req.user, id);
    return { success: true };
  }

  @Post('groups/:id/clone')
  @RequireClaim('user_groups', 'create')
  async cloneGroup(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() body: { name?: string; schoolId?: number | null },
  ) {
    return {
      success: true,
      data: await this.groupService.cloneGroup(req.user, id, body),
    };
  }

  @Put('groups/:id/permissions')
  @RequireClaim('user_groups', 'manage')
  async setPermissions(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() body: { permissions: GroupPermissionInput[] },
  ) {
    return {
      success: true,
      data: await this.groupService.setPermissions(req.user, id, body.permissions || []),
    };
  }

  @Post('groups/:id/members')
  @RequireClaim('user_groups', 'manage')
  async addMember(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return {
      success: true,
      data: await this.groupService.assignUserToGroup(req.user, body.userId, id),
    };
  }

  @Delete('groups/:id/members/:userId')
  @RequireClaim('user_groups', 'manage')
  async removeMember(
    @Req() req: { user: User },
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return {
      success: true,
      data: await this.groupService.removeUserFromGroup(req.user, userId, id),
    };
  }

  @Get('users/:userId/groups')
  @RequireClaim('users', 'view')
  async userGroups(@Param('userId') userId: string) {
    return { success: true, data: await this.groupService.listUserGroups(userId) };
  }

  @Get('users/:userId/overrides')
  @RequireClaim('users', 'manage')
  async listOverrides(@Param('userId') userId: string) {
    return { success: true, data: await this.groupService.listUserOverrides(userId) };
  }

  @Put('users/:userId/overrides')
  @RequireClaim('users', 'manage')
  async setOverrides(
    @Req() req: { user: User },
    @Param('userId') userId: string,
    @Body()
    body: {
      overrides: { pageKey: string; actionCode: string; effect: 'grant' | 'deny' }[];
    },
  ) {
    return {
      success: true,
      data: await this.groupService.setUserOverrides(req.user, userId, body.overrides || []),
    };
  }

  @Get('users/:userId/claims')
  @RequireClaim('users', 'view')
  async userClaims(@Param('userId') userId: string) {
    return {
      success: true,
      data: {
        claims: await this.permissionService.getEffectiveClaims(userId),
        permissions: await this.permissionService.getClaimsMap(userId),
      },
    };
  }
}
