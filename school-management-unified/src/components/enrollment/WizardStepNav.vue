<template>
  <div
    class="flex gap-3 border-t border-gray-100 pt-5"
    :class="hideBack ? 'justify-end' : 'justify-between'"
  >
    <button
      v-if="!hideBack"
      type="button"
      class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      @click="$emit('back')"
    >
      <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ backLabel || $t('common.previous') }}
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
      :class="disabled
        ? 'cursor-not-allowed bg-gray-200 text-gray-500'
        : 'bg-primary-600 text-white hover:bg-primary-700'"
      :disabled="disabled"
      @click="$emit('next')"
    >
      <slot name="icon" />
      {{ nextLabel || $t('common.next') }}
      <svg
        v-if="!hideNextChevron"
        class="h-4 w-4 rtl:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    hideBack?: boolean
    disabled?: boolean
    nextLabel?: string
    backLabel?: string
    hideNextChevron?: boolean
  }>(),
  {
    hideBack: false,
    disabled: false,
    hideNextChevron: false,
  },
)

defineEmits<{
  next: []
  back: []
}>()
</script>
