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
      :show="!!confirmState"
      elevate
      compact
      plain-footer
      :title="confirmState?.title || $t('common.confirm')"
      @close="resolveConfirm(false)"
    >
      <p class="text-sm leading-relaxed text-gray-600">
        {{ confirmState?.message }}
      </p>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="resolveConfirm(false)">
          {{ confirmState?.cancelLabel || $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn"
          :class="confirmState?.danger ? 'fk-btn--danger' : 'fk-btn--primary'"
          @click="resolveConfirm(true)"
        >
          {{ confirmState?.confirmLabel || $t('common.confirm') }}
        </button>
      </template>
    </FikrDialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
const { toasts, confirmState, dismissToast, resolveConfirm } = useFeedback()

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (systemErrorDialogOpen.value) {
    dismissSystemErrorOverlay()
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
