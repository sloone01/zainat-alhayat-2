<script setup lang="ts">
defineProps<{
  src?: string
  initials?: string
  alt?: string
}>()
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt || ''"
    class="fk-kavatar"
  >
  <span
    v-else
    class="fk-kavatar fk-kavatar--mono"
    aria-hidden="true"
  >
    {{ initials || '?' }}
  </span>
</template>
