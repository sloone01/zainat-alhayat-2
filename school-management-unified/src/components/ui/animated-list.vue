<script setup lang="ts" generic="T">
import { computed, onUnmounted, ref, watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  items: T[]
  className?: string
  delay?: number
  loop?: boolean
  reverse?: boolean
  resetKey?: string | number
}>(), {
  delay: 200,
  loop: false,
  reverse: false,
})

const prefersReducedMotion = usePreferredReducedMotion()
const shown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function keyOf(item: unknown, index: number): string {
  if (item && typeof item === 'object' && 'id' in item && (item as { id: unknown }).id != null) {
    return String((item as { id: unknown }).id)
  }
  return String(index)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function revealAll() {
  shown.value = props.items.length
}

function startReveal() {
  clearTimer()
  if (!props.items.length) {
    shown.value = 0
    return
  }
  if (prefersReducedMotion.value) {
    revealAll()
    return
  }
  shown.value = 0
  timer = setInterval(() => {
    shown.value += 1
    if (shown.value >= props.items.length) {
      if (!props.loop) {
        clearTimer()
        return
      }
      shown.value = 0
    }
  }, Math.max(40, props.delay))
}

const signature = computed(
  () => `${props.resetKey ?? ''}:${props.items.map((item, index) => keyOf(item, index)).join('|')}`,
)

watch(signature, startReveal, { immediate: true })
watch(prefersReducedMotion, (reduced) => {
  if (reduced) {
    clearTimer()
    revealAll()
  }
})

onUnmounted(clearTimer)

const visibleItems = computed(() => {
  const slice = props.items.slice(0, Math.min(shown.value, props.items.length))
  return props.reverse ? [...slice].reverse() : slice
})

const listClass = computed(() => cn('flex w-full flex-col items-stretch gap-2', props.className))
</script>

<template>
  <TransitionGroup
    :name="prefersReducedMotion ? undefined : 'fk-alist'"
    tag="div"
    :class="listClass"
    aria-live="polite"
  >
    <div
      v-for="(item, index) in visibleItems"
      :key="keyOf(item, index)"
      class="mx-auto w-full origin-top"
    >
      <slot :item="item" :index="index" />
    </div>
  </TransitionGroup>
</template>

<style scoped>
.fk-alist-move,
.fk-alist-enter-active,
.fk-alist-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fk-alist-enter-from,
.fk-alist-leave-to {
  opacity: 0;
  transform: scale(0.72);
}

.fk-alist-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .fk-alist-move,
  .fk-alist-enter-active,
  .fk-alist-leave-active {
    transition: none;
  }
}
</style>
