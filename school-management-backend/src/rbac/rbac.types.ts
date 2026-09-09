export type ClaimCode = string; // "pageKey:actionCode"

export function toClaim(pageKey: string, actionCode: string): ClaimCode {
  return `${pageKey}:${actionCode}`;
}

export function parseClaim(claim: ClaimCode): { pageKey: string; actionCode: string } {
  const i = claim.indexOf(':');
  if (i <= 0) return { pageKey: claim, actionCode: 'view' };
  return { pageKey: claim.slice(0, i), actionCode: claim.slice(i + 1) };
}

/** Normalize school scope: empty / undefined → null (system). */
export function normalizeSchoolId(schoolId?: string | null): string | null {
  if (schoolId == null || schoolId === '' || schoolId === '0') return null;
  return String(schoolId);
}
