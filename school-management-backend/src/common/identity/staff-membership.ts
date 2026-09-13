import { EntityManager } from 'typeorm';
import { Staff } from '../../entities/staff.entity';
import { User } from '../../entities/user.entity';

export function isLinkableStaffAccount(user: {
  user_type?: string | null;
  role?: string | null;
  isSuperAdmin?: boolean;
  isSystemUser?: boolean;
}): boolean {
  if (user.isSuperAdmin || user.isSystemUser) return false;
  if (user.user_type === 'platform') return false;
  return true;
}

/** Owner is the school's admin user, or the first staff member when the owner is linked from another school. */
export async function findSchoolOwnerUser(
  manager: EntityManager,
  schoolId: string,
): Promise<User | null> {
  if (!schoolId) return null;
  const [bySchool] = await manager.getRepository(User).find({
    where: { school_id: schoolId, role: 'admin' },
    order: { createdAt: 'ASC' },
    take: 1,
  });
  if (bySchool) return bySchool;

  const staffRows = await manager.getRepository(Staff).find({
    where: { school_id: schoolId },
    relations: ['user'],
    order: { created_at: 'ASC' },
  });
  const users = staffRows.map((r) => r.user).filter((u): u is User => !!u);
  return users.find((u) => u.role === 'admin') || users[0] || null;
}

export async function hasStaffMembership(
  manager: EntityManager,
  userId: string,
  schoolId: string | null | undefined,
): Promise<boolean> {
  if (!userId || !schoolId) return false;
  const row = await manager.getRepository(Staff).findOne({
    where: { user_id: userId, school_id: schoolId },
    select: ['id'],
  });
  return !!row;
}

export async function ensureStaffMembership(
  manager: EntityManager,
  userId: string,
  schoolId: string | null | undefined,
): Promise<void> {
  if (!userId || !schoolId) return;
  if (await hasStaffMembership(manager, userId, schoolId)) return;
  const repo = manager.getRepository(Staff);
  await repo.save(repo.create({ user_id: userId, school_id: schoolId }));
}
