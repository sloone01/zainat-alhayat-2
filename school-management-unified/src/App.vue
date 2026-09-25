<script setup lang="ts">
import { RouterView } from 'vue-router'
import FikrFeedbackHost from '@/components/FikrFeedbackHost.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'
</script>

<template>
  <RouterView />
  <div
    v-if="routePageLoading"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-white/75"
  >
    <FikrLoader size="lg" />
  </div>
  <FikrFeedbackHost />
</template>

<style>
#app {
  min-height: 100vh;
}
html.fk-native #app {
  height: 100%;
  max-height: 100dvh;
  min-height: 0;
  overflow: hidden;
}
</style>
