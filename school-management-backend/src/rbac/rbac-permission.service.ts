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

type Timed<T> = { at: number; value: T };

const CLAIMS_TTL_MS = 45_000;
const ENTITLED_TTL_MS = 60_000;
const CATALOG_TTL_MS = 60_000;

@Injectable()
export class RbacPermissionService {
  private readonly claimsCache = new Map<string, Timed<ClaimCode[]>>();
  private readonly entitledCache = new Map<string, Timed<Set<string> | null>>();
  private catalogCache: Timed<ClaimCode[]> | null = null;

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

  invalidateUser(userId: string) {
    for (const key of [...this.claimsCache.keys()]) {
      if (key === userId || key.startsWith(`${userId}:`)) {
        this.claimsCache.delete(key);
      }
    }
  }

  invalidateAllClaims() {
    this.claimsCache.clear();
  }

  invalidateSchool(schoolId: string) {
    this.entitledCache.delete(schoolId);
    this.claimsCache.clear();
  }

  async getEffectiveClaims(userId: string): Promise<ClaimCode[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.isActive) return [];
    const cacheKey = `${userId}:${user.school_id ?? 'none'}`;
    const hit = this.claimsCache.get(cacheKey);
    if (hit && Date.now() - hit.at < CLAIMS_TTL_MS) {
      return hit.value;
    }
    const claims = await this.computeEffectiveClaims(user);
    this.claimsCache.set(cacheKey, { at: Date.now(), value: claims });
    return claims;
  }

  /**
   * Pages the school may use from active school_modules.
   * Returns null when school has no module rows yet (no gate — avoid locking out before sync).
   */
  async getEntitledPageKeys(schoolId: string): Promise<Set<string> | null> {
    const hit = this.entitledCache.get(schoolId);
    if (hit && Date.now() - hit.at < ENTITLED_TTL_MS) {
      return hit.value;
    }
    const keys = await this.computeEntitledPageKeys(schoolId);
    this.entitledCache.set(schoolId, { at: Date.now(), value: keys });
    return keys;
  }

  async hasClaim(userId: string, pageKey: string, actionCode: string): Promise<boolean> {
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

  private async computeEffectiveClaims(user: User): Promise<ClaimCode[]> {
    if (!user || !user.isActive) return [];

    if (user.isSuperAdmin) {
      return this.getAllCatalogClaims();
    }

    const memberships = await this.memberRepo.find({
      where: { userId: user.id },
      relations: ['group'],
    });
    const isPlatform =
      user.user_type === 'platform' || !!user.isSystemUser || !!user.isSuperAdmin;
    const staffType =
      !isPlatform &&
      (user.user_type === 'staff' || user.role === 'admin' || user.role === 'teacher');
    const groupIds = memberships
      .filter((m) => m.group?.isActive !== false)
      .filter((m) => {
        if (!staffType) return true;
        const gSchool = m.group?.schoolId ?? null;
        if (gSchool == null) return false;
        return user.school_id != null && String(gSchool) === String(user.school_id);
      })
      .map((m) => m.groupId);

    const granted = new Set<ClaimCode>();

    if (groupIds.length) {
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
      where: { userId: user.id },
      relations: ['page', 'action'],
    });

    for (const o of overrides) {
      const claim = toClaim(o.page.key, o.action.code);
      if (o.effect === 'grant') granted.add(claim);
      else granted.delete(claim);
    }

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

  private async computeEntitledPageKeys(schoolId: string): Promise<Set<string> | null> {
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

  private async getAllCatalogClaims(): Promise<ClaimCode[]> {
    if (this.catalogCache && Date.now() - this.catalogCache.at < CATALOG_TTL_MS) {
      return this.catalogCache.value;
    }
    const rows = await this.pageActionRepo.find({
      relations: ['page', 'action'],
    });
    const claims = rows
      .filter((r) => r.page?.isActive)
      .map((r) => toClaim(r.page.key, r.action.code))
      .sort();
    this.catalogCache = { at: Date.now(), value: claims };
    return claims;
  }
}
