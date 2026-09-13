<template>
  <div
    v-if="pages > 0 && show"
    class="mt-5 flex items-center justify-center border-t border-fikr-hairline pt-4"
    :class="wrapperClass"
  >
    <nav class="inline-flex items-center gap-1" :aria-label="$t('common.pagination')">
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page <= 1 || disabled"
        :aria-label="$t('common.previous')"
        @click="goPrevious"
      >
        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-for="n in visiblePages"
        :key="n"
        type="button"
        class="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors"
        :class="
          n === page
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        "
        :aria-label="$t('common.pageNumber', { page: n })"
        :aria-current="n === page ? 'page' : undefined"
        :disabled="disabled"
        @click="goTo(n)"
      >
        {{ n }}
      </button>
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page >= pages || disabled"
        :aria-label="$t('common.next')"
        @click="goNext"
      >
        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 1-based current page */
    page: number
    /** Total page count (at least 1 when there are items) */
    pages: number
    /** When false, hide the control (e.g. empty list). Default true. */
    show?: boolean
    disabled?: boolean
    wrapperClass?: string
  }>(),
  {
    show: true,
    disabled: false,
    wrapperClass: '',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
  previous: []
  next: []
}>()

/** Up to 3 consecutive page numbers centered on the current page. */
const visiblePages = computed(() => {
  const total = Math.max(1, props.pages)
  const current = Math.min(Math.max(1, props.page), total)
  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = current - 1
  if (start < 1) start = 1
  if (start + 2 > total) start = total - 2
  return [start, start + 1, start + 2]
})

function goTo(n: number) {
  const next = Math.min(Math.max(1, n), Math.max(1, props.pages))
  if (next === props.page) return
  emit('update:page', next)
}

function goPrevious() {
  if (props.page <= 1) return
  emit('previous')
  emit('update:page', props.page - 1)
}

function goNext() {
  if (props.page >= props.pages) return
  emit('next')
  emit('update:page', props.page + 1)
}
</script>
