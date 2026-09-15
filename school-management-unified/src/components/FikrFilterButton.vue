<template>
  <button
    type="button"
    class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40"
    :aria-expanded="expanded"
    :aria-label="$t('common.filter')"
    @click="emit('click')"
  >
    <IconFilter />
    <span
      v-if="count > 0"
      class="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-gray-500"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import IconFilter from '@/components/icons/IconFilter.vue'

withDefaults(defineProps<{
  expanded?: boolean
  count?: number
}>(), {
  expanded: false,
  count: 0,
})

const emit = defineEmits<{
  click: []
}>()
</script>
