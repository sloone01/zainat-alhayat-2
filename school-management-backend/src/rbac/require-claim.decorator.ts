import { SetMetadata } from '@nestjs/common';

export const CLAIM_KEY = 'rbac_claim';

export type RequiredClaim = { page: string; action: string };

/** Require a page+action claim (super admin always passes). */
export const RequireClaim = (page: string, action: string) =>
  SetMetadata(CLAIM_KEY, { page, action } satisfies RequiredClaim);
