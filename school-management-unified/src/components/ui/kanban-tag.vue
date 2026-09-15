<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  dot?: 'gray' | 'primary' | 'emerald' | 'amber' | 'red' | 'blue' | 'orange' | 'purple' | 'sky' | 'navy'
}>(), {
  dot: 'gray',
})

const dotClass = computed(() => {
  switch (props.dot) {
    case 'primary':
      return 'bg-primary-500'
    case 'emerald':
      return 'bg-emerald-500'
    case 'amber':
      return 'bg-amber-500'
    case 'red':
      return 'bg-red-500'
    case 'blue':
      return 'bg-blue-500'
    case 'orange':
      return 'bg-orange-500'
    case 'purple':
      return 'bg-purple-500'
    case 'sky':
      return 'bg-sky-500'
    case 'navy':
      return 'bg-navy-800'
    default:
      return 'bg-gray-400'
  }
})
</script>

<template>
  <span :class="cn('fk-ktag')">
    <span class="fk-ktag__dot" :class="dotClass" aria-hidden="true" />
    <slot />
  </span>
</template>
