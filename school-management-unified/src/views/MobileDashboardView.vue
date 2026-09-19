<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

/** Legacy route; `/mobile-dashboard` redirects in the router. Keep file as a safe no-op. */
const router = useRouter()
onMounted(() => {
  router.replace('/dashboard')
})
</script>

<template>
  <div />
</template>
