import type { InternalAxiosRequestConfig } from 'axios'

/**
 * Counts API calls that start while a newly opened page is starting up
 * (route guards, setup, onMounted). The route loader stays up until that
 * burst goes quiet, so the screen is not shown empty and then filled.
 */

const QUIET_MS = 80
const MAX_WAIT_MS = 25000
const MARK = '__pageInitGen'

type MarkedConfig = InternalAxiosRequestConfig & { [MARK]?: number }

let generation = 0
let tracking = false
let seenMount = false
let inflight = 0
let quietTimer: ReturnType<typeof setTimeout> | null = null
let idleWaiter: (() => void) | null = null

export function currentPageInitGeneration(): number {
  return generation
}

/** Start a new init window. Drops any wait from the previous page. */
export function beginPageInitWindow() {
  generation += 1
  tracking = true
  seenMount = false
  inflight = 0
  if (quietTimer) {
    clearTimeout(quietTimer)
    quietTimer = null
  }
  if (idleWaiter) {
    const previous = idleWaiter
    idleWaiter = null
    previous()
  }
}

export function notePageInitRequest(config: InternalAxiosRequestConfig) {
  if (!tracking) return
  const marked = config as MarkedConfig
  if (marked[MARK] === generation) return
  marked[MARK] = generation
  inflight += 1
  if (quietTimer) {
    clearTimeout(quietTimer)
    quietTimer = null
  }
}

export function notePageInitSettled(config?: InternalAxiosRequestConfig | null) {
  if (!config) return
  const marked = config as MarkedConfig
  if (marked[MARK] !== generation) return
  delete marked[MARK]
  inflight = Math.max(0, inflight - 1)
  scheduleQuiet()
}

/** Call after the new page's setup and onMounted have run. */
export function markPageInitMounted() {
  if (!tracking) return
  seenMount = true
}

function scheduleQuiet() {
  if (!tracking || !seenMount || inflight > 0 || !idleWaiter) return
  if (quietTimer) clearTimeout(quietTimer)
  const gen = generation
  quietTimer = setTimeout(() => {
    quietTimer = null
    if (gen !== generation || !tracking || inflight > 0 || !idleWaiter) return
    tracking = false
    const done = idleWaiter
    idleWaiter = null
    done()
  }, QUIET_MS)
}

/** Resolves once startup requests have finished and nothing new started. */
export function waitForPageInitIdle(gen: number): Promise<void> {
  if (gen !== generation || !tracking) return Promise.resolve()
  return new Promise((resolve) => {
    const cap = setTimeout(() => {
      if (gen !== generation) return
      tracking = false
      if (quietTimer) {
        clearTimeout(quietTimer)
        quietTimer = null
      }
      idleWaiter = null
      resolve()
    }, MAX_WAIT_MS)
    idleWaiter = () => {
      clearTimeout(cap)
      resolve()
    }
    scheduleQuiet()
  })
}
