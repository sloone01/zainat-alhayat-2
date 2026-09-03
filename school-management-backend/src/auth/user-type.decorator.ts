import { SetMetadata } from '@nestjs/common';

export const USER_TYPES_KEY = 'user_types';

/** Require one of the given user_type values (staff | parent | student | platform). */
export const RequireUserType = (...types: Array<'staff' | 'parent' | 'student' | 'platform'>) =>
  SetMetadata(USER_TYPES_KEY, types);
