<template>
  <ForSchoolsGalleryLanding />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ForSchoolsGalleryLanding from '@/views/ForSchoolsGalleryLanding.vue'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const platformDocumentTitle = computed(() =>
  isRTL.value ? 'فكر — منصة المدارس الذكية' : 'FIKR — Smart School Platform',
)

onMounted(() => {
  document.title = platformDocumentTitle.value
  const icon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
  if (icon) {
    icon.href = '/fikr-logo.png'
    icon.type = 'image/png'
  }
})

onUnmounted(() => {
  document.title = platformDocumentTitle.value
})

watch(platformDocumentTitle, (title) => {
  document.title = title
})
</script>
