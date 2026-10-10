import { ref } from 'vue'
import { rbacService } from '@/services/rbac.service'
import { getSessionPersona } from '@/utils/auth-token'

/**
 * Effective claims for the signed-in user.
 * TTL matches backend `CLAIMS_TTL_MS` (45s) so group/override edits show up without logout.
 *
 * A school only gets the pages its subscription entitles it to, so a screen that calls an
 * endpoint for a module the school does not have gets a 403 and logs an error. Gate those
 * calls on `hasClaim()` instead of firing them and swallowing the failure.
 */
const CLAIMS_TTL_MS = 45_000
/** After a dropped request, wait before the next navigation tries again. */
const CLAIMS_RETRY_MS = 20_000

const claims = ref<Set<string> | null>(null)
const isPlatform = ref(false)
const schoolStatus = ref<string | null>(null)
/** route -> page key, so a nav link can be checked against the user's claims. */
const routeToPage = ref<Map<string, string>>(new Map())
let loadedAt = 0
let backoffUntil = 0
let inFlight: Promise<void> | null = null

function isFresh(): boolean {
  if (Date.now() < backoffUntil) return true
  return claims.value != null && Date.now() - loadedAt < CLAIMS_TTL_MS
}

async function load(force = false): Promise<void> {
  if (!force && isFresh()) return
  if (!force && inFlight) {
    await inFlight
    return
  }
  if (force) {
    loadedAt = 0
    backoffUntil = 0
  }
  if (!inFlight) {
    const snapshot = claims.value
    inFlight = rbacService
      .getMyClaims()
      .then((res) => {
        claims.value = new Set(res.claims || [])
        isPlatform.value = Boolean(res.isSuperAdmin || res.isSystemUser)
        schoolStatus.value = res.schoolStatus ?? null
        routeToPage.value = new Map((res.pages || []).map((p) => [p.route, p.key]))
        loadedAt = Date.now()
        backoffUntil = 0
      })
      .catch((err: { response?: { status?: number } }) => {
        console.error('Error loading claims:', err)
        const status = err?.response?.status
        // 4xx = this session cannot use school claims (wrong persona / no school).
        // Fail closed so the full staff menu does not stay on screen.
        if (status === 400 || status === 403 || status === 401) {
          claims.value = new Set()
          isPlatform.value = getSessionPersona() === 'platform'
          loadedAt = Date.now()
          backoffUntil = 0
          return
        }
        // Network / 5xx: keep the last claims and wait before the next try.
        claims.value = snapshot
        backoffUntil = Date.now() + CLAIMS_RETRY_MS
      })
      .finally(() => {
        inFlight = null
      })
  }
  await inFlight
}

/** Clear on logout / school switch so the next session does not inherit these. */
export function resetClaims(): void {
  claims.value = null
  isPlatform.value = false
  schoolStatus.value = null
  routeToPage.value = new Map()
  loadedAt = 0
  backoffUntil = 0
  inFlight = null
}

function pageKeyForRoute(route: string): string | undefined {
  let key = routeToPage.value.get(route)
  if (key) return key
  let best = ''
  for (const [candidate, pageKey] of routeToPage.value) {
    if (route.startsWith(`${candidate}/`) && candidate.length > best.length) {
      best = candidate
      key = pageKey
    }
  }
  return key
}

export function useClaims() {
  const hasClaim = (page: string, action = 'view'): boolean => {
    if (isPlatform.value) return true
    // Not loaded (or the request failed): let the call through and let the API decide.
    if (!claims.value) return true
    return claims.value.has(`${page}:${action}`)
  }

  /**
   * Whether a nav/router path is usable. Routes with no page in the catalog are not
   * claim-gated (sub-pages, account shell), so they stay visible.
   */
  const canOpenRoute = (route: string): boolean => {
    if (isPlatform.value) return true
    if (!claims.value || !routeToPage.value.size) return true
    const key = pageKeyForRoute(route)
    if (!key) return true
    if (claims.value.size === 0) return false
    for (const claim of claims.value) {
      if (claim.startsWith(`${key}:`)) return true
    }
    return false
  }

  return {
    claims,
    isPlatform,
    schoolStatus,
    loadClaims: (force = false) => load(force),
    reloadClaims: () => load(true),
    hasClaim,
    canOpenRoute,
  }
}
