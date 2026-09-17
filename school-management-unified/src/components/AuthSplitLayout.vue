<template>
  <div
    class="flex bg-white font-sans"
    :class="
      nativeApp
        ? 'h-[100dvh] max-h-[100dvh] overflow-hidden pt-[var(--fk-safe-top)]'
        : 'min-h-screen'
    "
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <aside class="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy-800 px-10 py-9 text-white lg:flex xl:px-16">
      <div class="flex items-center justify-end gap-3">
        <span class="text-xl font-bold tracking-[0.04em] text-white" dir="ltr">FIKR</span>
        <span class="grid grid-cols-3 gap-1" aria-hidden="true">
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/50" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/70" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
          <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
        </span>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-[44px] font-bold leading-[1.15] tracking-[-0.01em] text-white xl:text-[56px] xl:leading-[1.1]">
          {{ $t('login.heroTitle') }}
        </h2>
        <p class="mt-5 text-lg leading-relaxed text-white/80 xl:text-xl">
          {{ heroSubtitle }}
        </p>
      </div>

      <p class="text-xs text-white/60">{{ $t('login.footerBrand') }}</p>

      <div
        class="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-primary-500/10"
        aria-hidden="true"
      />
    </aside>

    <main
      class="flex flex-1 flex-col px-5 py-6 sm:px-10"
      :class="nativeApp ? 'fk-native-scroll min-h-0 overflow-y-auto' : ''"
    >
      <div class="flex items-center justify-between">
        <router-link
          v-if="!nativeApp && !hideHome"
          :to="backLink"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center text-primary-700 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 rounded-md"
          :aria-label="$t('login.home')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </router-link>
        <span v-else class="h-8 w-8" aria-hidden="true" />
        <LanguageSwitcher />
      </div>

      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-[400px]">
          <slot />
        </div>
      </div>
    </main>
    <slot name="overlay" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { isNativeApp } from '@/utils/native-app'

withDefaults(
  defineProps<{
    heroSubtitle: string
    backLink?: string
    hideHome?: boolean
  }>(),
  {
    backLink: '/',
    hideHome: false,
  },
)

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const nativeApp = computed(() => isNativeApp())

watch(
  isRTL,
  (rtl) => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    document.documentElement.lang = locale.value === 'ar' ? 'ar-OM' : locale.value
  },
  { immediate: true },
)
</script>
