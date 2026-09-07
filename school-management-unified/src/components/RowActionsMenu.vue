<template>
  <div class="relative inline-flex shrink-0 items-center justify-end">
    <button
      type="button"
      class="fk-iconbtn"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="$t('common.actions')"
      @click.stop="emit('toggle')"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.75" />
        <circle cx="12" cy="12" r="1.75" />
        <circle cx="12" cy="19" r="1.75" />
      </svg>
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute end-0 z-30 w-48 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-product"
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
