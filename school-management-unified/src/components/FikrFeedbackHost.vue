<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4"
      :dir="isRTL ? 'rtl' : 'ltr'"
      role="region"
      :aria-label="$t('common.feedbackToasts')"
    >
      <TransitionGroup name="fk-feedback-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg shadow-navy-950/10 ring-1 ring-black/5"
          :class="
            toast.kind === 'success'
              ? 'border-emerald-200/80'
              : 'border-red-200/80'
          "
          :role="toast.kind === 'error' ? 'alert' : 'status'"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            :class="
              toast.kind === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            "
            aria-hidden="true"
          >
            <svg v-if="toast.kind === 'success'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <p v-if="toast.title" class="text-sm font-semibold text-gray-900">{{ toast.title }}</p>
            <p class="text-sm leading-relaxed text-gray-600" :class="toast.title ? 'mt-0.5' : ''">
              {{ toast.message }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            :aria-label="$t('common.close')"
            @click="dismissToast(toast.id)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <div
      v-if="systemErrorDialogOpen && systemErrorTicket"
      class="fk-modal !z-[85]"
      role="dialog"
      aria-modal="true"
      :aria-label="systemErrorTicket"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <div class="fk-modal__backdrop" @click="dismissSystemErrorOverlay" />
      <div class="fk-modal__panel fk-modal__panel--compact mx-auto my-[30vh] w-[min(100%-2rem,20rem)]">
        <div class="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
          <p class="min-w-0 break-all font-mono text-lg font-bold leading-snug tracking-[0.04em] text-navy-800" dir="ltr">
            {{ systemErrorTicket }}
          </p>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="dismissSystemErrorOverlay"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <FikrDialog
      :show="!!savedDialog"
      elevate
      compact
      plain-footer
      :title="savedDialog?.title || $t('common.success')"
      @close="dismissSaved"
    >
      <div class="flex flex-col items-center gap-3 py-2 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p class="text-sm leading-relaxed text-gray-600" role="status">{{ savedDialog?.message }}</p>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--primary" @click="dismissSaved">
          {{ $t('common.close') }}
        </button>
      </template>
    </FikrDialog>

    <FikrDialog
      :show="!!alertDialog"
      elevate
      compact
      plain-footer
      :title="alertDialog?.title || $t('common.error')"
      @close="dismissAlert"
    >
      <div class="flex items-start gap-3 py-1">
        <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </span>
        <p class="text-sm leading-relaxed text-gray-700">{{ alertDialog?.message }}</p>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--primary" @click="dismissAlert">
          {{ $t('common.ok') }}
        </button>
      </template>
    </FikrDialog>

    <div
      v-if="confirmState"
      class="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="confirmTitleId"
      :aria-describedby="confirmBodyId"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <div class="absolute inset-0 bg-[#0A2147]/45 backdrop-blur-[2px]" @click="resolveConfirm(false)" />
      <div class="relative w-full max-w-[400px] rounded-2xl bg-white px-6 pb-6 pt-8 text-center shadow-xl">
        <button
          type="button"
          class="absolute end-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          :aria-label="$t('common.close')"
          @click="resolveConfirm(false)"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div
          class="mx-auto flex size-12 items-center justify-center rounded-xl"
          :class="confirmState.danger ? 'bg-red-100 text-red-600' : 'bg-[#0A2147]/10 text-[#0A2147]'"
          aria-hidden="true"
        >
          <svg v-if="confirmState.danger" class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
          </svg>
          <svg v-else class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke-width="2" />
            <path stroke-linecap="round" stroke-width="2" d="M12 8h.01M11 12h1v4h1" />
          </svg>
        </div>
        <h2 :id="confirmTitleId" class="mt-4 text-base font-semibold text-gray-900">
          {{ confirmState.title || (confirmState.danger ? $t('common.delete') : $t('common.confirm')) }}
        </h2>
        <p :id="confirmBodyId" class="mt-2 text-sm leading-relaxed text-gray-500">
          {{ confirmState.message }}
        </p>
        <div class="mt-6 flex items-center justify-center gap-2">
          <button
            ref="confirmCancelBtn"
            type="button"
            class="inline-flex min-w-[7rem] items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            @click="resolveConfirm(false)"
          >
            {{ confirmState.cancelLabel || $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="inline-flex min-w-[7rem] items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
            :class="confirmState.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0A2147] hover:bg-[#081a38]'"
            @click="resolveConfirm(true)"
          >
            {{ confirmState.confirmLabel || (confirmState.danger ? $t('common.delete') : $t('common.confirm')) }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrDialog from '@/components/FikrDialog.vue'
import { useFeedback } from '@/composables/useFeedback'
import {
  dismissSystemErrorOverlay,
  systemErrorDialogOpen,
  systemErrorTicket,
} from '@/utils/error-pages'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { toasts, confirmState, savedDialog, alertDialog, dismissToast, dismissSaved, dismissAlert, resolveConfirm } = useFeedback()
const confirmCancelBtn = ref<HTMLButtonElement | null>(null)
const confirmTitleId = 'fk-confirm-title'
const confirmBodyId = 'fk-confirm-body'

watch(confirmState, async (state) => {
  if (!state) return
  await nextTick()
  confirmCancelBtn.value?.focus()
})

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (systemErrorDialogOpen.value) {
    dismissSystemErrorOverlay()
    return
  }
  if (savedDialog.value) {
    dismissSaved()
    return
  }
  if (alertDialog.value) {
    dismissAlert()
    return
  }
  if (confirmState.value) {
    resolveConfirm(false)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.fk-feedback-toast-enter-active,
.fk-feedback-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fk-feedback-toast-enter-from,
.fk-feedback-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fk-feedback-toast-move {
  transition: transform 0.22s ease;
}
</style>
