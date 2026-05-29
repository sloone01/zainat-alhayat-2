<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('paymentSettings.levelFeesPageTitle') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('paymentSettings.levelFeesPageIntro') }}</p>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-800 text-sm">{{ flashError }}</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center me-3 shrink-0">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.hubLevelsHeading') }}</h2>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-600 text-sm">{{ $t('common.loading') }}…</div>
        <div v-else-if="!levels.length" class="text-center py-10 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 text-sm text-gray-600">
          {{ $t('paymentSettings.noGradesForPayment') }}
          <router-link to="/system-settings" class="block mt-2 text-sm font-medium text-primary-700 hover:underline">
            {{ $t('paymentSettings.openSystemGrades') }}
          </router-link>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="lv in levels"
            :key="lv.id"
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ levelDisplayName(lv).charAt(0) }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-gray-900 truncate">{{ levelDisplayName(lv) }}</h3>
                  <p class="text-xs font-mono text-gray-500 mt-0.5">{{ lv.code }}</p>
                </div>
              </div>
              <div class="flex items-start gap-1 shrink-0">
                <div class="flex flex-col items-end gap-1">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="lv.profile_configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'"
                  >
                    {{ lv.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                  </span>
                  <span
                    v-if="lv.fee_package_name"
                    class="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800"
                    :title="lv.fee_package_name"
                  >
                    {{ $t('paymentSettings.feePackageBadge') }}: {{ lv.fee_package_name }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="lv.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ lv.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </span>
                </div>
                <div class="relative">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                    :aria-expanded="openMenuId === lv.id"
                    aria-haspopup="true"
                    :aria-label="$t('common.actions')"
                    @click.stop="toggleMenu(lv.id)"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <div
                    v-if="openMenuId === lv.id"
                    class="absolute end-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                    role="menu"
                    @click.stop
                  >
                    <router-link
                      :to="`/settings/payments/level/${lv.id}`"
                      role="menuitem"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="openMenuId = null"
                    >
                      {{ $t('common.edit') }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import paymentConfigService, { type SchoolPaymentLevelSummary } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

function levelDisplayName(lv: SchoolPaymentLevelSummary) {
  if (isRTL.value && lv.name_ar) return lv.name_ar
  if (!isRTL.value && lv.name_en) return lv.name_en
  return lv.name
}

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const loading = ref(true)
const flashError = ref('')
const levels = ref<SchoolPaymentLevelSummary[]>([])
const openMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeMenus() {
  openMenuId.value = null
}

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    const lv = await paymentConfigService.listLevelsSummary(schoolId.value)
    levels.value = [...lv].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>
