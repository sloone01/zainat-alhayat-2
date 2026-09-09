import { ref } from 'vue'
import { rbacService } from '@/services/rbac.service'

/**
 * Effective claims for the signed-in user, fetched once per session.
 *
 * A school only gets the pages its subscription entitles it to, so a screen that calls an
 * endpoint for a module the school does not have gets a 403 and logs an error. Gate those
 * calls on `hasClaim()` instead of firing them and swallowing the failure.
 */
const claims = ref<Set<string> | null>(null)
const isPlatform = ref(false)
const schoolStatus = ref<string | null>(null)
/** route -> page key, so a nav link can be checked against the user's claims. */
const routeToPage = ref<Map<string, string>>(new Map())
let inFlight: Promise<void> | null = null

async function load(): Promise<void> {
  if (claims.value) return
  if (!inFlight) {
    inFlight = rbacService
      .getMyClaims()
      .then((res) => {
        claims.value = new Set(res.claims || [])
        isPlatform.value = Boolean(res.isSuperAdmin || res.isSystemUser)
        schoolStatus.value = res.schoolStatus ?? null
        routeToPage.value = new Map((res.pages || []).map((p) => [p.route, p.key]))
      })
      .catch((err) => {
        console.error('Error loading claims:', err)
        // Unknown claims: fail open so a claims outage does not blank every screen.
        claims.value = null
      })
      .finally(() => {
        inFlight = null
      })
  }
  await inFlight
}

/** Clear on logout so the next user does not inherit these. */
export function resetClaims(): void {
  claims.value = null
  isPlatform.value = false
  schoolStatus.value = null
  routeToPage.value = new Map()
  inFlight = null
}

export function useClaims() {
  const hasClaim = (page: string, action = 'view'): boolean => {
    if (isPlatform.value) return true
    // Not loaded (or the request failed): let the call through and let the API decide.
    if (!claims.value) return true
    return claims.value.has(`${page}:${action}`)
  }

  /**
   * Whether a nav route is usable. Routes with no page in the catalog are not
   * claim-gated (platform screens, sub-pages), so they stay visible.
   */
  const canOpenRoute = (route: string): boolean => {
    if (isPlatform.value) return true
    if (!claims.value || !routeToPage.value.size) return true
    // Longest-prefix match so a sub-route (/students/payments/pending-receipts) inherits
    // the gating of the page it belongs to (/students/payments).
    let key = routeToPage.value.get(route)
    if (!key) {
      let best = ''
      for (const [candidate, pageKey] of routeToPage.value) {
        if (route.startsWith(`${candidate}/`) && candidate.length > best.length) {
          best = candidate
          key = pageKey
        }
      }
    }
    if (!key) return true
    for (const claim of claims.value) {
      if (claim.startsWith(`${key}:`)) return true
    }
    return false
  }

  return { claims, isPlatform, schoolStatus, loadClaims: load, hasClaim, canOpenRoute }
}
