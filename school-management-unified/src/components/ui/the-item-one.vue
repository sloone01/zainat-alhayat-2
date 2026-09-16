<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex h-9 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-fikr-ink transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>
