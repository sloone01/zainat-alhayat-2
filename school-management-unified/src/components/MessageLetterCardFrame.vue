<template>
  <NotificationEmailContentFrame>
    <div class="bg-white">
      <iframe
        ref="iframeRef"
        :title="title"
        class="block w-full border-0 bg-white"
        style="min-height: 160px"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
        sandbox="allow-same-origin"
        scrolling="no"
        :srcdoc="srcdoc"
        @load="syncHeight"
      />
    </div>
  </NotificationEmailContentFrame>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import NotificationEmailContentFrame from '@/components/NotificationEmailContentFrame.vue'

const props = defineProps<{
  srcdoc: string
  locale?: 'en' | 'ar'
  title?: string
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)

function syncHeight() {
  const iframe = iframeRef.value
  if (!iframe) return
  requestAnimationFrame(() => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const height = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0, 160)
      iframe.style.height = `${Math.min(height + 8, 520)}px`
    } catch {
      iframe.style.height = '240px'
    }
  })
}

watch(
  () => props.srcdoc,
  () => {
    void nextTick(() => syncHeight())
  },
)
</script>
