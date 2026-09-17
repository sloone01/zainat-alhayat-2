<template>
  <nav class="inline-block" :class="className" :aria-label="label">
    <div class="flex items-center" :style="{ gap: `${GAP}px` }">
      <button
        type="button"
        class="fk-pager__arrow"
        :aria-label="prevLabel"
        :disabled="!canPrev || disabled"
        @click="goPrev"
      >
        <svg class="rtl:rotate-180" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
          <path
            d="M7.25 2.75 4 6l3.25 3.25"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div class="relative h-7 overflow-hidden">
        <span
          v-if="thumbIndex >= 0"
          aria-hidden="true"
          class="fk-pager__thumb"
          :style="{
            width: `${slot}px`,
            insetInlineStart: `${thumbOffset}px`,
          }"
        />
        <ol class="relative flex h-7" :style="{ gap: `${GAP}px` }">
          <li
            v-for="item in items"
            :key="typeof item === 'number' ? `slot-${item}` : item"
            :style="{ width: `${slot}px` }"
            :aria-hidden="typeof item !== 'number' ? true : undefined"
            class="flex h-7 min-w-0 items-center justify-center"
          >
            <span
              v-if="typeof item !== 'number'"
              class="text-[12.5px] text-gray-400"
            >…</span>
            <button
              v-else
              type="button"
              class="fk-pager__num"
              :class="item === current ? 'fk-pager__num--on' : ''"
              :aria-label="pageLabel(item)"
              :aria-current="item === current ? 'page' : undefined"
              :disabled="disabled"
              @click="goTo(item)"
            >
              <span :key="item" class="fk-pager__roll" :data-dir="ready ? direction : 0">{{ item }}</span>
            </button>
          </li>
        </ol>
      </div>

      <button
        type="button"
        class="fk-pager__arrow"
        :aria-label="nextLabel"
        :disabled="!canNext || disabled"
        @click="goNext"
      >
        <svg class="rtl:rotate-180" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
          <path
            d="M4.75 2.75 8 6l-3.25 3.25"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
    <span role="status" class="sr-only">{{ spoken }}</span>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { paginate, slotFor } from '@/utils/paginate'

const GAP = 4

const props = withDefaults(
  defineProps<{
    page: number
    count: number
    siblings?: number
    boundaries?: number
    disabled?: boolean
    label: string
    prevLabel: string
    nextLabel: string
    pageLabel: (n: number) => string
    statusLabel: (current: number, total: number) => string
    className?: string
  }>(),
  {
    siblings: 1,
    boundaries: 1,
    disabled: false,
    className: '',
  },
)

const emit = defineEmits<{
  'update:page': [number]
}>()

const count = computed(() => Math.max(1, props.count))
const current = computed(() => Math.min(Math.max(1, props.page), count.value))
const items = computed(() => paginate(current.value, count.value, props.siblings, props.boundaries))
const thumbIndex = computed(() => items.value.indexOf(current.value))
const slot = computed(() => slotFor(String(count.value).length))
const thumbOffset = computed(() => Math.max(0, thumbIndex.value) * (slot.value + GAP))
const canPrev = computed(() => current.value > 1)
const canNext = computed(() => current.value < count.value)

const direction = ref<1 | -1>(1)
watch(current, (next, prev) => {
  direction.value = next >= (prev ?? next) ? 1 : -1
})

const ready = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })
})

const spoken = ref('')
let speakTimer: ReturnType<typeof setTimeout> | null = null
watch(
  [current, count],
  () => {
    if (speakTimer) clearTimeout(speakTimer)
    speakTimer = setTimeout(() => {
      spoken.value = props.statusLabel(current.value, count.value)
    }, 500)
  },
  { immediate: true },
)
onUnmounted(() => {
  if (speakTimer) clearTimeout(speakTimer)
})

function goTo(n: number) {
  if (props.disabled) return
  const next = Math.min(Math.max(1, n), count.value)
  if (next === current.value) return
  emit('update:page', next)
}

function goPrev() {
  if (!canPrev.value) return
  goTo(current.value - 1)
}

function goNext() {
  if (!canNext.value) return
  goTo(current.value + 1)
}
</script>

<style scoped>
.fk-pager__arrow {
  @apply box-border flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 leading-none text-primary-600 outline-none transition-colors duration-150;
  @apply hover:bg-primary-50 hover:text-primary-800;
  @apply focus:ring-0 focus:ring-offset-0;
  @apply focus-visible:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-0;
  @apply disabled:pointer-events-none disabled:cursor-default disabled:text-gray-300;
}
.fk-pager__thumb {
  @apply pointer-events-none absolute top-0 h-7 rounded-md bg-primary-600;
  transition: inset-inline-start 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.fk-pager__num {
  @apply relative z-[1] box-border flex h-7 w-full min-w-0 cursor-pointer items-center justify-center rounded-md p-0 text-[12.5px] leading-none tabular-nums text-gray-500 outline-none transition-colors duration-150;
  @apply hover:bg-primary-50 hover:text-primary-800;
  @apply focus:ring-0 focus:ring-offset-0;
  @apply focus-visible:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-0;
  @apply disabled:cursor-default;
}
.fk-pager__num--on {
  @apply font-medium text-white hover:bg-transparent hover:text-white;
}
.fk-pager__roll {
  display: inline-block;
}
@media (prefers-reduced-motion: no-preference) {
  .fk-pager__roll[data-dir='1'] {
    animation: fk-pager-roll 0.18s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .fk-pager__roll[data-dir='-1'] {
    animation: fk-pager-roll-back 0.18s cubic-bezier(0.23, 1, 0.32, 1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .fk-pager__thumb {
    transition: none;
  }
}
@keyframes fk-pager-roll {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fk-pager-roll-back {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
[dir='rtl'] .fk-pager__roll[data-dir='1'] {
  animation-name: fk-pager-roll-back;
}
[dir='rtl'] .fk-pager__roll[data-dir='-1'] {
  animation-name: fk-pager-roll;
}
</style>
