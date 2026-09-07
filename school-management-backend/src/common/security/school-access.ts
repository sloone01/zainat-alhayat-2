import { ForbiddenException } from '@nestjs/common';
import { User } from '../../entities/user.entity';

/** Platform / super-admin users may access any school. */
export function isPlatformActor(user?: Pick<User, 'isSuperAdmin' | 'isSystemUser' | 'school_id' | 'user_type'> | null): boolean {
  if (!user) return false;
  if (user.isSuperAdmin || user.isSystemUser) return true;
  if (user.user_type === 'platform') return true;
  return user.school_id == null;
}

/**
 * School id the actor is allowed to operate in.
 * Non-platform users must have a school_id; platform may pass an explicit filter.
 */
export function resolveActorSchoolId(
  user: Pick<User, 'isSuperAdmin' | 'isSystemUser' | 'school_id' | 'user_type'>,
  requestedSchoolId?: number | null,
): number | null {
  if (isPlatformActor(user)) {
    return requestedSchoolId != null ? Number(requestedSchoolId) : null;
  }
  if (user.school_id == null) {
    throw new ForbiddenException('School context required');
  }
  const own = Number(user.school_id);
  if (requestedSchoolId != null && Number(requestedSchoolId) !== own) {
    throw new ForbiddenException('Wrong school');
  }
  return own;
}

export function assertSameSchool(
  user: Pick<User, 'isSuperAdmin' | 'isSystemUser' | 'school_id' | 'user_type'>,
  resourceSchoolId: number | null | undefined,
): void {
  if (isPlatformActor(user)) return;
  if (user.school_id == null) {
    throw new ForbiddenException('School context required');
  }
  if (resourceSchoolId == null || Number(resourceSchoolId) !== Number(user.school_id)) {
    throw new ForbiddenException('Resource not in your school');
  }
}

/** Strip password (and other secrets) from a User entity or plain object. */
export function sanitizeUser<T extends Record<string, unknown> | User | null | undefined>(
  user: T,
): T {
  if (!user || typeof user !== 'object') return user;
  const { password: _pw, ...rest } = user as Record<string, unknown>;
  return rest as T;
}

export function sanitizeUserDeep<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeUserDeep(v)) as T;
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'password') continue;
    if (v && typeof v === 'object') {
      out[k] = sanitizeUserDeep(v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
