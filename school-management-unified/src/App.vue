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
</style>
