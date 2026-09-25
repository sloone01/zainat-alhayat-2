import { nextTick, ref } from 'vue'
import {
  isNavigationFailure,
  NavigationFailureType,
  type Router,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'
import {
  beginPageInitWindow,
  currentPageInitGeneration,
  markPageInitMounted,
  waitForPageInitIdle,
} from '@/router/page-init'

/** Visible until the opened page's startup API calls have finished. */
export const routePageLoading = ref(false)

let pendingPageNav = false

function isPageChange(to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded): boolean {
  if (!from.matched.length) return true
  return to.path !== from.path
}

function clearLoader() {
  pendingPageNav = false
  routePageLoading.value = false
}

/** Register before other guards so the loader covers auth and claim checks. */
export function installRoutePageLoading(router: Router) {
  router.beforeEach((to, from) => {
    if (!isPageChange(to, from)) return
    pendingPageNav = true
    routePageLoading.value = true
    beginPageInitWindow()
  })

  router.afterEach((_to, _from, failure) => {
    if (!pendingPageNav) return
    if (isNavigationFailure(failure, NavigationFailureType.cancelled)) return
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) return
    const gen = currentPageInitGeneration()
    void (async () => {
      // Let the new view render and start its onMounted requests before the quiet wait.
      await nextTick()
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (gen !== currentPageInitGeneration()) return
      markPageInitMounted()
      await waitForPageInitIdle(gen)
      if (gen !== currentPageInitGeneration() || !pendingPageNav) return
      clearLoader()
    })()
  })

  router.onError(() => {
    clearLoader()
  })
}
