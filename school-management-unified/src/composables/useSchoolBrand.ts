import { computed, ref } from 'vue'
import { getApiBaseUrl } from '@/config/public-config'
import { authService } from '@/services/auth.service'
import { schoolLandingService } from '@/services/school-landing.service'

/** Bundled logo, used until a school sets its own. */
const FALLBACK_LOGO = '/zlogo.jpeg'

const logoUrl = ref<string | null>(null)
const brandName = ref<string | null>(null)
let inFlight: Promise<void> | null = null

/** Stored logos may be absolute API paths (/api/files/...) rather than full URLs. */
function resolveAssetUrl(path: string) {
  if (/^(https?:|data:)/i.test(path)) return path
  const base = getApiBaseUrl().replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * The signed-in school's name and logo. The app shell used to hard-code one school's
 * branding, so every tenant saw it. Fetched once per session and shared.
 */
export function useSchoolBrand() {
  const storedName = () =>
    (authService.getStoredUser() as { school_name?: string } | null)?.school_name?.trim() || null

  const load = async () => {
    if (inFlight) return inFlight
    if (!authService.isAuthenticated()) return
    inFlight = (async () => {
      try {
        const data = await schoolLandingService.getAdmin()
        const logo = data.logo_url?.trim()
        logoUrl.value = logo ? resolveAssetUrl(logo) : null
        brandName.value = data.brand_name_ar?.trim() || data.school_name?.trim() || null
      } catch {
        // A school without a landing row simply keeps the fallback.
        logoUrl.value = null
      }
    })()
    return inFlight
  }

  return {
    load,
    logoSrc: computed(() => logoUrl.value || FALLBACK_LOGO),
    schoolName: computed(() => brandName.value || storedName() || ''),
  }
}

/** Clears the cached brand so the next sign-in does not inherit it. */
export function resetSchoolBrand() {
  logoUrl.value = null
  brandName.value = null
  inFlight = null
}
