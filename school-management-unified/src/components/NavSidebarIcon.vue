<script setup lang="ts">
import { computed } from 'vue'
import { NAV_SIDEBAR_ICON_PATHS } from '@/utils/nav-sidebar-icons'

const props = withDefaults(
  defineProps<{
    name: string
    class?: string
  }>(),
  { class: 'h-5 w-5 shrink-0' },
)

const paths = computed(() => {
  const raw = NAV_SIDEBAR_ICON_PATHS[props.name] ?? NAV_SIDEBAR_ICON_PATHS.default
  return Array.isArray(raw) ? raw : [raw]
})
</script>

<template>
  <svg
    :class="props.class"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      v-for="(d, i) in paths"
      :key="i"
      stroke-linecap="round"
      stroke-linejoin="round"
      :d="d"
    />
  </svg>
</template>
