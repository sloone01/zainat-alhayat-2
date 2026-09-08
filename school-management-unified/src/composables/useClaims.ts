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
let inFlight: Promise<void> | null = null

async function load(): Promise<void> {
  if (claims.value) return
  if (!inFlight) {
    inFlight = rbacService
      .getMyClaims()
      .then((res) => {
        claims.value = new Set(res.claims || [])
        isPlatform.value = Boolean(res.isSuperAdmin || res.isSystemUser)
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
  inFlight = null
}

export function useClaims() {
  const hasClaim = (page: string, action = 'view'): boolean => {
    if (isPlatform.value) return true
    // Not loaded (or the request failed): let the call through and let the API decide.
    if (!claims.value) return true
    return claims.value.has(`${page}:${action}`)
  }

  return { claims, isPlatform, loadClaims: load, hasClaim }
}
