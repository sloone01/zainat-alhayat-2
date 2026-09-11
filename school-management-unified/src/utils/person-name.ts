export type BilingualPersonName = {
  firstName?: string | null;
  lastName?: string | null;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
};

export function personFirstName(person: BilingualPersonName | null | undefined, locale: string): string {
  if (!person) return ''
  if (locale === 'ar') {
    return (person.first_name_ar || person.firstName || person.first_name_en || '').trim()
  }
  return (person.first_name_en || person.firstName || person.first_name_ar || '').trim()
}

export function personLastName(person: BilingualPersonName | null | undefined, locale: string): string {
  if (!person) return ''
  if (locale === 'ar') {
    return (person.last_name_ar || person.lastName || person.last_name_en || '').trim()
  }
  return (person.last_name_en || person.lastName || person.last_name_ar || '').trim()
}

export function personFullName(person: BilingualPersonName | null | undefined, locale: string): string {
  return `${personFirstName(person, locale)} ${personLastName(person, locale)}`.trim()
}
