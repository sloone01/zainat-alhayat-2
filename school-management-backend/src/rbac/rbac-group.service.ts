import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { RbacGroup } from '../entities/rbac-group.entity';
import { RbacGroupPermission } from '../entities/rbac-group-permission.entity';
import { RbacPage } from '../entities/rbac-page.entity';
import { RbacAction } from '../entities/rbac-action.entity';
import { RbacPageAction } from '../entities/rbac-page-action.entity';
import { RbacUserGroupMember } from '../entities/rbac-user-group-member.entity';
import { RbacUserPermissionOverride } from '../entities/rbac-user-permission-override.entity';
import { User } from '../entities/user.entity';
import { normalizeSchoolId } from './rbac.types';

export interface GroupPermissionInput {
  pageKey: string;
  actions: string[];
}

@Injectable()
export class RbacGroupService {
  constructor(
    @InjectRepository(RbacGroup)
    private readonly groupRepo: Repository<RbacGroup>,
    @InjectRepository(RbacGroupPermission)
    private readonly permRepo: Repository<RbacGroupPermission>,
    @InjectRepository(RbacPage)
    private readonly pageRepo: Repository<RbacPage>,
    @InjectRepository(RbacAction)
    private readonly actionRepo: Repository<RbacAction>,
    @InjectRepository(RbacPageAction)
    private readonly pageActionRepo: Repository<RbacPageAction>,
    @InjectRepository(RbacUserGroupMember)
    private readonly memberRepo: Repository<RbacUserGroupMember>,
    @InjectRepository(RbacUserPermissionOverride)
    private readonly overrideRepo: Repository<RbacUserPermissionOverride>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async listCatalog() {
    const [actions, pages, links] = await Promise.all([
      this.actionRepo.find({ order: { sortOrder: 'ASC' } }),
      this.pageRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } }),
      this.pageActionRepo.find({ relations: ['page', 'action'] }),
    ]);

    const allowedByPage = new Map<string, string[]>();
    for (const link of links) {
      const key = link.page.key;
      if (!allowedByPage.has(key)) allowedByPage.set(key, []);
      allowedByPage.get(key)!.push(link.action.code);
    }

    return {
      actions: actions.map((a) => ({ code: a.code, name: a.name, sortOrder: a.sortOrder })),
      pages: pages.map((p) => ({
        key: p.key,
        route: p.route,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        scope: p.scope,
        sortOrder: p.sortOrder,
        allowedActions: (allowedByPage.get(p.key) || []).sort(),
      })),
    };
  }

  async listGroups(actor: User, schoolId?: number | null) {
    const sid = normalizeSchoolId(schoolId ?? actor.school_id);
    if (actor.isSuperAdmin || actor.isSystemUser) {
      if (sid == null) {
        return this.groupRepo.find({
          where: { schoolId: IsNull() },
          order: { name: 'ASC' },
        });
      }
      return this.groupRepo.find({
        where: { schoolId: sid },
        order: { name: 'ASC' },
      });
    }
    if (sid == null) throw new ForbiddenException('School context required');
    if (actor.school_id !== sid) throw new ForbiddenException('Wrong school');
    return this.groupRepo.find({
      where: { schoolId: sid },
      order: { name: 'ASC' },
    });
  }

  async getGroup(id: string) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('User group not found');
    const perms = await this.permRepo.find({
      where: { groupId: id },
      relations: ['page', 'action'],
    });
    const permissions: Record<string, string[]> = {};
    for (const p of perms) {
      if (!permissions[p.page.key]) permissions[p.page.key] = [];
      permissions[p.page.key].push(p.action.code);
    }
    const memberCount = await this.memberRepo.count({ where: { groupId: id } });
    return { ...group, permissions, memberCount };
  }

  async createGroup(
    actor: User,
    data: { name: string; description?: string; schoolId?: number | null; color?: string },
  ) {
    const schoolId = normalizeSchoolId(data.schoolId ?? actor.school_id);
    this.assertCanManageScope(actor, schoolId);

    const group = this.groupRepo.create({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      schoolId,
      color: data.color || null,
      isSystem: false,
      systemKey: null,
      isActive: true,
    });
    return this.groupRepo.save(group);
  }

  async updateGroup(
    actor: User,
    id: string,
    data: { name?: string; description?: string; color?: string; isActive?: boolean },
  ) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('User group not found');
    this.assertCanManageScope(actor, group.schoolId);
    if (group.isSystem && group.systemKey === 'super_admin' && !actor.isSuperAdmin) {
      throw new ForbiddenException('Cannot edit Super Admin group');
    }
    if (data.name != null) group.name = data.name.trim();
    if (data.description !== undefined) group.description = data.description?.trim() || null;
    if (data.color !== undefined) group.color = data.color;
    if (data.isActive !== undefined && !group.isSystem) group.isActive = data.isActive;
    return this.groupRepo.save(group);
  }

  async deleteGroup(actor: User, id: string) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('User group not found');
    if (group.isSystem) throw new BadRequestException('System groups cannot be deleted');
    this.assertCanManageScope(actor, group.schoolId);
    await this.groupRepo.remove(group);
  }

  /** Clone a group (including permissions) into the same or target school scope. */
  async cloneGroup(
    actor: User,
    sourceId: string,
    opts?: { name?: string; schoolId?: number | null },
  ) {
    const source = await this.getGroup(sourceId);
    const targetSchoolId = normalizeSchoolId(
      opts?.schoolId !== undefined ? opts.schoolId : source.schoolId,
    );
    this.assertCanManageScope(actor, targetSchoolId);

    const clone = await this.groupRepo.save(
      this.groupRepo.create({
        name: opts?.name?.trim() || `${source.name} (copy)`,
        description: source.description,
        schoolId: targetSchoolId,
        color: source.color,
        isSystem: false,
        systemKey: null,
        clonedFromId: source.id,
        isActive: true,
      }),
    );

    const permEntries = Object.entries(source.permissions || {}) as [string, string[]][];
    if (permEntries.length) {
      await this.setPermissions(actor, clone.id, permEntries.map(([pageKey, actions]) => ({ pageKey, actions })));
    }
    return this.getGroup(clone.id);
  }

  async setPermissions(actor: User, groupId: string, items: GroupPermissionInput[]) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('User group not found');
    this.assertCanManageScope(actor, group.schoolId);

    const pages = await this.pageRepo.find({ where: { key: In(items.map((i) => i.pageKey)) } });
    const pageByKey = new Map(pages.map((p) => [p.key, p]));
    const actions = await this.actionRepo.find();
    const actionByCode = new Map(actions.map((a) => [a.code, a]));

    const allowedLinks = await this.pageActionRepo.find({ relations: ['page', 'action'] });
    const allowed = new Set(allowedLinks.map((l) => `${l.page.key}:${l.action.code}`));

    await this.permRepo.delete({ groupId });

    const rows: RbacGroupPermission[] = [];
    for (const item of items) {
      const page = pageByKey.get(item.pageKey);
      if (!page) throw new BadRequestException(`Unknown page: ${item.pageKey}`);
      if (group.schoolId != null && page.scope === 'platform') {
        throw new BadRequestException(`Page ${item.pageKey} is platform-only`);
      }
      for (const code of item.actions) {
        if (!allowed.has(`${item.pageKey}:${code}`)) {
          throw new BadRequestException(`Action ${code} not allowed on page ${item.pageKey}`);
        }
        const action = actionByCode.get(code);
        if (!action) throw new BadRequestException(`Unknown action: ${code}`);
        rows.push(
          this.permRepo.create({
            groupId,
            pageId: page.id,
            actionId: action.id,
          }),
        );
      }
    }
    if (rows.length) await this.permRepo.save(rows);
    return this.getGroup(groupId);
  }

  async assignUserToGroup(actor: User, userId: string, groupId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('User group not found');
    this.assertCanManageScope(actor, group.schoolId);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const userSchool = normalizeSchoolId(user.school_id);
    if (group.schoolId == null) {
      if (!user.isSystemUser && !user.isSuperAdmin && userSchool != null) {
        throw new BadRequestException('School users cannot join platform groups');
      }
    } else if (userSchool !== group.schoolId) {
      throw new BadRequestException('User school does not match group school');
    }

    await this.memberRepo.save(
      this.memberRepo.create({ userId, groupId }),
    );
    return { success: true };
  }

  async removeUserFromGroup(actor: User, userId: string, groupId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('User group not found');
    this.assertCanManageScope(actor, group.schoolId);
    await this.memberRepo.delete({ userId, groupId });
    return { success: true };
  }

  async listUserGroups(userId: string) {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['group'],
    });
    return members.map((m) => m.group);
  }

  async setUserOverrides(
    actor: User,
    userId: string,
    overrides: { pageKey: string; actionCode: string; effect: 'grant' | 'deny' }[],
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    this.assertCanManageScope(actor, normalizeSchoolId(user.school_id));

    await this.overrideRepo.delete({ userId });

    if (!overrides.length) return { overrides: [] };

    const pages = await this.pageRepo.find({
      where: { key: In(overrides.map((o) => o.pageKey)) },
    });
    const pageByKey = new Map(pages.map((p) => [p.key, p]));
    const actions = await this.actionRepo.find();
    const actionByCode = new Map(actions.map((a) => [a.code, a]));

    const rows = overrides.map((o) => {
      const page = pageByKey.get(o.pageKey);
      const action = actionByCode.get(o.actionCode);
      if (!page || !action) {
        throw new BadRequestException(`Invalid override ${o.pageKey}:${o.actionCode}`);
      }
      return this.overrideRepo.create({
        userId,
        pageId: page.id,
        actionId: action.id,
        effect: o.effect,
      });
    });
    await this.overrideRepo.save(rows);
    return this.listUserOverrides(userId);
  }

  async listUserOverrides(userId: string) {
    const rows = await this.overrideRepo.find({
      where: { userId },
      relations: ['page', 'action'],
    });
    return rows.map((r) => ({
      id: r.id,
      pageKey: r.page.key,
      actionCode: r.action.code,
      effect: r.effect,
    }));
  }

  private assertCanManageScope(actor: User, schoolId: number | null) {
    if (actor.isSuperAdmin) return;
    if (schoolId == null) {
      if (!actor.isSystemUser) {
        throw new ForbiddenException('Only system users can manage platform groups');
      }
      return;
    }
    if (actor.isSystemUser) return;
    if (normalizeSchoolId(actor.school_id) !== schoolId) {
      throw new ForbiddenException('Cannot manage groups for another school');
    }
  }
}
