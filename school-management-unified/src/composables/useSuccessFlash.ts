import { ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'

export interface SuccessFlashOptions {
  title?: string
  message?: string
  /** How long the dialog stays visible before closing (ms). Default 2000. */
  durationMs?: number
  /** Navigate here after the exit animation completes. */
  redirectTo?: RouteLocationRaw
  /** Called after the exit animation completes (after redirect, if any). */
  onDone?: () => void
}

/**
 * Reusable success flash: show animated dialog → auto-dismiss → optional redirect.
 *
 * @example
 * const successFlash = useSuccessFlash()
 * // template: <SuccessFlashDialog v-bind="successFlash.bindings" @finished="successFlash.onFinished" />
 * successFlash.show({ redirectTo: '/settings/payments/packages' })
 */
export function useSuccessFlash() {
  const router = useRouter()
  const { t } = useI18n()

  const open = ref(false)
  const title = ref('')
  const message = ref('')
  const durationMs = ref(2000)

  let pendingRedirect: RouteLocationRaw | undefined
  let pendingOnDone: (() => void) | undefined

  function show(options: SuccessFlashOptions = {}) {
    title.value = options.title ?? t('common.success')
    message.value = options.message ?? t('common.savedSuccessfully')
    durationMs.value = options.durationMs ?? 2000
    pendingRedirect = options.redirectTo
    pendingOnDone = options.onDone
    open.value = true
  }

  function onFinished() {
    open.value = false
    const redirect = pendingRedirect
    const done = pendingOnDone
    pendingRedirect = undefined
    pendingOnDone = undefined
    if (redirect) void router.push(redirect)
    done?.()
  }

  return {
    open,
    title,
    message,
    durationMs,
    show,
    onFinished,
  }
}
