import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RbacGroupPermission } from '../entities/rbac-group-permission.entity';
import { RbacUserGroupMember } from '../entities/rbac-user-group-member.entity';
import { RbacUserPermissionOverride } from '../entities/rbac-user-permission-override.entity';
import { RbacPageAction } from '../entities/rbac-page-action.entity';
import { RbacUserGroupRole } from '../entities/rbac-user-group-role.entity';
import { RbacRolePermission } from '../entities/rbac-role-permission.entity';
import { SchoolModule } from '../platform-billing/entities/school-module.entity';
import { toClaim, type ClaimCode } from './rbac.types';

@Injectable()
export class RbacPermissionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RbacUserGroupMember)
    private readonly memberRepo: Repository<RbacUserGroupMember>,
    @InjectRepository(RbacGroupPermission)
    private readonly groupPermRepo: Repository<RbacGroupPermission>,
    @InjectRepository(RbacUserGroupRole)
    private readonly groupRoleRepo: Repository<RbacUserGroupRole>,
    @InjectRepository(RbacRolePermission)
    private readonly rolePermRepo: Repository<RbacRolePermission>,
    @InjectRepository(RbacUserPermissionOverride)
    private readonly overrideRepo: Repository<RbacUserPermissionOverride>,
    @InjectRepository(RbacPageAction)
    private readonly pageActionRepo: Repository<RbacPageAction>,
    @InjectRepository(SchoolModule)
    private readonly schoolModuleRepo: Repository<SchoolModule>,
  ) {}

  async getEffectiveClaims(userId: string): Promise<ClaimCode[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.isActive) return [];

    if (user.isSuperAdmin) {
      return this.getAllCatalogClaims();
    }

    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['group'],
    });
    const groupIds = memberships
      .filter((m) => m.group?.isActive !== false)
      .map((m) => m.groupId);

    const granted = new Set<ClaimCode>();

    if (groupIds.length) {
      // Prefer role claim packs attached to user groups
      const links = await this.groupRoleRepo.find({
        where: { groupId: In(groupIds) },
        relations: ['role'],
      });
      const roleIds = links
        .filter((l) => l.role?.isActive !== false)
        .map((l) => l.roleId);

      if (roleIds.length) {
        const roleRows = await this.rolePermRepo
          .createQueryBuilder('rp')
          .innerJoinAndSelect('rp.page', 'page')
          .innerJoinAndSelect('rp.action', 'action')
          .where('rp.roleId IN (:...roleIds)', { roleIds })
          .andWhere('page.isActive = true')
          .getMany();
        for (const row of roleRows) {
          granted.add(toClaim(row.page.key, row.action.code));
        }
      }

      // Legacy fallback: direct group permissions (kept in sync for transition)
      const groupRows = await this.groupPermRepo
        .createQueryBuilder('gp')
        .innerJoinAndSelect('gp.page', 'page')
        .innerJoinAndSelect('gp.action', 'action')
        .where('gp.groupId IN (:...groupIds)', { groupIds })
        .andWhere('page.isActive = true')
        .getMany();
      for (const row of groupRows) {
        granted.add(toClaim(row.page.key, row.action.code));
      }
    }

    const overrides = await this.overrideRepo.find({
      where: { userId },
      relations: ['page', 'action'],
    });

    for (const o of overrides) {
      const claim = toClaim(o.page.key, o.action.code);
      if (o.effect === 'grant') granted.add(claim);
      else granted.delete(claim);
    }

    // School module entitlement gate (platform users bypass)
    if (!user.isSystemUser && user.school_id != null) {
      const entitled = await this.getEntitledPageKeys(user.school_id);
      if (entitled != null) {
        for (const claim of [...granted]) {
          const pageKey = claim.split(':')[0];
          if (pageKey && !entitled.has(pageKey)) granted.delete(claim);
        }
      }
    }

    return [...granted].sort();
  }

  /**
   * Pages the school may use from active school_modules.
   * Returns null when school has no module rows yet (no gate — avoid locking out before sync).
   */
  async getEntitledPageKeys(schoolId: number): Promise<Set<string> | null> {
    const rows = await this.schoolModuleRepo.find({
      where: { school_id: schoolId, is_active: true },
      relations: ['module'],
    });
    if (!rows.length) return null;

    const keys = new Set<string>();
    for (const row of rows) {
      if (!row.module?.is_active) continue;
      for (const k of row.module.page_keys || []) {
        if (k) keys.add(k);
      }
    }
    return keys;
  }

  async hasClaim(userId: string, pageKey: string, actionCode: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.isActive) return false;
    if (user.isSuperAdmin) return true;
    const claims = await this.getEffectiveClaims(userId);
    return claims.includes(toClaim(pageKey, actionCode));
  }

  async getClaimsMap(userId: string): Promise<Record<string, string[]>> {
    const claims = await this.getEffectiveClaims(userId);
    const map: Record<string, string[]> = {};
    for (const c of claims) {
      const [page, action] = c.split(':');
      if (!page || !action) continue;
      if (!map[page]) map[page] = [];
      map[page].push(action);
    }
    return map;
  }

  private async getAllCatalogClaims(): Promise<ClaimCode[]> {
    const rows = await this.pageActionRepo.find({
      relations: ['page', 'action'],
    });
    return rows
      .filter((r) => r.page?.isActive)
      .map((r) => toClaim(r.page.key, r.action.code))
      .sort();
  }
}
