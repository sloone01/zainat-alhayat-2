import { ref } from 'vue'

export type FeedbackToastKind = 'success' | 'error'

export type FeedbackToast = {
  id: number
  kind: FeedbackToastKind
  title?: string
  message: string
}

export type FeedbackConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmState = FeedbackConfirmOptions & {
  resolve: (ok: boolean) => void
}

const TOAST_MS = 4200
const MAX_TOASTS = 3

const toasts = ref<FeedbackToast[]>([])
const confirmState = ref<ConfirmState | null>(null)

let nextId = 1
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>()

function dismissToast(id: number) {
  const timer = toastTimers.get(id)
  if (timer) clearTimeout(timer)
  toastTimers.delete(id)
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

function pushToast(kind: FeedbackToastKind, message: string, title?: string) {
  const id = nextId++
  const next = [...toasts.value, { id, kind, message, title }]
  toasts.value = next.slice(-MAX_TOASTS)
  toastTimers.set(
    id,
    setTimeout(() => dismissToast(id), TOAST_MS),
  )
}

function confirm(options: FeedbackConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (confirmState.value) confirmState.value.resolve(false)
    confirmState.value = { ...options, resolve }
  })
}

function resolveConfirm(ok: boolean) {
  const current = confirmState.value
  confirmState.value = null
  current?.resolve(ok)
}

/**
 * App-wide feedback: confirm as a modal, validation/success as mixin toasts.
 * Mount `<FikrFeedbackHost />` once (App.vue) so toasts survive route changes.
 */
export function useFeedback() {
  return {
    toasts,
    confirmState,
    success: (message: string, title?: string) => pushToast('success', message, title),
    error: (message: string, title?: string) => pushToast('error', message, title),
    confirm,
    dismissToast,
    resolveConfirm,
  }
}
