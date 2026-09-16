<template>
  <button
    :id="id"
    type="button"
    role="radio"
    :aria-checked="checked"
    :aria-describedby="ariaDescribedby"
    :disabled="isDisabled"
    :class="rootClass"
    @click="select"
  >
    <span class="flex items-center justify-center text-current" aria-hidden="true">
      <svg
        v-if="checked"
        width="6"
        height="6"
        viewBox="0 0 6 6"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef, type Ref } from 'vue'
import { cn } from '@/utils/cn'

type RadioGroupCtx = {
  model: Ref<string>
  disabled: ComputedRef<boolean>
}

const props = defineProps<{
  value: string
  id?: string
  disabled?: boolean
  class?: string
  ariaDescribedby?: string
}>()

const group = inject<RadioGroupCtx | null>('radioGroup', null)

const checked = computed(() => group?.model.value === props.value)
const isDisabled = computed(() => !!props.disabled || !!group?.disabled.value)

const rootClass = computed(() =>
  cn(
    'aspect-square size-4 shrink-0 rounded-full border border-gray-300 bg-white shadow-sm outline-offset-2 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500/70 disabled:cursor-not-allowed disabled:opacity-50',
    checked.value ? 'border-primary-500 bg-primary-500 text-white' : '',
    props.class,
  ),
)

function select() {
  if (isDisabled.value || !group) return
  group.model.value = props.value
}
</script>
