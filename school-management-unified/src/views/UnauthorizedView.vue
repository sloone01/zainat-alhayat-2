<template>
  <div
    class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-100 px-3 py-4"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <div class="mx-auto w-full max-w-md">
      <div class="rounded-2xl border border-secondary-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
        <div class="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="t('unauthorized.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        <div class="text-center">
          <p class="text-6xl font-bold text-primary-400">401</p>
          <h1 class="mt-3 text-xl font-semibold text-secondary-800">{{ t('unauthorized.title') }}</h1>
          <p class="mt-2 text-sm text-secondary-500">{{ t('unauthorized.message') }}</p>

          <router-link
            to="/login"
            class="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          >
            {{ t('unauthorized.signIn') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { locale, t } = useI18n()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

const goBack = () => {
  router.push('/login')
}
</script>
