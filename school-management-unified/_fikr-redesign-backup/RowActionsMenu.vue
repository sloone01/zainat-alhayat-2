<template>
  <div class="relative inline-flex shrink-0 items-center justify-end">
    <button
      type="button"
      class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="$t('common.actions')"
      @click.stop="emit('toggle')"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute end-0 z-30 w-48 rounded-md border border-gray-200 bg-white py-1 text-start shadow-lg"
      :class="placement === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  placement?: 'up' | 'down'
}>(), {
  placement: 'up',
})

const emit = defineEmits<{
  toggle: []
}>()
</script>
