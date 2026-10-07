<template>
  <template v-for="(part, i) in parts" :key="i">
    <code v-if="part.code" class="docs-code" dir="ltr">{{ part.text }}</code>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()

const parts = computed(() =>
  String(props.text || '')
    .split('`')
    .map((text, i) => ({ text, code: i % 2 === 1 }))
    .filter((part) => part.text.length > 0),
)
</script>

<style scoped>
.docs-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 0.05rem 0.35rem;
  color: #0a2147;
  unicode-bidi: isolate;
  overflow-wrap: anywhere;
}
</style>
