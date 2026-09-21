/**
 * Stale-build recovery (FIKR-260920-5281EC).
 *
 * Every deploy gives Vite chunks new hashed file names and the old files are
 * gone. A tab that was opened before the deploy still references the old names,
 * so the next lazy route/chunk load fails with
 * "Failed to fetch dynamically imported module". That is not an app bug — the
 * fix is to reload once so the browser picks up the new index.html.
 *
 * A sessionStorage timestamp guards against reload loops: if a reload already
 * happened recently and the chunk still fails, we let the normal error flow run.
 */

const RELOAD_KEY = 'fikr_stale_chunk_reload_at'
const RELOAD_GUARD_MS = 30_000

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Unable to preload CSS/i,
  /Loading chunk [\w-]+ failed/i,
  /Loading CSS chunk [\w-]+ failed/i,
]

export function isStaleChunkError(err: unknown): boolean {
  if (!err) return false
  const message =
    typeof err === 'string'
      ? err
      : String((err as { message?: unknown }).message ?? '')
  if (!message) return false
  return CHUNK_ERROR_PATTERNS.some((re) => re.test(message))
}

function readLastReload(): number {
  try {
    return Number(sessionStorage.getItem(RELOAD_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Reload the page to fetch the current build. Returns true when a reload was
 * triggered (caller should suppress error reporting), false when the loop guard
 * blocked it (caller should fall through to normal error handling).
 */
export function reloadForStaleChunk(targetPath?: string): boolean {
  if (typeof window === 'undefined') return false
  const now = Date.now()
  if (now - readLastReload() < RELOAD_GUARD_MS) return false
  try {
    sessionStorage.setItem(RELOAD_KEY, String(now))
  } catch {
    // Without storage we cannot guard against loops — do not reload.
    return false
  }
  if (targetPath && targetPath !== window.location.pathname + window.location.search + window.location.hash) {
    window.location.assign(targetPath)
  } else {
    window.location.reload()
  }
  return true
}

/** Handle an error if it is a stale-chunk failure. Returns true if handled. */
export function handleStaleChunkError(err: unknown, targetPath?: string): boolean {
  if (!isStaleChunkError(err)) return false
  return reloadForStaleChunk(targetPath)
}

/** Vite fires this when a preload of a lazy chunk (JS or CSS) fails. */
export function installStaleChunkRecovery(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('vite:preloadError', (event) => {
    const payload = (event as Event & { payload?: unknown }).payload
    if (reloadForStaleChunk()) {
      // Stop Vite from re-throwing into unhandledrejection while we reload.
      event.preventDefault()
    } else {
      console.error('[stale-chunk] reload guard active; not reloading again', payload)
    }
  })
}
