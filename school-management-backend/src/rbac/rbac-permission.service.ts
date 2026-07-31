import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RbacGroupPermission } from '../entities/rbac-group-permission.entity';
import { RbacUserGroupMember } from '../entities/rbac-user-group-member.entity';
import { RbacUserPermissionOverride } from '../entities/rbac-user-permission-override.entity';
import { RbacPageAction } from '../entities/rbac-page-action.entity';
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
    @InjectRepository(RbacUserPermissionOverride)
    private readonly overrideRepo: Repository<RbacUserPermissionOverride>,
    @InjectRepository(RbacPageAction)
    private readonly pageActionRepo: Repository<RbacPageAction>,
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
      const rows = await this.groupPermRepo
        .createQueryBuilder('gp')
        .innerJoinAndSelect('gp.page', 'page')
        .innerJoinAndSelect('gp.action', 'action')
        .where('gp.groupId IN (:...groupIds)', { groupIds })
        .andWhere('page.isActive = true')
        .getMany();

      for (const row of rows) {
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

    return [...granted].sort();
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
