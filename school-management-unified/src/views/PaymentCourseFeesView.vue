<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('paymentSettings.courseFeesPageTitle') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('paymentSettings.hubCoursesIntro') }}</p>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
        {{ flashError }}
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center me-3 shrink-0">
            <svg class="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.hubCoursesHeading') }}</h2>
        </div>

        <div v-if="loading" class="text-center py-8 text-gray-600 text-sm">{{ $t('common.loading') }}…</div>
        <div v-else-if="!courses.length" class="text-center py-8 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 text-sm text-gray-600">
          {{ $t('paymentSettings.noCoursesForPayment') }}
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="c in courses"
            :key="c.id"
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ c.name }}</h3>
                <p class="text-xs text-gray-500 mt-1">
                  <span v-if="c.course_pricing_basis" class="font-medium text-gray-700">{{
                    c.course_pricing_basis === 'phase'
                      ? $t('paymentSettings.coursePricingBasisPhase')
                      : $t('paymentSettings.coursePricingBasisGrade')
                  }}</span>
                  <span v-else class="text-gray-400">{{ $t('paymentSettings.coursePricingBasisUnset') }}</span>
                </p>
              </div>
              <span
                class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="c.profile_configured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'"
              >
                {{ c.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
              </span>
            </div>
            <div class="mt-3 flex justify-end">
              <router-link
                :to="`/settings/payments/course/${c.id}`"
                class="text-sm font-medium text-primary-700 hover:underline"
              >
                {{ $t('common.edit') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import paymentConfigService, { type CoursePaymentSummaryRow } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const loading = ref(true)
const flashError = ref('')
const courses = ref<CoursePaymentSummaryRow[]>([])

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    const cr = await paymentConfigService.listCoursesPaymentSummary(schoolId.value)
    courses.value = [...cr].sort((a, b) => a.name.localeCompare(b.name))
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
