/** Oman governorates and their wilayats (11 governorates, 63 wilayats). Villages are free text. */
export interface OmanWilayat {
  ar: string
  en: string
}

export interface OmanGovernorate {
  ar: string
  en: string
  wilayats: OmanWilayat[]
}

export const OMAN_GOVERNORATES: OmanGovernorate[] = [
  {
    ar: 'مسقط',
    en: 'Muscat',
    wilayats: [
      { ar: 'مسقط', en: 'Muscat' },
      { ar: 'مطرح', en: 'Muttrah' },
      { ar: 'بوشر', en: 'Bawshar' },
      { ar: 'السيب', en: 'As Seeb' },
      { ar: 'العامرات', en: 'Al Amerat' },
      { ar: 'قريات', en: 'Quriyat' },
    ],
  },
  {
    ar: 'ظفار',
    en: 'Dhofar',
    wilayats: [
      { ar: 'صلالة', en: 'Salalah' },
      { ar: 'طاقة', en: 'Taqah' },
      { ar: 'مرباط', en: 'Mirbat' },
      { ar: 'سدح', en: 'Sadah' },
      { ar: 'شليم وجزر الحلانيات', en: 'Shalim and the Hallaniyat Islands' },
      { ar: 'المزيونة', en: 'Al Mazyunah' },
      { ar: 'مقشن', en: 'Muqshin' },
      { ar: 'رخيوت', en: 'Rakhyut' },
      { ar: 'ثمريت', en: 'Thumrait' },
      { ar: 'ضلكوت', en: 'Dhalkut' },
    ],
  },
  {
    ar: 'مسندم',
    en: 'Musandam',
    wilayats: [
      { ar: 'خصب', en: 'Khasab' },
      { ar: 'بخا', en: 'Bukha' },
      { ar: 'دبا', en: 'Dibba' },
      { ar: 'مدحاء', en: 'Madha' },
    ],
  },
  {
    ar: 'البريمي',
    en: 'Al Buraimi',
    wilayats: [
      { ar: 'البريمي', en: 'Al Buraimi' },
      { ar: 'محضة', en: 'Mahdah' },
      { ar: 'السنينة', en: 'As Sunaynah' },
    ],
  },
  {
    ar: 'الداخلية',
    en: 'Ad Dakhiliyah',
    wilayats: [
      { ar: 'نزوى', en: 'Nizwa' },
      { ar: 'سمائل', en: 'Samail' },
      { ar: 'بهلاء', en: 'Bahla' },
      { ar: 'أدم', en: 'Adam' },
      { ar: 'الحمراء', en: 'Al Hamra' },
      { ar: 'منح', en: 'Manah' },
      { ar: 'إزكي', en: 'Izki' },
      { ar: 'بدبد', en: 'Bidbid' },
      { ar: 'الجبل الأخضر', en: 'Al Jabal Al Akhdar' },
    ],
  },
  {
    ar: 'شمال الباطنة',
    en: 'Al Batinah North',
    wilayats: [
      { ar: 'صحار', en: 'Sohar' },
      { ar: 'شناص', en: 'Shinas' },
      { ar: 'لوى', en: 'Liwa' },
      { ar: 'صحم', en: 'Saham' },
      { ar: 'الخابورة', en: 'Al Khaburah' },
      { ar: 'السويق', en: 'As Suwayq' },
    ],
  },
  {
    ar: 'جنوب الباطنة',
    en: 'Al Batinah South',
    wilayats: [
      { ar: 'الرستاق', en: 'Rustaq' },
      { ar: 'العوابي', en: 'Al Awabi' },
      { ar: 'نخل', en: 'Nakhal' },
      { ar: 'وادي المعاول', en: 'Wadi Al Maawil' },
      { ar: 'بركاء', en: 'Barka' },
      { ar: 'المصنعة', en: 'Al Musannah' },
    ],
  },
  {
    ar: 'الوسطى',
    en: 'Al Wusta',
    wilayats: [
      { ar: 'هيما', en: 'Haima' },
      { ar: 'محوت', en: 'Mahout' },
      { ar: 'الدقم', en: 'Duqm' },
      { ar: 'الجازر', en: 'Al Jazer' },
    ],
  },
  {
    ar: 'شمال الشرقية',
    en: 'Ash Sharqiyah North',
    wilayats: [
      { ar: 'إبرا', en: 'Ibra' },
      { ar: 'المضيبي', en: 'Al Mudhaibi' },
      { ar: 'بدية', en: 'Bidiyah' },
      { ar: 'القابل', en: 'Al Qabil' },
      { ar: 'وادي بني خالد', en: 'Wadi Bani Khalid' },
      { ar: 'دماء والطائيين', en: 'Dima Wa At Taiyyin' },
      { ar: 'سناو', en: 'Sinaw' },
    ],
  },
  {
    ar: 'جنوب الشرقية',
    en: 'Ash Sharqiyah South',
    wilayats: [
      { ar: 'صور', en: 'Sur' },
      { ar: 'الكامل والوافي', en: 'Al Kamil Wal Wafi' },
      { ar: 'جعلان بني بوحسن', en: 'Jalan Bani Bu Hassan' },
      { ar: 'جعلان بني بوعلي', en: 'Jalan Bani Bu Ali' },
      { ar: 'مصيرة', en: 'Masirah' },
    ],
  },
  {
    ar: 'الظاهرة',
    en: 'Ad Dhahirah',
    wilayats: [
      { ar: 'عبري', en: 'Ibri' },
      { ar: 'ينقل', en: 'Yanqul' },
      { ar: 'ضنك', en: 'Dhank' },
    ],
  },
]

export function governorateLabel(g: { ar: string; en: string }, locale: string): string {
  return locale === 'ar' ? g.ar : g.en
}

/** Wilayats of a governorate given its stored (Arabic) name; empty when unknown. */
export function wilayatsOf(governorateAr: string | null | undefined): OmanWilayat[] {
  return OMAN_GOVERNORATES.find((g) => g.ar === governorateAr)?.wilayats ?? []
}
