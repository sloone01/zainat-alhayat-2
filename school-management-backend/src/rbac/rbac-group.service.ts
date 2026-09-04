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
import { RbacRole } from '../entities/rbac-role.entity';
import { RbacRolePermission } from '../entities/rbac-role-permission.entity';
import { RbacUserGroupRole } from '../entities/rbac-user-group-role.entity';
import { User } from '../entities/user.entity';
import { normalizeSchoolId } from './rbac.types';

export interface GroupPermissionInput {
  pageKey: string;
  actions: string[];
}

const STATIC_PERSONA_KEYS = new Set(['student', 'parent']);

function slugifyCode(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return s.slice(0, 56) || 'group';
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
    @InjectRepository(RbacRole)
    private readonly roleRepo: Repository<RbacRole>,
    @InjectRepository(RbacRolePermission)
    private readonly rolePermRepo: Repository<RbacRolePermission>,
    @InjectRepository(RbacUserGroupRole)
    private readonly groupRoleRepo: Repository<RbacUserGroupRole>,
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

  /**
   * List user groups (roles).
   * - Platform admin (no schoolId / null) → platform-scoped groups only
   *   (includes the single school-related role: school_admin_template)
   * - Platform admin + schoolId number → that school's roles (school-side tooling)
   * - School user → their school only
   */
  async listGroups(actor: User, schoolId?: number | null) {
    if (actor.isSuperAdmin || actor.isSystemUser) {
      const sid =
        schoolId === undefined ? null : normalizeSchoolId(schoolId);
      if (sid == null) {
        await this.ensureSchoolAdminTemplateFullClaims();
        // Platform: system + staff templates + static parent/student (super admin edits those)
        const groups = await this.groupRepo.find({
          where: { schoolId: IsNull() },
          relations: ['school'],
          order: { name: 'ASC' },
        });
        return this.enrichGroups(groups);
      }
      await this.ensureSchoolStaffDefaults(sid);
      const groups = await this.groupRepo.find({
        where: { schoolId: sid },
        relations: ['school'],
        order: { name: 'ASC' },
      });
      return this.enrichGroups(groups.filter((g) => g.groupType === 'staff'));
    }

    const sid = normalizeSchoolId(schoolId ?? actor.school_id);
    if (sid == null) throw new ForbiddenException('School context required');
    if (actor.school_id !== sid) throw new ForbiddenException('Wrong school');
    await this.ensureSchoolStaffDefaults(sid);
    const groups = await this.groupRepo.find({
      where: { schoolId: sid },
      relations: ['school'],
      order: { name: 'ASC' },
    });
    // School UI: staff user groups only (parent/student are static platform packs)
    return this.enrichGroups(groups.filter((g) => g.groupType === 'staff'));
  }

  /** Ensure School Admin + Teacher staff groups exist for a school. */
  async ensureSchoolStaffDefaults(schoolId: number, adminUserId?: string) {
    await this.ensureSchoolAdminGroupForSchool(schoolId, adminUserId);
    await this.ensureTeacherGroupForSchool(schoolId);
  }

  /** All page:action pairs for school + both scopes (full school admin template). */
  async buildSchoolScopePermissionInputs(): Promise<GroupPermissionInput[]> {
    const links = await this.pageActionRepo.find({ relations: ['page', 'action'] });
    const byPage = new Map<string, string[]>();
    for (const link of links) {
      if (link.page.scope !== 'school' && link.page.scope !== 'both') continue;
      if (!link.page.isActive) continue;
      if (!byPage.has(link.page.key)) byPage.set(link.page.key, []);
      byPage.get(link.page.key)!.push(link.action.code);
    }
    return [...byPage.entries()].map(([pageKey, actions]) => ({
      pageKey,
      actions: [...new Set(actions)].sort(),
    }));
  }

  /**
   * Keep the platform "School Admin (template)" role on every school page/action.
   * Per-school overrides come later via registration / modules.
   */
  async ensureSchoolAdminTemplateFullClaims(): Promise<RbacGroup | null> {
    const template = await this.groupRepo.findOne({
      where: { systemKey: 'school_admin_template' },
    });
    if (!template) return null;
    const items = await this.buildSchoolScopePermissionInputs();
    await this.applyPermissionsRaw(template.id, items);
    return template;
  }

  /**
   * Ensure a school has a School Admin group cloned from the template (full school claims)
   * and optionally assign the school admin user to it.
   */
  async ensureSchoolAdminGroupForSchool(
    schoolId: number,
    adminUserId?: string,
  ): Promise<RbacGroup> {
    const template = await this.ensureSchoolAdminTemplateFullClaims();
    if (!template) {
      throw new BadRequestException('School Admin template role is missing');
    }

    let group =
      (await this.groupRepo.findOne({
        where: { schoolId, clonedFromId: template.id },
      })) ||
      (await this.groupRepo.findOne({
        where: { schoolId, name: 'School Admin' },
      }));

    const schoolClaims = await this.buildSchoolScopePermissionInputs();

    if (!group) {
      group = await this.groupRepo.save(
        this.groupRepo.create({
          name: 'School Admin',
          code: 'school_admin',
          groupType: 'staff',
          description: 'Full school access',
          schoolId,
          color: template.color || '#0f766e',
          isSystem: false,
          systemKey: null,
          clonedFromId: template.id,
          isActive: true,
        }),
      );
    } else {
      if (!group.code) group.code = 'school_admin';
      group.groupType = 'staff';
      await this.groupRepo.save(group);
    }

    await this.applyPermissionsRaw(group.id, schoolClaims);

    if (adminUserId) {
      await this.memberRepo.save(
        this.memberRepo.create({ userId: adminUserId, groupId: group.id }),
      );
    }

    return group;
  }

  async ensureTeacherGroupForSchool(schoolId: number): Promise<RbacGroup> {
    const template = await this.groupRepo.findOne({
      where: { systemKey: 'teacher_template' },
    });
    let group =
      (await this.groupRepo.findOne({ where: { schoolId, code: 'teacher' } })) ||
      (template
        ? await this.groupRepo.findOne({ where: { schoolId, clonedFromId: template.id } })
        : null);

    if (!group) {
      group = await this.groupRepo.save(
        this.groupRepo.create({
          name: 'Teacher',
          code: 'teacher',
          groupType: 'staff',
          description: 'School teacher access',
          schoolId,
          color: template?.color || '#059669',
          isSystem: false,
          systemKey: null,
          clonedFromId: template?.id || null,
          isActive: true,
        }),
      );
      if (template) {
        const source = await this.getGroup(template.id);
        const permEntries = Object.entries(source.permissions || {}) as [string, string[]][];
        if (permEntries.length) {
          await this.applyPermissionsRaw(
            group.id,
            permEntries.map(([pageKey, actions]) => ({ pageKey, actions })),
          );
        } else {
          await this.ensurePrimaryRoleForGroup(group);
        }
      } else {
        await this.ensurePrimaryRoleForGroup(group);
      }
    } else {
      group.groupType = 'staff';
      if (!group.code) group.code = 'teacher';
      await this.groupRepo.save(group);
    }
    return group;
  }

  private async uniqueGroupCode(schoolId: number | null, base: string): Promise<string> {
    let code = slugifyCode(base);
    let n = 0;
    while (true) {
      const candidate = n === 0 ? code : `${code}_${n}`;
      const existing = await this.groupRepo
        .createQueryBuilder('g')
        .where('g.code = :code', { code: candidate })
        .andWhere(schoolId == null ? 'g.schoolId IS NULL' : 'g.schoolId = :sid', {
          sid: schoolId as number,
        })
        .getOne();
      if (!existing) return candidate;
      n += 1;
    }
  }

  /** Ensure user group has a primary claim-pack role; create if missing. */
  private async ensurePrimaryRoleForGroup(group: RbacGroup): Promise<RbacRole> {
    const [link] = await this.groupRoleRepo.find({
      where: { groupId: group.id },
      relations: ['role'],
      order: { assignedAt: 'ASC' },
      take: 1,
    });
    if (link?.role) return link.role;

    const roleCode = group.code ? `role_${group.code}` : slugifyCode(`${group.name}_role`);
    const role = await this.roleRepo.save(
      this.roleRepo.create({
        name: `${group.name} Role`,
        code: roleCode.slice(0, 64),
        description: `Claim pack for user group ${group.name}`,
        schoolId: group.schoolId,
        isSystem: !!group.isSystem,
        systemKey: group.systemKey ? `role_from_${group.systemKey}` : null,
        isActive: true,
      }),
    );
    await this.groupRoleRepo.save(
      this.groupRoleRepo.create({ groupId: group.id, roleId: role.id }),
    );
    return role;
  }

  /** Replace group + primary-role permissions without actor/scope checks. */
  private async applyPermissionsRaw(groupId: string, items: GroupPermissionInput[]) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) return;

    const pageKeys = items.map((i) => i.pageKey);
    const pages = pageKeys.length
      ? await this.pageRepo.find({ where: { key: In(pageKeys) } })
      : [];
    const pageByKey = new Map(pages.map((p) => [p.key, p]));
    const actions = await this.actionRepo.find();
    const actionByCode = new Map(actions.map((a) => [a.code, a]));

    const allowedLinks = await this.pageActionRepo.find({ relations: ['page', 'action'] });
    const allowed = new Set(allowedLinks.map((l) => `${l.page.key}:${l.action.code}`));

    const role = await this.ensurePrimaryRoleForGroup(group);

    await this.permRepo.delete({ groupId });
    await this.rolePermRepo.delete({ roleId: role.id });

    const groupRows: RbacGroupPermission[] = [];
    const roleRows: RbacRolePermission[] = [];
    for (const item of items) {
      const page = pageByKey.get(item.pageKey);
      if (!page) continue;
      for (const code of item.actions) {
        if (!allowed.has(`${item.pageKey}:${code}`)) continue;
        const action = actionByCode.get(code);
        if (!action) continue;
        groupRows.push(
          this.permRepo.create({
            groupId,
            pageId: page.id,
            actionId: action.id,
          }),
        );
        roleRows.push(
          this.rolePermRepo.create({
            roleId: role.id,
            pageId: page.id,
            actionId: action.id,
          }),
        );
      }
    }
    if (groupRows.length) await this.permRepo.save(groupRows);
    if (roleRows.length) await this.rolePermRepo.save(roleRows);
  }

  /** Attach permissions map + member counts for list/detail cards. */
  private async enrichGroups(groups: RbacGroup[]) {
    if (!groups.length) return [];
    const ids = groups.map((g) => g.id);

    const permissionsByGroup = new Map<string, Record<string, string[]>>();
    const addPerm = (groupId: string, pageKey: string, action: string) => {
      if (!permissionsByGroup.has(groupId)) permissionsByGroup.set(groupId, {});
      const map = permissionsByGroup.get(groupId)!;
      if (!map[pageKey]) map[pageKey] = [];
      if (!map[pageKey].includes(action)) map[pageKey].push(action);
    };

    const links = await this.groupRoleRepo.find({
      where: { groupId: In(ids) },
    });
    const roleIds = [...new Set(links.map((l) => l.roleId))];
    if (roleIds.length) {
      const rolePerms = await this.rolePermRepo.find({
        where: { roleId: In(roleIds) },
        relations: ['page', 'action'],
      });
      const roleToGroups = new Map<string, string[]>();
      for (const l of links) {
        if (!roleToGroups.has(l.roleId)) roleToGroups.set(l.roleId, []);
        roleToGroups.get(l.roleId)!.push(l.groupId);
      }
      for (const p of rolePerms) {
        for (const gid of roleToGroups.get(p.roleId) || []) {
          addPerm(gid, p.page.key, p.action.code);
        }
      }
    }

    const perms = await this.permRepo.find({
      where: { groupId: In(ids) },
      relations: ['page', 'action'],
    });
    for (const p of perms) {
      addPerm(p.groupId, p.page.key, p.action.code);
    }

    const counts = await this.memberRepo
      .createQueryBuilder('m')
      .select('m.groupId', 'groupId')
      .addSelect('COUNT(*)', 'count')
      .where('m.groupId IN (:...ids)', { ids })
      .groupBy('m.groupId')
      .getRawMany<{ groupId: string; count: string }>();
    const countByGroup = new Map(counts.map((c) => [c.groupId, Number(c.count)]));

    return groups.map((g) => ({
      ...g,
      schoolName: g.school?.name ?? null,
      permissions: permissionsByGroup.get(g.id) || {},
      memberCount: countByGroup.get(g.id) || 0,
    }));
  }

  async getGroup(id: string) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!group) throw new NotFoundException('User group not found');
    const [enriched] = await this.enrichGroups([group]);
    return enriched;
  }

  async createGroup(
    actor: User,
    data: {
      name: string;
      description?: string;
      schoolId?: number | null;
      color?: string;
      code?: string;
      groupType?: 'system' | 'staff' | 'parent' | 'student';
    },
  ) {
    const schoolId = normalizeSchoolId(data.schoolId ?? actor.school_id);
    this.assertCanManageScope(actor, schoolId);

    // School actors may only create staff groups for their school
    let groupType = data.groupType || 'staff';
    if (!actor.isSuperAdmin && !actor.isSystemUser) {
      if (schoolId == null) {
        throw new ForbiddenException('School context required');
      }
      groupType = 'staff';
    }
    if (groupType === 'parent' || groupType === 'student') {
      throw new BadRequestException('Parent/Student groups are system-defined and cannot be created');
    }
    if (groupType === 'system' && !actor.isSuperAdmin) {
      throw new ForbiddenException('Only super admin can create system groups');
    }

    const code = await this.uniqueGroupCode(
      schoolId,
      data.code?.trim() || data.name.trim(),
    );

    const group = await this.groupRepo.save(
      this.groupRepo.create({
        name: data.name.trim(),
        code,
        groupType,
        description: data.description?.trim() || null,
        schoolId,
        color: data.color || null,
        isSystem: false,
        systemKey: null,
        isActive: true,
      }),
    );
    await this.ensurePrimaryRoleForGroup(group);
    return group;
  }

  async updateGroup(
    actor: User,
    id: string,
    data: { name?: string; description?: string; color?: string; isActive?: boolean; code?: string },
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
    if (data.code != null && !group.isSystem) {
      const next = slugifyCode(data.code);
      if (next !== group.code) {
        group.code = await this.uniqueGroupCode(group.schoolId, next);
      }
    }
    return this.groupRepo.save(group);
  }

  async deleteGroup(actor: User, id: string) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('User group not found');
    if (group.isSystem) throw new BadRequestException('System groups cannot be deleted');
    if (group.groupType === 'parent' || group.groupType === 'student') {
      throw new BadRequestException('Parent/Student groups cannot be deleted');
    }
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

    const code = await this.uniqueGroupCode(
      targetSchoolId,
      opts?.name?.trim() || `${source.code || source.name}_copy`,
    );
    const clone = await this.groupRepo.save(
      this.groupRepo.create({
        name: opts?.name?.trim() || `${source.name} (copy)`,
        code,
        groupType: source.groupType === 'system' ? 'staff' : source.groupType || 'staff',
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

    if (group.groupType === 'parent' || group.groupType === 'student') {
      if (!actor.isSuperAdmin) {
        throw new ForbiddenException('Only super admin can edit parent/student group claims');
      }
    }
    if (group.groupType === 'system' && !actor.isSuperAdmin) {
      throw new ForbiddenException('Only super admin can edit system group claims');
    }

    const pages = await this.pageRepo.find({ where: { key: In(items.map((i) => i.pageKey)) } });
    const pageByKey = new Map(pages.map((p) => [p.key, p]));
    const allowedLinks = await this.pageActionRepo.find({ relations: ['page', 'action'] });
    const allowed = new Set(allowedLinks.map((l) => `${l.page.key}:${l.action.code}`));

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
      }
    }

    // School Admin template always keeps full school-scope claims
    if (group.systemKey === 'school_admin_template') {
      await this.applyPermissionsRaw(groupId, await this.buildSchoolScopePermissionInputs());
    } else {
      await this.applyPermissionsRaw(groupId, items);
    }
    return this.getGroup(groupId);
  }

  async assignUserToGroup(actor: User, userId: string, groupId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('User group not found');
    this.assertCanManageScope(actor, group.schoolId);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const userType = user.user_type || this.deriveUserType(user);
    const gType = group.groupType || 'staff';

    if (gType === 'parent' || gType === 'student') {
      if (userType !== gType) {
        throw new BadRequestException(
          `Only ${gType} users can join the ${group.name} group`,
        );
      }
    } else if (gType === 'system') {
      if (userType !== 'platform' && !user.isSuperAdmin && !user.isSystemUser) {
        throw new BadRequestException('Only platform users can join system groups');
      }
    } else if (gType === 'staff') {
      if (userType === 'student' || userType === 'parent') {
        throw new BadRequestException(
          'Student and parent accounts use fixed groups and cannot join staff groups',
        );
      }
      if (userType === 'staff' && group.schoolId == null && !actor.isSuperAdmin && !actor.isSystemUser) {
        throw new BadRequestException('Staff cannot join platform staff templates');
      }
    }

    const userSchool = normalizeSchoolId(user.school_id);
    if (group.schoolId == null) {
      if (
        !user.isSystemUser &&
        !user.isSuperAdmin &&
        userSchool != null &&
        gType !== 'parent' &&
        gType !== 'student'
      ) {
        throw new BadRequestException('School users cannot join platform groups');
      }
    } else if (userSchool !== group.schoolId) {
      throw new BadRequestException('User school does not match group school');
    }

    // Students/parents: replace any other memberships with the single static group
    if (userType === 'student' || userType === 'parent') {
      await this.memberRepo.delete({ userId });
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

    if (group.groupType === 'parent' || group.groupType === 'student') {
      throw new BadRequestException('Cannot remove users from static student/parent groups');
    }

    await this.memberRepo.delete({ userId, groupId });
    return { success: true };
  }

  /** Auto-assign student/parent to their static system group. */
  async ensurePersonaGroupMembership(user: User): Promise<void> {
    const userType = user.user_type || this.deriveUserType(user);
    if (userType !== 'student' && userType !== 'parent') return;

    const group = await this.groupRepo.findOne({ where: { systemKey: userType } });
    if (!group) return;

    await this.memberRepo.delete({ userId: user.id });
    await this.memberRepo.save(
      this.memberRepo.create({ userId: user.id, groupId: group.id }),
    );
  }

  deriveUserType(user: User): 'staff' | 'parent' | 'student' | 'platform' {
    if (user.isSuperAdmin || user.isSystemUser) return 'platform';
    if (user.role === 'parent') return 'parent';
    if (user.role === 'student') return 'student';
    return 'staff';
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
