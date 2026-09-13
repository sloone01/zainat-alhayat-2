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
            :aria-label="t('notFound.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        <div class="text-center">
          <p class="text-6xl font-bold text-primary-400">404</p>
          <h1 class="mt-3 text-xl font-semibold text-secondary-800">{{ t('notFound.title') }}</h1>
          <p class="mt-2 text-sm text-secondary-500">{{ t('notFound.message') }}</p>

          <router-link
            :to="homeLink"
            class="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          >
            {{ t('notFound.goHome') }}
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
import { authService } from '@/services'

const { locale, t } = useI18n()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

/** Signed-out visitors belong on the public hub, not behind the auth guard. */
const homeLink = computed(() => {
  if (!authService.isAuthenticated()) return '/'

  const user = authService.getStoredUser() as {
    role?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
  } | null

  if (user?.isSuperAdmin || user?.isSystemUser) return '/platform/schools'
  if (user?.role === 'parent') return '/parent/dashboard'
  return '/dashboard'
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push(homeLink.value)
}
</script>
