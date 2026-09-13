import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '@/i18n'
import { getApiBaseUrl } from '@/config/public-config'
import { authService } from '@/services/auth.service'
import { schoolLandingService } from '@/services/school-landing.service'

/** Platform product mark (super admin / system users). */
export const PLATFORM_LOGO = '/fikr-logo.png?v=5'

/** Bundled school fallback until a tenant sets its own logo. */
const SCHOOL_FALLBACK_LOGO = '/zlogo.jpeg'

const logoUrl = ref<string | null>(null)
const brandName = ref<string | null>(null)
const brandNameEn = ref<string | null>(null)
const brandNameAr = ref<string | null>(null)
let inFlight: Promise<void> | null = null
let chromeWatchBound = false

type BrandUser = {
  school_name?: string
  role?: string
  user_type?: string
  isSuperAdmin?: boolean
  isSystemUser?: boolean
} | null

function isPlatformActor(user: BrandUser = authService.getStoredUser() as BrandUser) {
  if (!user) return false
  if (user.role === 'parent' || user.user_type === 'parent') return false
  if (user.role === 'student' || user.user_type === 'student') return false
  return !!(user.isSuperAdmin || user.isSystemUser || user.user_type === 'platform')
}

function isParentActor(user: BrandUser = authService.getStoredUser() as BrandUser) {
  return !!(user?.role === 'parent' || user?.user_type === 'parent')
}

function currentLocale() {
  return String(i18n.global.locale.value || 'ar')
}

function tGlobal(key: string) {
  return String(i18n.global.t(key))
}

/** Stored logos may be absolute API paths (/api/files/...) rather than full URLs. */
function resolveAssetUrl(path: string) {
  if (/^(https?:|data:)/i.test(path)) return path
  const base = getApiBaseUrl().replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

function setFavicon(href: string) {
  const type = href.includes('.png')
    ? 'image/png'
    : href.includes('.svg')
      ? 'image/svg+xml'
      : 'image/jpeg'
  for (const rel of ['icon', 'shortcut icon', 'apple-touch-icon'] as const) {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = rel
      document.head.appendChild(link)
    }
    link.href = href
    if (rel === 'icon' || rel === 'shortcut icon') link.type = type
  }
}

function resolveLogoSrc() {
  if (isPlatformActor()) return PLATFORM_LOGO
  return logoUrl.value || SCHOOL_FALLBACK_LOGO
}

function resolveDisplayName() {
  if (isPlatformActor()) {
    return currentLocale() === 'ar' ? tGlobal('forSchools.brandAr') : tGlobal('forSchools.brand')
  }
  const stored =
    (authService.getStoredUser() as BrandUser)?.school_name?.trim() || null
  if (currentLocale() === 'ar') {
    return brandNameAr.value || brandName.value || brandNameEn.value || stored || ''
  }
  return brandNameEn.value || brandName.value || brandNameAr.value || stored || ''
}

function resolveDocumentTitle() {
  if (isPlatformActor()) {
    return currentLocale() === 'ar'
      ? 'فكر — منصة المدارس الذكية'
      : 'FIKR — Smart School Platform'
  }
  const name = resolveDisplayName().trim()
  if (name) {
    return currentLocale() === 'ar'
      ? `${name} — نظام إدارة المدرسة`
      : `${name} — School Management`
  }
  return currentLocale() === 'ar'
    ? 'فكر — منصة المدارس الذكية'
    : 'FIKR — Smart School Platform'
}

export function applyBrowserChrome() {
  if (typeof document === 'undefined') return
  document.title = resolveDocumentTitle()
  setFavicon(resolveLogoSrc())
}

function ensureChromeWatch() {
  if (chromeWatchBound) return
  chromeWatchBound = true
  watch(
    () => [currentLocale(), logoUrl.value, brandName.value, brandNameEn.value, brandNameAr.value],
    () => {
      if (authService.isAuthenticated()) applyBrowserChrome()
    },
  )
}

/**
 * Signed-in brand for the app shell: FIKR for platform actors, school CMS brand
 * (or fallback) for tenant staff. Also drives browser tab title + favicon.
 */
export function useSchoolBrand() {
  const { locale, t } = useI18n()
  ensureChromeWatch()

  const storedName = () =>
    (authService.getStoredUser() as BrandUser)?.school_name?.trim() || null

  const platform = computed(() => isPlatformActor())

  const logoSrc = computed(() => resolveLogoSrc())

  const schoolName = computed(() => {
    if (platform.value) {
      return locale.value === 'ar' ? t('forSchools.brandAr') : t('forSchools.brand')
    }
    if (locale.value === 'ar') {
      return brandNameAr.value || brandName.value || brandNameEn.value || storedName() || ''
    }
    return brandNameEn.value || brandName.value || brandNameAr.value || storedName() || ''
  })

  const logoAlt = computed(() =>
    platform.value ? t('forSchools.logoAlt') : schoolName.value || t('forSchools.logoAlt'),
  )

  const subtitleKey = computed(() =>
    platform.value ? 'dashboard.platformManagement' : 'dashboard.schoolManagement',
  )

  const documentTitle = computed(() => resolveDocumentTitle())

  const load = async (force = false) => {
    if (!authService.isAuthenticated()) return
    if (force) {
      inFlight = null
    }
    if (inFlight) return inFlight

    if (isPlatformActor()) {
      logoUrl.value = null
      brandName.value = null
      brandNameEn.value = null
      brandNameAr.value = null
      applyBrowserChrome()
      return
    }

    // Parents are school-less; chrome uses stored school_name / fallback (no CMS admin API).
    if (isParentActor()) {
      logoUrl.value = null
      brandName.value = null
      brandNameEn.value = null
      brandNameAr.value = null
      applyBrowserChrome()
      return
    }

    inFlight = (async () => {
      try {
        const data = await schoolLandingService.getAdmin()
        const logo = data.logo_url?.trim()
        logoUrl.value = logo ? resolveAssetUrl(logo) : null
        brandNameAr.value = data.brand_name_ar?.trim() || null
        brandNameEn.value = data.brand_name_en?.trim() || null
        brandName.value = brandNameAr.value || brandNameEn.value || null
      } catch {
        // A school without a landing row simply keeps the fallback.
        logoUrl.value = null
      } finally {
        applyBrowserChrome()
      }
    })()
    return inFlight
  }

  return {
    load,
    applyBrowserChrome,
    logoSrc,
    logoAlt,
    schoolName,
    subtitleKey,
    isPlatformBrand: platform,
    documentTitle,
  }
}

/** Clears the cached brand so the next sign-in does not inherit it. */
export function resetSchoolBrand() {
  logoUrl.value = null
  brandName.value = null
  brandNameEn.value = null
  brandNameAr.value = null
  inFlight = null
}
