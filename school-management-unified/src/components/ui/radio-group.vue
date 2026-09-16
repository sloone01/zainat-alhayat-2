<template>
  <div
    role="radiogroup"
    :class="rootClass"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { cn } from '@/utils/cn'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  disabled?: boolean
  class?: string
  ariaLabel?: string
}>()

provide('radioGroup', {
  model,
  disabled: computed(() => !!props.disabled),
})

const rootClass = computed(() => cn('grid gap-3', props.class))
</script>
