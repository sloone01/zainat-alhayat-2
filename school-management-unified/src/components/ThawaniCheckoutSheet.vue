<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[90] flex flex-col bg-white"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <header class="flex items-center justify-between gap-3 border-b border-fikr-hairline px-4 py-3">
      <button
        type="button"
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
        :aria-label="$t('common.close')"
        @click="emit('cancel')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 :id="titleId" class="min-w-0 flex-1 truncate text-center text-sm font-semibold text-gray-900">
        {{ $t('parentFees.checkoutTitle') }}
      </h2>
      <span class="h-8 w-8 shrink-0" aria-hidden="true" />
    </header>

    <div class="relative min-h-0 flex-1 bg-white">
      <iframe
        v-if="checkoutUrl"
        :src="checkoutUrl"
        class="h-full w-full border-0"
        title="Thawani"
        referrerpolicy="no-referrer"
        @load="onFrameLoad"
      />
      <div
        v-if="loading || !checkoutUrl"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white"
      >
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <p class="text-sm text-gray-600">{{ $t('parentFees.checkoutLoading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { checkoutOutcomeFromUrl } from '@/utils/thawaniCheckout'

const props = defineProps<{
  visible: boolean
  checkoutUrl: string | null
}>()

const emit = defineEmits<{
  success: []
  cancel: []
  error: []
}>()

const titleId = `thawani-sheet-${Math.random().toString(36).slice(2, 8)}`
const loading = ref(true)
let settled = false

watch(
  () => [props.visible, props.checkoutUrl] as const,
  () => {
    if (!props.visible) return
    settled = false
    loading.value = true
  },
)

function finish(kind: 'success' | 'cancel' | 'error') {
  if (settled) return
  settled = true
  if (kind === 'success') emit('success')
  else if (kind === 'cancel') emit('cancel')
  else emit('error')
}

function onFrameLoad(e: Event) {
  loading.value = false
  const frame = e.target as HTMLIFrameElement
  try {
    const href = frame.contentWindow?.location.href
    if (href) {
      const outcome = checkoutOutcomeFromUrl(href)
      if (outcome === 'success') finish('success')
      else if (outcome === 'cancel') finish('cancel')
    }
  } catch {
    /* cross-origin Thawani page — wait for pay-return postMessage */
  }
}

function onMsg(e: MessageEvent) {
  if (!props.visible) return
  const d = e.data as { source?: string; status?: string } | undefined
  if (e.origin !== window.location.origin || d?.source !== 'school-pay') return
  finish(d.status === 'success' ? 'success' : 'cancel')
}

window.addEventListener('message', onMsg)
onBeforeUnmount(() => {
  window.removeEventListener('message', onMsg)
})
</script>
