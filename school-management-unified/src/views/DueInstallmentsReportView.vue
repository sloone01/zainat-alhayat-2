<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('reports.dueFeesTitle')"
        :subtitle="$t('reports.dueFeesDesc')"
      >
        <template #leading>
          <router-link
            to="/reports/financial"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToReports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('reports.dueFeesTitle') }}</h2>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :disabled="loading"
              @click="loadReport"
            >
              {{ loading ? $t('common.loading') : $t('reports.runReport') }}
            </button>
          </div>
        </header>

        <div v-if="report" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="text-xs text-red-800">{{ $t('reports.bucket_late') }}</p>
            <p class="text-xl font-bold tabular-nums text-red-950">{{ report.summary.late }}</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p class="text-xs text-amber-800">{{ $t('reports.bucket_due') }}</p>
            <p class="text-xl font-bold tabular-nums text-amber-950">{{ report.summary.due }}</p>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p class="text-xs text-sky-800">{{ $t('reports.bucket_upcoming') }}</p>
            <p class="text-xl font-bold tabular-nums text-sky-950">{{ report.summary.upcoming }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-xs text-gray-600">{{ $t('reports.balanceTotal') }}</p>
            <p class="text-xl font-bold tabular-nums text-gray-900">{{ fmt(report.summary.balance_total) }}</p>
          </div>
        </div>

        <div v-if="report">
          <div v-if="!report.items.length" class="px-6 py-16 text-center text-sm text-gray-500">
            {{ $t('reports.dueFeesEmpty') }}
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.studentName') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('feesV2.installment') }}</th>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('feesV2.dueOn') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('feesV2.due') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('feesV2.paid') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('reports.balance') }}</th>
                  <th class="px-4 py-3 text-end font-semibold">{{ $t('feesV2.status') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="row in report.items" :key="row.installment_id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ row.student_name }}</td>
                  <td class="px-4 py-3 text-gray-700">
                    {{ row.label || `${$t('feesV2.installment')} ${row.sequence}` }}
                  </td>
                  <td class="px-4 py-3 tabular-nums text-gray-700">{{ row.due_date || '—' }}</td>
                  <td class="px-4 py-3 text-end tabular-nums">{{ fmt(row.amount_due) }}</td>
                  <td class="px-4 py-3 text-end tabular-nums">{{ fmt(row.amount_paid) }}</td>
                  <td class="px-4 py-3 text-end font-semibold tabular-nums">{{ fmt(row.balance) }}</td>
                  <td class="px-4 py-3 text-end">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="stateClass(row.state)">
                      {{ $t(`reports.state_${row.state}`) }}
                      <template v-if="row.state === 'late' && row.days_overdue">
                        · {{ $t('reports.daysOverdue', { n: row.days_overdue }) }}
                      </template>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="due-as-of"><span>{{ $t('reports.asOf') }}</span></label>
            <input id="due-as-of" v-model="asOf" type="date" class="fk-field" />
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="due-bucket"><span>{{ $t('reports.bucket') }}</span></label>
            <select id="due-bucket" v-model="bucket" class="fk-field">
              <option value="all">{{ $t('reports.bucket_all') }}</option>
              <option value="late">{{ $t('reports.bucket_late') }}</option>
              <option value="due">{{ $t('reports.bucket_due') }}</option>
              <option value="upcoming">{{ $t('reports.bucket_upcoming') }}</option>
            </select>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { feesV2Service, type DueInstallmentsReport } from '@/services/fees-v2.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const todayKey = () => new Date().toISOString().slice(0, 10)
const asOf = ref(todayKey())
const bucket = ref<'all' | 'due' | 'late' | 'upcoming'>('all')
const loading = ref(false)
const error = ref('')
const report = ref<DueInstallmentsReport | null>(null)
const showFilters = ref(false)

const hasActiveFilters = computed(() => asOf.value !== todayKey() || bucket.value !== 'all')

function clearFilters() {
  asOf.value = todayKey()
  bucket.value = 'all'
}

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

function stateClass(state: string) {
  if (state === 'late') return 'bg-red-100 text-red-800'
  if (state === 'due') return 'bg-amber-100 text-amber-800'
  if (state === 'upcoming') return 'bg-sky-100 text-sky-800'
  return 'bg-gray-100 text-gray-700'
}

async function loadReport() {
  loading.value = true
  error.value = ''
  try {
    report.value = await feesV2Service.dueInstallmentsReport({
      as_of: asOf.value,
      bucket: bucket.value,
    })
  } catch (e: unknown) {
    report.value = null
    error.value = (e as { message?: string })?.message || t('reports.dueFeesLoadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadReport()
})
</script>
