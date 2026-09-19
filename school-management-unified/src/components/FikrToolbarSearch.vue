<template>
  <div class="relative">
    <input
      :id="inputId"
      :value="modelValue"
      type="search"
      class="fk-field peer h-9 min-w-44 ps-9 text-sm sm:min-w-60"
      :class="modelValue ? 'pe-9' : ''"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-primary-600/80">
      <IconListFilter />
    </div>
    <button
      v-if="modelValue"
      type="button"
      class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-400 transition-colors hover:text-primary-700"
      :aria-label="$t('common.clear')"
      @click="emit('update:modelValue', '')"
    >
      <IconCircleX />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconListFilter from '@/components/icons/IconListFilter.vue'
import IconCircleX from '@/components/icons/IconCircleX.vue'

const props = defineProps<{
  modelValue: string
  placeholder: string
  ariaLabel?: string
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const inputId = computed(() => props.id || 'list-search')
</script>
