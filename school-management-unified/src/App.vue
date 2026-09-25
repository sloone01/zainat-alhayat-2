<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import FikrFeedbackHost from '@/components/FikrFeedbackHost.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { routePageLoading } from '@/router/route-loading'

const loaderStyle = ref<Record<string, string>>({
  top: '0px',
  left: '0px',
  width: '100%',
  height: '100%',
})

let frame = 0

function placeLoader() {
  const main = document.querySelector('main[data-demo="page"]')
  const rect = main?.getBoundingClientRect()
  if (rect && rect.width > 0 && rect.height > 0) {
    loaderStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    }
  } else {
    loaderStyle.value = {
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
    }
  }
  frame = requestAnimationFrame(placeLoader)
}

watch(
  routePageLoading,
  (on) => {
    if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
    if (on) placeLoader()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <RouterView />
  <div
    v-if="routePageLoading"
    class="fixed z-[80] flex items-center justify-center bg-white/75"
    :style="loaderStyle"
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
