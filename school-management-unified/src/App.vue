<script setup lang="ts">
import { RouterView } from 'vue-router'
import FikrFeedbackHost from '@/components/FikrFeedbackHost.vue'
</script>

<template>
  <RouterView />
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
