/** Nationality options. `en` is the stored value (existing records use English demonyms such as "Omani"). */
export interface Nationality {
  en: string
  ar: string
}

export const NATIONALITIES: Nationality[] = [
  { en: 'Omani', ar: 'عماني' },
  { en: 'Emirati', ar: 'إماراتي' },
  { en: 'Saudi', ar: 'سعودي' },
  { en: 'Kuwaiti', ar: 'كويتي' },
  { en: 'Qatari', ar: 'قطري' },
  { en: 'Bahraini', ar: 'بحريني' },
  { en: 'Yemeni', ar: 'يمني' },
  { en: 'Egyptian', ar: 'مصري' },
  { en: 'Jordanian', ar: 'أردني' },
  { en: 'Lebanese', ar: 'لبناني' },
  { en: 'Syrian', ar: 'سوري' },
  { en: 'Iraqi', ar: 'عراقي' },
  { en: 'Palestinian', ar: 'فلسطيني' },
  { en: 'Sudanese', ar: 'سوداني' },
  { en: 'Libyan', ar: 'ليبي' },
  { en: 'Tunisian', ar: 'تونسي' },
  { en: 'Algerian', ar: 'جزائري' },
  { en: 'Moroccan', ar: 'مغربي' },
  { en: 'Somali', ar: 'صومالي' },
  { en: 'Mauritanian', ar: 'موريتاني' },
  { en: 'Indian', ar: 'هندي' },
  { en: 'Pakistani', ar: 'باكستاني' },
  { en: 'Bangladeshi', ar: 'بنغلاديشي' },
  { en: 'Sri Lankan', ar: 'سريلانكي' },
  { en: 'Filipino', ar: 'فلبيني' },
  { en: 'Indonesian', ar: 'إندونيسي' },
  { en: 'Iranian', ar: 'إيراني' },
  { en: 'Turkish', ar: 'تركي' },
  { en: 'Afghan', ar: 'أفغاني' },
  { en: 'Nepali', ar: 'نيبالي' },
  { en: 'Ethiopian', ar: 'إثيوبي' },
  { en: 'Eritrean', ar: 'إريتري' },
  { en: 'Kenyan', ar: 'كيني' },
  { en: 'Nigerian', ar: 'نيجيري' },
  { en: 'British', ar: 'بريطاني' },
  { en: 'American', ar: 'أمريكي' },
  { en: 'Canadian', ar: 'كندي' },
  { en: 'French', ar: 'فرنسي' },
  { en: 'German', ar: 'ألماني' },
  { en: 'Other', ar: 'أخرى' },
]

/** Label for a stored value in the current locale (unknown values are shown as saved). */
export function nationalityLabel(stored: string | null | undefined, locale: string): string {
  const v = String(stored ?? '').trim()
  if (!v) return ''
  const hit = NATIONALITIES.find((n) => n.en.toLowerCase() === v.toLowerCase() || n.ar === v)
  return hit ? (locale === 'ar' ? hit.ar : hit.en) : v
}

/** Normalise a saved value so it matches one of the options (e.g. "عماني" -> "Omani"). */
export function normaliseNationality(stored: string | null | undefined): string {
  const v = String(stored ?? '').trim()
  const hit = NATIONALITIES.find((n) => n.en.toLowerCase() === v.toLowerCase() || n.ar === v)
  return hit ? hit.en : v
}
