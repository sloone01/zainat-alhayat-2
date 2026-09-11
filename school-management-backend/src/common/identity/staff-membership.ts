import { EntityManager } from 'typeorm';
import { Staff } from '../../entities/staff.entity';

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
