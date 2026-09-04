<template>
  <div
    class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
    role="group"
    :aria-label="$t('common.viewMode')"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
      :class="modelValue === 'cards' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'"
      :aria-pressed="modelValue === 'cards'"
      @click="$emit('update:modelValue', 'cards')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      <span class="hidden sm:inline">{{ $t('common.cardsView') }}</span>
    </button>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
      :class="modelValue === 'list' ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'"
      :aria-pressed="modelValue === 'list'"
      @click="$emit('update:modelValue', 'list')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
      <span class="hidden sm:inline">{{ $t('common.listView') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ListViewMode } from '@/composables/useListViewMode'

defineProps<{
  modelValue: ListViewMode
}>()

defineEmits<{
  'update:modelValue': [ListViewMode]
}>()
</script>
