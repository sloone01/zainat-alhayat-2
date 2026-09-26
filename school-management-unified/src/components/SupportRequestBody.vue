<template>
  <div class="support-body text-sm text-fikr-ink">
    <p v-if="loading" class="text-fikr-ink-muted">…</p>
    <!-- HTML is sanitized on the server and again by DOMPurify in resolveSupportHtml -->
    <div v-else @click="openImage" v-html="displayHtml" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { resolveSupportHtml, revokeObjectUrls } from '@/utils/support-html'

const props = defineProps<{ html: string }>()

const displayHtml = ref('')
const loading = ref(true)
let objectUrls: string[] = []

watch(
  () => props.html,
  async (html) => {
    loading.value = true
    revokeObjectUrls(objectUrls)
    objectUrls = []
    const resolved = await resolveSupportHtml(html)
    objectUrls = resolved.objectUrls
    displayHtml.value = resolved.html
    loading.value = false
  },
  { immediate: true },
)

onBeforeUnmount(() => revokeObjectUrls(objectUrls))

function openImage(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof HTMLImageElement) || !target.src) return
  window.open(target.src, '_blank', 'noopener')
}
</script>

<style scoped>
.support-body :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: min(70vh, 36rem);
  height: auto !important;
  object-fit: contain;
  background: #f4f4f5;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  cursor: zoom-in;
}
.support-body :deep(ul) {
  list-style: disc;
  padding-inline-start: 1.5rem;
}
.support-body :deep(ol) {
  list-style: decimal;
  padding-inline-start: 1.5rem;
}
.support-body :deep(h2) {
  font-size: 1.125rem;
  font-weight: 600;
}
.support-body :deep(a) {
  text-decoration: underline;
}
</style>
