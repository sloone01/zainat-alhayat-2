<template>
  <DashboardLayout>
    <div class="fk-page pb-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('mobileNav.account')" />

      <div class="fk-card">
        <div class="flex items-center gap-4 px-5 py-5 sm:px-6">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-800 text-lg font-semibold text-white">
            {{ initial }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-gray-900">{{ displayName }}</p>
            <p v-if="email" class="truncate text-sm text-gray-500" dir="ltr">{{ email }}</p>
            <p class="mt-0.5 text-xs font-medium text-primary-700">{{ roleLabel }}</p>
          </div>
        </div>
      </div>

      <div class="fk-card p-4 sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <span class="text-sm font-medium text-gray-700">{{ $t('mobileNav.language') }}</span>
          <LanguageSwitcher />
        </div>
        <button type="button" class="fk-btn fk-btn--pearl w-full text-red-700 ring-red-200" @click="logout">
          {{ $t('dashboard.signOut') }}
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { authService } from '@/services'
import { resolveMobileAppFlavor, resolveMobilePersona } from '@/navigation/mobile-bottom-nav'

const { t, locale } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

const user = computed(() => authService.getStoredUser())
const persona = computed(() => resolveMobilePersona(user.value))
const flavor = computed(() => resolveMobileAppFlavor(user.value))

const displayName = computed(() => {
  const u = user.value as { firstName?: string; lastName?: string; first_name?: string; last_name?: string } | null
  if (!u) return t('dashboard.guestUser')
  const name = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim()
  return name || t('dashboard.guestUser')
})

const email = computed(() => user.value?.email || '')
const initial = computed(() => (displayName.value.charAt(0) || '?').toUpperCase())

const roleLabel = computed(() => {
  if (persona.value === 'platform') return t('mobileNav.platformRole')
  if (flavor.value === 'transport') return t('mobileNav.appTransport')
  const key = `dashboard.${persona.value === 'student' ? 'student' : flavor.value}`
  const translated = t(key)
  return translated === key ? String(persona.value) : translated
})

async function logout() {
  await authService.logout()
  router.push('/login')
}
</script>
