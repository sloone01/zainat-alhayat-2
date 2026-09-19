<template>
  <button
    :id="id"
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="rootClass"
    @click="onToggle"
  >
    <span class="flex items-center justify-center text-current" aria-hidden="true">
      <svg
        v-if="checked"
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    checked?: boolean
    disabled?: boolean
    id?: string
    class?: string
    ariaLabel?: string
  }>(),
  {
    checked: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const rootClass = computed(() =>
  cn(
    'peer inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary-500 text-white ring-offset-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.checked ? 'bg-primary-500' : 'bg-white',
    props.class,
  ),
)

function onToggle() {
  if (props.disabled) return
  emit('update:checked', !props.checked)
}
</script>
