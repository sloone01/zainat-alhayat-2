<template>
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="relative min-h-0 flex-1">
      <div
        ref="viewport"
        class="absolute inset-0 overflow-y-auto overscroll-y-contain"
        style="-webkit-overflow-scrolling: touch"
        data-slot="scroll-area-viewport"
      >
        <div class="space-y-4 p-4">
          <slot />
        </div>
      </div>
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </div>
    <slot name="typing" />
    <div
      v-if="$slots.composer"
      class="relative z-20 shrink-0 border-t border-gray-200 bg-white p-3"
    >
      <slot name="composer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const viewport = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  const el = viewport.value
  if (el) el.scrollTop = el.scrollHeight
}

defineExpose({ scrollToBottom, viewport })
</script>
