<template>
  <ForSchoolsGalleryLanding />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ForSchoolsGalleryLanding from '@/views/ForSchoolsGalleryLanding.vue'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const defaultDocumentTitle = 'Zinat Al-Haya Kindergarten'
const platformDocumentTitle = computed(() =>
  isRTL.value ? 'فكر — منصة المدارس الذكية' : 'FIKR — Smart School Platform',
)

onMounted(() => {
  document.title = platformDocumentTitle.value
})

onUnmounted(() => {
  document.title = defaultDocumentTitle
})

watch(platformDocumentTitle, (title) => {
  document.title = title
})
</script>
