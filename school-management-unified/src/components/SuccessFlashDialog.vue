<template>
  <Teleport to="body">
    <Transition name="success-flash" appear @after-leave="emit('finished')">
      <div
        v-if="active"
        class="success-flash-root fixed inset-0 z-[100] flex items-center justify-center p-4"
        :dir="isRTL ? 'rtl' : 'ltr'"
        role="alertdialog"
        aria-live="polite"
        :aria-label="title || $t('common.success')"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" aria-hidden="true" />

        <div
          class="success-flash-panel relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-black/5"
        >
          <div class="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" aria-hidden="true" />
          <div class="pointer-events-none absolute -bottom-10 -start-6 h-28 w-28 rounded-full bg-teal-400/15 blur-2xl" aria-hidden="true" />

          <div class="relative px-6 pt-8 pb-6 text-center">
            <div class="success-flash-icon-wrap mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <span class="success-flash-ring absolute inset-0 rounded-full border-2 border-emerald-300/60" aria-hidden="true" />
              <span class="success-flash-ring success-flash-ring-delay absolute inset-0 rounded-full border-2 border-emerald-400/40" aria-hidden="true" />
              <span class="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <svg class="success-flash-check h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path class="success-flash-check-path" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>

            <h3 class="text-lg font-bold tracking-tight text-gray-900">
              {{ title || $t('common.success') }}
            </h3>
            <p v-if="message" class="mt-2 text-sm leading-relaxed text-gray-600">
              {{ message }}
            </p>
          </div>

          <div class="h-1 bg-gray-100">
            <div
              :key="progressKey"
              class="success-flash-progress h-full origin-left rtl:origin-right rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              :style="{ animationDuration: `${durationMs}ms` }"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    durationMs?: number
  }>(),
  {
    durationMs: 2000,
  },
)

const emit = defineEmits<{
  finished: []
}>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const active = ref(false)
const progressKey = ref(0)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function scheduleDismiss() {
  clearDismissTimer()
  dismissTimer = setTimeout(() => {
    active.value = false
  }, props.durationMs)
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      progressKey.value += 1
      active.value = true
      scheduleDismiss()
    } else if (!open && !active.value) {
      clearDismissTimer()
    }
  },
)

onUnmounted(clearDismissTimer)
</script>

<style scoped>
.success-flash-enter-active {
  transition: opacity 0.35s ease;
}
.success-flash-enter-active .success-flash-panel {
  animation: success-flash-panel-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.success-flash-leave-active {
  transition: opacity 0.3s ease;
}
.success-flash-leave-active .success-flash-panel {
  animation: success-flash-panel-out 0.3s ease both;
}
.success-flash-enter-from,
.success-flash-leave-to {
  opacity: 0;
}

@keyframes success-flash-panel-in {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(14px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes success-flash-panel-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.94) translateY(-8px);
  }
}

.success-flash-ring {
  animation: success-flash-pulse 1.6s ease-out infinite;
}
.success-flash-ring-delay {
  animation-delay: 0.35s;
}

@keyframes success-flash-pulse {
  0% {
    transform: scale(0.92);
    opacity: 0.85;
  }
  70% {
    transform: scale(1.35);
    opacity: 0;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

.success-flash-check-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: success-flash-draw 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
}

@keyframes success-flash-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.success-flash-progress {
  animation-name: success-flash-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes success-flash-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
