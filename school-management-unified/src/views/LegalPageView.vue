<template>
  <div class="min-h-dvh bg-white px-5 py-6 text-gray-800" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="mx-auto max-w-2xl pb-10">
      <button
        type="button"
        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
        :aria-label="$t('common.back')"
        @click="router.back()"
      >
        <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h1 class="mt-4 text-2xl font-semibold text-navy-800">{{ title }}</h1>
      <p class="mt-2 text-sm text-gray-500">{{ $t('legal.updated') }}</p>

      <section v-for="section in sections" :key="section.title" class="mt-6">
        <h2 class="text-base font-semibold text-gray-900">{{ section.title }}</h2>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{{ section.body }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

const doc = computed(() => (route.meta.legalDoc === 'terms' ? 'terms' : 'privacy'))
const count = computed(() => (doc.value === 'terms' ? 6 : 8))
const title = computed(() => t(doc.value === 'terms' ? 'legal.termsTitle' : 'legal.privacyTitle'))

const sections = computed(() => {
  const prefix = doc.value === 'terms' ? 'legal.terms' : 'legal.privacy'
  return Array.from({ length: count.value }, (_, index) => {
    const n = index + 1
    return {
      title: t(`${prefix}${n}Title`),
      body: t(`${prefix}${n}Body`),
    }
  })
})
</script>
