<template>
  <div class="fk-lseg" role="group" :aria-label="$t('common.viewMode')">
    <button
      type="button"
      class="fk-lseg__btn"
      :class="modelValue === 'cards' ? 'fk-lseg__btn--on' : ''"
      :aria-pressed="modelValue === 'cards'"
      :aria-label="$t('common.cardsView')"
      @click="$emit('update:modelValue', 'cards')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2" />
      </svg>
    </button>
    <button
      type="button"
      class="fk-lseg__btn"
      :class="modelValue === 'list' ? 'fk-lseg__btn--on' : ''"
      :aria-pressed="modelValue === 'list'"
      :aria-label="$t('common.listView')"
      @click="$emit('update:modelValue', 'list')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
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
