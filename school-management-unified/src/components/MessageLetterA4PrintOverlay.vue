<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="ml-print-root"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('messageLetters.printAction')"
    >
      <div class="ml-print-chrome" :dir="isUiRtl ? 'rtl' : 'ltr'">
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('messageLetters.printBack')"
            @click="emit('update:open', false)"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="truncate text-sm font-semibold text-gray-900">{{ $t('messageLetters.printAction') }}</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
            role="tablist"
            :aria-label="$t('notificationTemplates.localeTabsAria')"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="letterLocale === 'en'"
              class="rounded-md px-3 py-1.5 text-xs font-semibold"
              :class="letterLocale === 'en' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
              @click="emit('update:letterLocale', 'en')"
            >
              {{ $t('notificationTemplates.langEn') }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="letterLocale === 'ar'"
              class="rounded-md px-3 py-1.5 text-xs font-semibold"
              :class="letterLocale === 'ar' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
              @click="emit('update:letterLocale', 'ar')"
            >
              {{ $t('notificationTemplates.langAr') }}
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="loading || !srcdoc"
            @click="printPage"
          >
            {{ $t('messageLetters.printAction') }}
          </button>
        </div>
      </div>

      <div class="ml-print-canvas">
        <div v-if="loading" class="flex min-h-[12rem] items-center justify-center text-gray-500">
          <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden="true" />
        </div>
        <article v-else class="ml-a4">
          <iframe
            ref="frameRef"
            class="ml-a4-frame"
            title="message-letter-print"
            sandbox="allow-same-origin allow-modals"
            :srcdoc="srcdoc"
            @load="syncFrameHeight"
          />
        </article>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
  letterLocale: 'en' | 'ar'
  srcdoc: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:letterLocale': [value: 'en' | 'ar']
}>()

const { locale } = useI18n()
const isUiRtl = computed(() => locale.value === 'ar')
const frameRef = ref<HTMLIFrameElement | null>(null)

function syncFrameHeight() {
  const iframe = frameRef.value
  if (!iframe) return
  try {
    const doc = iframe.contentDocument
    const height = Math.max(doc?.documentElement?.scrollHeight ?? 0, doc?.body?.scrollHeight ?? 0, 0)
    const min = Math.round((297 / 25.4) * 96)
    iframe.style.height = `${Math.max(height, min)}px`
  } catch {
    iframe.style.height = '297mm'
  }
}

function printPage() {
  const win = frameRef.value?.contentWindow
  if (win) {
    win.focus()
    win.print()
    return
  }
  window.print()
}

watch(
  () => props.open,
  (on) => {
    if (typeof document === 'undefined') return
    document.body.classList.toggle('ml-print-open', on)
  },
)

watch(
  () => props.srcdoc,
  () => {
    requestAnimationFrame(() => syncFrameHeight())
  },
)

onUnmounted(() => {
  document.body.classList.remove('ml-print-open')
})
</script>

<style>
.ml-print-root {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  background: #e8eaee;
}

.ml-print-chrome {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.ml-print-canvas {
  flex: 1;
  overflow: auto;
  padding: 1.5rem 1rem 2.5rem;
}

.ml-a4 {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12);
}

.ml-a4-frame {
  display: block;
  width: 100%;
  min-height: 297mm;
  border: 0;
  background: #fff;
}

@media print {
  @page {
    size: A4;
    margin: 12mm;
  }

  html,
  body,
  body.ml-print-open {
    background: #fff !important;
  }

  body.ml-print-open > *:not(.ml-print-root) {
    display: none !important;
  }

  .ml-print-root {
    position: static;
    inset: auto;
    display: block;
    background: #fff;
  }

  .ml-print-chrome {
    display: none !important;
  }

  .ml-print-canvas {
    overflow: visible;
    padding: 0;
  }

  .ml-a4 {
    width: auto;
    min-height: 0;
    margin: 0;
    box-shadow: none;
  }

  .ml-a4-frame {
    min-height: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
