<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('reports.dueFeesTitle')">
        <template #leading>
          <router-link
            to="/reports/financial"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToReports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
        <template #actions>
          <div class="relative" data-export-menu>
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('reports.exportMenu')"
              :aria-expanded="exportMenuOpen"
              aria-haspopup="true"
              :disabled="loading || exporting !== null"
              @click="exportMenuOpen = !exportMenuOpen"
            >
              <IconDownload />
            </button>
            <div
              v-if="exportMenuOpen"
              role="menu"
              class="absolute end-0 z-30 mt-1 w-44 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-product"
            >
              <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportReport('word')">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-fikr-mist text-[10px] font-bold text-navy-800">W</span>
                {{ $t('reports.exportWord') }}
              </button>
              <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportReport('pdf')">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-navy-800 text-[10px] font-bold text-white">PDF</span>
                {{ $t('reports.exportPdf') }}
              </button>
              <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportReport('excel')">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-primary-500 text-[10px] font-bold text-white">XLS</span>
                {{ $t('reports.exportExcel') }}
              </button>
            </div>
          </div>
          <FikrFilterButton
            :expanded="showFilters"
            :count="hasActiveFilters ? 1 : 0"
            @click="showFilters = true"
          />
          <button
            type="button"
            class="fk-btn fk-btn--white"
            :disabled="loading"
            @click="loadReport"
          >
            {{ loading ? $t('common.loading') : $t('reports.runReport') }}
          </button>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-elev overflow-hidden p-0">
        <!-- Hero band: as-of meta, big unpaid figure, bucket chips -->
        <div v-if="report" class="px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
          <p class="text-sm leading-5 text-fikr-ink-muted">
            {{ $t('reports.dueHeroMeta', { date: formatDay(asOf) }) }}
          </p>
          <h2 class="fk-display mt-1 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">
            {{ $t('reports.dueHeroTitle', { amount: fmtMoney(report.summary.balance_total) }) }}
          </h2>
          <div class="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              class="fk-fchip"
              :class="bucket === 'all' ? 'fk-fchip--active' : ''"
              @click="setBucket('all')"
            >
              {{ $t('reports.bucket_all') }} · {{ totalCount }}
            </button>
            <button
              type="button"
              class="fk-fchip"
              :class="bucket === 'late' ? 'fk-fchip--active' : ''"
              @click="setBucket('late')"
            >
              {{ $t('reports.bucket_late') }} · {{ report.summary.late }}
            </button>
            <button
              type="button"
              class="fk-fchip"
              :class="bucket === 'due' ? 'fk-fchip--active' : ''"
              @click="setBucket('due')"
            >
              {{ $t('reports.bucket_due') }} · {{ report.summary.due }}
            </button>
            <button
              type="button"
              class="fk-fchip"
              :class="bucket === 'upcoming' ? 'fk-fchip--active' : ''"
              @click="setBucket('upcoming')"
            >
              {{ $t('reports.bucket_upcoming') }} · {{ report.summary.upcoming }}
            </button>
          </div>
        </div>

        <div v-if="report" class="px-4 pb-6 pt-4 sm:px-6">
          <div v-if="!report.items.length" class="px-6 py-16 text-center text-sm text-fikr-ink-muted">
            {{ $t('reports.dueFeesEmpty') }}
          </div>
          <div v-else class="overflow-x-auto">
            <table class="fk-feetable min-w-full">
              <thead>
                <tr>
                  <th>{{ $t('progressTracking.studentName') }}</th>
                  <th>{{ $t('feesV2.installment') }}</th>
                  <th>{{ $t('feesV2.dueOn') }}</th>
                  <th class="!text-end">{{ $t('reports.balance') }}</th>
                  <th>{{ $t('feesV2.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in paginatedItems" :key="row.installment_id">
                  <td>
                    <span class="font-medium">{{ studentLabel(row) }}</span>
                  </td>
                  <td>{{ row.label || `${$t('feesV2.installment')} ${row.sequence}` }}</td>
                  <td>{{ row.due_date ? formatDay(row.due_date) : '—' }}</td>
                  <td class="text-end font-medium" dir="ltr">
                    {{ fmt(row.balance) }}
                    <span v-if="Number(row.amount_paid) > 0" class="font-normal text-fikr-ink-soft">/ {{ fmt(row.amount_due) }}</span>
                  </td>
                  <td>
                    <span v-if="row.state === 'late'" class="fk-pill fk-pill--navy">
                      {{ row.days_overdue ? $t('reports.daysOverdue', { n: row.days_overdue }) : $t('reports.state_late') }}
                    </span>
                    <span v-else-if="row.state === 'due'" class="fk-pill fk-pill--outline">
                      {{ $t('reports.bucket_due') }}
                    </span>
                    <span v-else-if="row.state === 'upcoming'" class="fk-pill fk-pill--outline">
                      {{ $t('reports.state_upcoming') }}
                    </span>
                    <span v-else class="text-fikr-ink-muted">
                      {{ $t('reports.state_unscheduled') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <FikrPagination
            :page="currentPage"
            :pages="totalPages"
            :show="reportItems.length > 0"
            @update:page="goToPage"
          />
        </div>

        <div v-else-if="loading" class="flex items-center justify-center gap-3 px-6 py-16 text-fikr-ink-muted">
          {{ $t('common.loading') }}
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
            <button type="button" class="fk-btn fk-btn--mist" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--navy" @click="showFilters = false">{{ $t('common.close') }}</button>
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
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { useFeedback } from '@/composables/useFeedback'
import { feesV2Service, type DueInstallmentRow, type DueInstallmentsReport } from '@/services/fees-v2.service'
import {
  exportDueInstallmentsPrint,
  type DueExportFormat,
  type DueExportKey,
} from '@/utils/due-installments-export'
import { formatStudentDisplayName } from '@/utils/student-display-name'
import { getErrorMessage } from '@/utils/error-reporting'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const exporting = ref<DueExportFormat | null>(null)
const exportMenuOpen = ref(false)
const todayKey = () => new Date().toISOString().slice(0, 10)
const asOf = ref(todayKey())
const bucket = ref<'all' | 'due' | 'late' | 'upcoming'>('all')
const loading = ref(false)
const error = ref('')
const report = ref<DueInstallmentsReport | null>(null)
const showFilters = ref(false)

const hasActiveFilters = computed(() => asOf.value !== todayKey() || bucket.value !== 'all')

const totalCount = computed(() => {
  const s = report.value?.summary
  if (!s) return 0
  return Number(s.total || 0)
})

const reportItems = computed(() => report.value?.items ?? [])
const {
  currentPage,
  paginatedItems,
  totalPages,
  goToPage,
} = useClientPagination(reportItems)

function clearFilters() {
  asOf.value = todayKey()
  bucket.value = 'all'
}

function setBucket(next: 'all' | 'due' | 'late' | 'upcoming') {
  if (bucket.value === next) return
  bucket.value = next
  void loadReport()
}

function studentLabel(row: DueInstallmentRow) {
  const name = formatStudentDisplayName(
    {
      firstName: row.first_name,
      secondName: row.second_name,
      secondNameEn: row.second_name_en,
      lastName: row.last_name,
      first_name_ar: row.first_name_ar,
      first_name_en: row.first_name_en,
      last_name_ar: row.last_name_ar,
      last_name_en: row.last_name_en,
    },
    locale.value,
  )
  return name || row.student_name
}

function fmt(v: string | number) {
  return Number(v || 0).toFixed(3)
}

function fmtMoney(v: string | number) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(n)
  } catch {
    return `${n.toFixed(3)} OMR`
  }
}

function formatDay(v: string) {
  try {
    const raw = String(v)
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
    return date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-OM')
  } catch {
    return v
  }
}

function statusLabel(row: DueInstallmentRow) {
  if (row.state === 'late') {
    return row.days_overdue ? t('reports.daysOverdue', { n: row.days_overdue }) : t('reports.state_late')
  }
  if (row.state === 'due') return t('reports.bucket_due')
  if (row.state === 'upcoming') return t('reports.state_upcoming')
  return t('reports.state_unscheduled')
}

function dueCell(row: DueInstallmentRow, key: DueExportKey) {
  if (key === 'student') return studentLabel(row)
  if (key === 'installment') return row.label || `${t('feesV2.installment')} ${row.sequence}`
  if (key === 'dueDate') return row.due_date ? formatDay(row.due_date) : ''
  if (key === 'balance') return fmt(row.balance)
  if (key === 'amountDue') return fmt(row.amount_due)
  if (key === 'amountPaid') return fmt(row.amount_paid)
  if (key === 'daysOverdue') return row.days_overdue ? String(row.days_overdue) : ''
  return statusLabel(row)
}

function columnHeader(key: DueExportKey) {
  const labels: Record<DueExportKey, string> = {
    student: t('reports.studentExportCol.student'),
    installment: t('reports.studentExportCol.installment'),
    dueDate: t('reports.studentExportCol.dueDate'),
    balance: t('reports.studentExportCol.balance'),
    status: t('reports.studentExportCol.status'),
    amountDue: t('reports.studentExportCol.amountDue'),
    amountPaid: t('reports.studentExportCol.amountPaid'),
    daysOverdue: t('reports.studentExportCol.daysOverdue'),
  }
  return labels[key]
}

async function exportReport(format: DueExportFormat) {
  exportMenuOpen.value = false
  if (!reportItems.value.length) {
    feedback.error(t('reports.exportEmpty'))
    return
  }
  exporting.value = format
  try {
    const result = await exportDueInstallmentsPrint({
      format,
      rows: reportItems.value,
      locale: locale.value === 'ar' ? 'ar' : 'en',
      rtl: isRTL.value,
      title: t('reports.dueFeesTitle'),
      subtitle: t('reports.dueHeroMeta', { date: formatDay(asOf.value) }),
      filename: `due-installments-${asOf.value}`,
      header: columnHeader,
      cell: dueCell,
    })
    if (result === 'empty') feedback.error(t('reports.exportEmpty'))
  } catch (e: unknown) {
    feedback.error(getErrorMessage(e, t('reports.exportFailed')))
  } finally {
    exporting.value = null
  }
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
    error.value = getErrorMessage(e, t('reports.dueFeesLoadError'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadReport()
})
</script>
