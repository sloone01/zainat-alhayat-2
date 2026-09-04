<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('paymentSettings.courseFeesPageTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('paymentSettings.hubCoursesIntro') }}</p>
        </div>
      </section>

      <div v-if="flashError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <div class="flex items-start gap-3">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ flashError }}</span>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.coursesGridTitle') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('paymentSettings.coursesCount', { count: courses.length }) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="!loading && courses.length" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {{ $t('paymentSettings.configuredSummary', { configured: configuredCount, total: courses.length }) }}
              </span>
              <ListViewModeToggle v-model="viewMode" />
              <router-link
                v-if="!loading && courses.length"
                to="/courses"
                class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ $t('paymentSettings.manageCourses') }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="courses.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="c in courses"
              :key="c.id"
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              :class="!c.is_active ? 'opacity-75' : ''"
            >
              <div
                class="absolute inset-x-0 top-0 h-1 opacity-80"
                :class="c.profile_configured ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'"
                aria-hidden="true"
              />

              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    :class="c.profile_configured ? 'bg-sky-100 text-sky-800' : 'bg-amber-50 text-amber-800'"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ courseDisplayName(c) }}</h3>
                    <p v-if="c.title && c.title !== c.name" class="mt-0.5 truncate text-xs text-gray-500">{{ c.title }}</p>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-1.5">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="c.profile_configured ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'"
                  >
                    {{ c.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="c.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ c.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="c.course_pricing_basis ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-100' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'"
                  >
                    {{ pricingBasisLabel(c) }}
                  </span>
                </div>

                <div v-if="c.fee_package_name" class="mt-3 rounded-lg bg-sky-50/80 px-3 py-2 ring-1 ring-sky-100">
                  <p class="text-[10px] font-semibold uppercase tracking-wide text-sky-600">{{ $t('paymentSettings.feePackageBadge') }}</p>
                  <p class="mt-0.5 truncate text-sm font-medium text-sky-900">{{ c.fee_package_name }}</p>
                </div>
                <p v-else class="mt-3 text-xs leading-relaxed text-gray-500">
                  {{ $t('paymentSettings.noPackageLinkedYet') }}
                </p>
              </div>

              <div class="flex border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                <router-link
                  :to="`/settings/payments/course/${c.id}`"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                >
                  {{ c.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                  <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
              </div>
            </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.coursesGridTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.coursePricingBasis') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('paymentSettings.feePackageBadge') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="c in courses" :key="'list-' + c.id" class="hover:bg-primary-50/20" :class="!c.is_active ? 'opacity-75' : ''">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ courseDisplayName(c) }}</div>
                      <div v-if="c.title && c.title !== c.name" class="mt-0.5 text-xs text-gray-500">{{ c.title }}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">{{ pricingBasisLabel(c) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="c.profile_configured ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'"
                        >
                          {{ c.profile_configured ? $t('paymentSettings.profileConfigured') : $t('paymentSettings.profileNotConfigured') }}
                        </span>
                        <span
                          class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :class="c.is_active ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'"
                        >
                          {{ c.is_active ? $t('paymentSettings.active') : $t('paymentSettings.inactive') }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">
                      {{ c.fee_package_name || $t('paymentSettings.noPackageLinkedYet') }}
                    </td>
                    <td class="px-4 py-3 text-end">
                      <router-link
                        :to="`/settings/payments/course/${c.id}`"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ c.profile_configured ? $t('common.edit') : $t('paymentSettings.configureFees') }}
                        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="slot in emptyGridSlots"
                :key="'empty-' + slot"
                class="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
                :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
              >
                <template v-if="slot === 1">
                  <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-semibold text-gray-800">{{ $t('paymentSettings.noCoursesForPayment') }}</h3>
                  <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('paymentSettings.noCoursesHint') }}</p>
                  <router-link
                    to="/courses"
                    class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    {{ $t('paymentSettings.createFirstCourse') }}
                  </router-link>
                </template>
                <template v-else>
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
                </template>
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
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import paymentConfigService, { type CoursePaymentSummaryRow } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const emptyGridSlots = [1, 2, 3]
const loading = ref(true)
const flashError = ref('')
const courses = ref<CoursePaymentSummaryRow[]>([])

const configuredCount = computed(() => courses.value.filter((c) => c.profile_configured).length)

function courseDisplayName(c: CoursePaymentSummaryRow) {
  return c.name?.trim() || c.title?.trim() || c.id
}

function pricingBasisLabel(c: CoursePaymentSummaryRow) {
  if (c.course_pricing_basis === 'phase') return t('paymentSettings.coursePricingBasisPhase')
  if (c.course_pricing_basis === 'grade') return t('paymentSettings.coursePricingBasisGrade')
  return t('paymentSettings.coursePricingBasisUnset')
}

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
