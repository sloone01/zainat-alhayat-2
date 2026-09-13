import { ArgumentMetadata, ForbiddenException, Injectable, PipeTransform } from '@nestjs/common';
import { User } from '../../entities/user.entity';

/** `schools.id` / `users.school_id` are UUIDs. Legacy screens sent `1` or `NaN`. */
const SCHOOL_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Client `school_id` if it is a real UUID; otherwise null (bind from JWT). */
export function coerceRequestedSchoolId(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || s === '1' || s === 'NaN' || !SCHOOL_ID_UUID.test(s)) return null;
  return s;
}

/** Query `school_id` that may be missing or a leftover numeric default. */
@Injectable()
export class RequestedSchoolIdPipe implements PipeTransform<unknown, string | undefined> {
  transform(value: unknown, _meta: ArgumentMetadata): string | undefined {
    return coerceRequestedSchoolId(value) ?? undefined;
  }
}

/** Parents/students are school-less on `users.school_id`; never treat them as platform. */
export function isParentOrStudentActor(
  user?: { user_type?: string | null; role?: string | null } | null,
): boolean {
  if (!user) return false;
  if (user.user_type === 'parent' || user.user_type === 'student') return true;
  return user.role === 'parent' || user.role === 'student';
}

/** Platform / super-admin users may access any school. */
export function isPlatformActor(user?: Pick<User, 'isSuperAdmin' | 'isSystemUser' | 'school_id' | 'user_type'> & { role?: string } | null): boolean {
  if (!user) return false;
  if (isParentOrStudentActor(user)) return false;
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
  requestedSchoolId?: string | null,
): string | null {
  const requested = coerceRequestedSchoolId(requestedSchoolId);

  if (isPlatformActor(user)) {
    return requested;
  }
  if (user.school_id == null) {
    throw new ForbiddenException('School context required');
  }
  // School staff are bound to the JWT school. Ignore a stale/default client
  // school_id (many screens used to send `1`) instead of 403 "Wrong school".
  return String(user.school_id);
}

export function assertSameSchool(
  user: Pick<User, 'isSuperAdmin' | 'isSystemUser' | 'school_id' | 'user_type'>,
  resourceSchoolId: string | null | undefined,
): void {
  if (isPlatformActor(user)) return;
  if (user.school_id == null) {
    throw new ForbiddenException('School context required');
  }
  if (resourceSchoolId == null || String(resourceSchoolId) !== String(user.school_id)) {
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
  // Dates (and similar) are objects but must not be walked into — that yields `{}`.
  if (value instanceof Date) return value;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value;
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
