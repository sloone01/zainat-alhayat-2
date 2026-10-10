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

/** Short student label: first + second + family (never third). */
export type StudentDisplayNameParts = {
  firstName?: string | null;
  secondName?: string | null;
  lastName?: string | null;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  secondNameEn?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
};

function pickNamePart(
  preferAr: boolean,
  ar?: string | null,
  en?: string | null,
  legacy?: string | null,
): string {
  const a = trimToNull(ar) ?? '';
  const e = trimToNull(en) ?? '';
  const l = trimToNull(legacy) ?? '';
  if (preferAr) return a || e || l;
  return e || a || l;
}

export function formatStudentDisplayName(
  student: StudentDisplayNameParts | null | undefined,
  locale: string = 'ar',
): string {
  if (!student) return '';
  const preferAr = !String(locale).toLowerCase().startsWith('en');
  const first = pickNamePart(
    preferAr,
    student.first_name_ar,
    student.first_name_en,
    student.firstName,
  );
  const second = pickNamePart(preferAr, student.secondName, student.secondNameEn, null);
  const family = pickNamePart(
    preferAr,
    student.last_name_ar,
    student.last_name_en,
    student.lastName,
  );
  return [first, second, family].filter(Boolean).join(' ');
}
