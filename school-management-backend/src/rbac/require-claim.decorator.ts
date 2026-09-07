import { SetMetadata } from '@nestjs/common';

export const CLAIM_KEY = 'rbac_claim';
export const CLAIM_ANY_KEY = 'rbac_claim_any';

export type RequiredClaim = { page: string; action: string };

/** Require a page+action claim (super admin always passes). */
export const RequireClaim = (page: string, action: string) =>
  SetMetadata(CLAIM_KEY, { page, action } satisfies RequiredClaim);

/** Pass if the user has any of the listed claims. Handler-level wins over class @RequireClaim. */
export const RequireAnyClaim = (...claims: RequiredClaim[]) =>
  SetMetadata(CLAIM_ANY_KEY, claims);
