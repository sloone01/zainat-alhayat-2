export type BilingualNameFields = {
  firstName?: string;
  lastName?: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
};

function trimToNull(value?: string | null): string | null {
  const next = (value ?? '').trim();
  return next ? next : null;
}

export function normalizeCivilId(value?: string | null): string | null {
  const next = (value ?? '').replace(/\s+/g, '').trim();
  return next ? next : null;
}

export function normalizeEmail(value?: string | null): string | null {
  const next = (value ?? '').trim().toLowerCase();
  return next ? next : null;
}

export function normalizePhone(value?: string | null): string | null {
  const next = (value ?? '').replace(/[\s()-]/g, '').trim();
  return next ? next : null;
}

export function hasCompleteBilingualName(input: {
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
}): boolean {
  return Boolean(
    trimToNull(input.first_name_ar) &&
      trimToNull(input.first_name_en) &&
      trimToNull(input.last_name_ar) &&
      trimToNull(input.last_name_en),
  );
}
export function applyBilingualName(
  input: {
    firstName?: string;
    lastName?: string;
    first_name_ar?: string | null;
    first_name_en?: string | null;
    last_name_ar?: string | null;
    last_name_en?: string | null;
  },
): Required<Pick<BilingualNameFields, 'firstName' | 'lastName'>> & {
  first_name_ar: string | null;
  first_name_en: string | null;
  last_name_ar: string | null;
  last_name_en: string | null;
} {
  const firstAr = trimToNull(input.first_name_ar);
  const firstEn = trimToNull(input.first_name_en);
  const lastAr = trimToNull(input.last_name_ar);
  const lastEn = trimToNull(input.last_name_en);
  const firstLegacy = trimToNull(input.firstName);
  const lastLegacy = trimToNull(input.lastName);

  const first_name_ar = firstAr || firstLegacy;
  const first_name_en = firstEn || firstLegacy;
  const last_name_ar = lastAr || lastLegacy;
  const last_name_en = lastEn || lastLegacy;

  return {
    first_name_ar,
    first_name_en,
    last_name_ar,
    last_name_en,
    firstName: first_name_ar || first_name_en || '',
    lastName: last_name_ar || last_name_en || '',
  };
}
