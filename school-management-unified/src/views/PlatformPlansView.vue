<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('platformBilling.plansTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('platformBilling.plansIntroModules') }}</p>
        </div>
      </section>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold text-red-700 underline hover:text-red-900" @click="load">
            {{ $t('platformBilling.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('platformBilling.plansListHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('platformBilling.plansCount', { count: plans.length }) }}
              </p>
            </div>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </div>

        <div v-if="!loading" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-3">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ planStats.total }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformBilling.plansStats.total') }}</div>
          </div>
          <div class="rounded-xl bg-emerald-50/70 px-3 py-3 text-center ring-1 ring-emerald-100">
            <div class="text-xl font-bold tabular-nums text-emerald-700">{{ planStats.active }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformBilling.plansStats.active') }}</div>
          </div>
          <div class="col-span-2 rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100 sm:col-span-1">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ planStats.seats }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('platformBilling.plansStats.maxSeats') }}</div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="plans.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('platformBilling.plansEmpty') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('platformBilling.plansEmptyHint') }}</p>
          </div>

          <template v-else>
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="plan in plans"
                :key="plan.code"
                class="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
                :class="!plan.is_active ? 'opacity-75' : ''"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="truncate font-semibold text-gray-900">{{ planDisplayName(plan) }}</h3>
                      <p class="mt-0.5 font-mono text-xs text-gray-500" dir="ltr">{{ plan.code }}</p>
                    </div>
                    <span
                      class="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                      :class="plan.is_active ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-gray-100 text-gray-600 ring-gray-200'"
                    >
                      {{ plan.is_active ? $t('platformBilling.planActive') : $t('platformBilling.planInactive') }}
                    </span>
                  </div>

                  <p v-if="planDisplayDesc(plan)" class="mt-3 line-clamp-2 text-xs text-gray-500">
                    {{ planDisplayDesc(plan) }}
                  </p>

                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <div
                      v-for="period in periods"
                      :key="period"
                      class="rounded-xl bg-gray-50/80 px-3 py-2.5 ring-1 ring-gray-100"
                    >
                      <div class="text-[10px] font-medium text-gray-500">{{ $t(`platformBilling.periods.${period}`) }}</div>
                      <div class="mt-0.5 text-sm font-bold tabular-nums text-gray-900">{{ priceOf(plan, period) }}</div>
                    </div>
                  </div>

                  <div class="mt-4 flex items-center justify-between rounded-xl bg-primary-50/60 px-3 py-2.5 ring-1 ring-primary-100">
                    <span class="text-xs font-medium text-gray-600">{{ $t('platformBilling.seatsIncluded') }}</span>
                    <span class="text-sm font-bold tabular-nums text-primary-800">{{ plan.included_student_seats }}</span>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <router-link
                    :to="`/platform/plans/${plan.code}`"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ $t('platformBilling.editPlan') }}
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
                    <th class="px-4 py-3 text-start">{{ $t('platformBilling.colPlan') }}</th>
                    <th
                      v-for="period in periods"
                      :key="period"
                      class="px-4 py-3 text-start"
                    >
                      {{ $t(`platformBilling.periods.${period}`) }}
                    </th>
                    <th class="px-4 py-3 text-start">{{ $t('platformBilling.seatsIncluded') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="plan in plans"
                    :key="plan.code"
                    class="hover:bg-primary-50/20"
                    :class="!plan.is_active ? 'opacity-70' : ''"
                  >
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ planDisplayName(plan) }}</div>
                      <div class="text-xs text-gray-500" dir="ltr">{{ plan.code }}</div>
                      <span
                        class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        :class="plan.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'"
                      >
                        {{ plan.is_active ? $t('platformBilling.planActive') : $t('platformBilling.planInactive') }}
                      </span>
                    </td>
                    <td
                      v-for="period in periods"
                      :key="period"
                      class="px-4 py-3 tabular-nums text-gray-800"
                    >
                      {{ priceOf(plan, period) }}
                    </td>
                    <td class="px-4 py-3 font-semibold tabular-nums text-gray-900">
                      {{ plan.included_student_seats }}
                    </td>
                    <td class="px-4 py-3 text-end">
                      <router-link
                        :to="`/platform/plans/${plan.code}`"
                        class="text-sm font-semibold text-primary-700 hover:underline"
                      >
                        {{ $t('platformBilling.editPlan') }}
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformPlan,
} from '@/services/platform-billing.service'

const { locale, t } = useI18n()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const plans = ref<PlatformPlan[]>([])
const periods = ref<PlatformBillingPeriod[]>(['monthly', 'semester', 'yearly', 'summer'])

const planStats = computed(() => ({
  total: plans.value.length,
  active: plans.value.filter((p) => p.is_active).length,
  seats: plans.value.reduce((max, p) => Math.max(max, p.included_student_seats), 0),
}))

function planDisplayName(plan: PlatformPlan) {
  return locale.value === 'ar' ? plan.name_ar : plan.name_en
}

function planDisplayDesc(plan: PlatformPlan) {
  const desc = locale.value === 'ar' ? plan.description_ar : plan.description_en
  return desc || ''
}

function priceOf(plan: PlatformPlan, period: PlatformBillingPeriod) {
  const row = plan.prices?.find((p) => p.billing_period === period)
  if (!row) return '—'
  return `${Number(row.amount_omr).toFixed(3)} OMR`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const catalog = await platformBillingService.listAdminPlans()
    plans.value = catalog.plans
    if (catalog.billing_periods?.length) periods.value = catalog.billing_periods
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('platformBilling.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
