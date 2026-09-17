<template>
  <label :for="htmlFor" :class="rootClass">
    <slot />
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  htmlFor?: string
  class?: string
}>()

const rootClass = computed(() =>
  cn(
    'text-sm font-medium leading-4 text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    props.class,
  ),
)
</script>
