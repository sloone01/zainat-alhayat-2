<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="pageHint"
      />

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ pageTitle }}</h2>
            <p class="fk-card__meta">{{ pageHint }}</p>
          </div>
        </header>
        <div class="space-y-3 p-6">
          <div
            v-for="report in reports"
            :key="report.id"
            class="fk-tile w-full"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-start"
              @click="openReport(report.route)"
            >
              <div class="fk-tile__value">{{ report.title }}</div>
              <div class="fk-tile__label mt-0.5">{{ report.description }}</div>
            </button>
            <div v-if="report.id === 'due-installments'" class="relative shrink-0" data-export-menu>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('reports.exportMenu')"
                :aria-expanded="exportMenuOpen"
                aria-haspopup="true"
                :disabled="exporting !== null"
                @click="exportMenuOpen = !exportMenuOpen"
              >
                <IconDownload />
              </button>
              <div
                v-if="exportMenuOpen"
                role="menu"
                class="absolute end-0 z-30 mt-1 w-44 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-product"
              >
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportDueInstallments('word')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-fikr-mist text-[10px] font-bold text-navy-800">W</span>
                  {{ $t('reports.exportWord') }}
                </button>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportDueInstallments('pdf')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-navy-800 text-[10px] font-bold text-white">PDF</span>
                  {{ $t('reports.exportPdf') }}
                </button>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist" @click="exportDueInstallments('excel')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-primary-500 text-[10px] font-bold text-white">XLS</span>
                  {{ $t('reports.exportExcel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import { useFeedback } from '@/composables/useFeedback'
import { feesV2Service, type DueInstallmentRow } from '@/services/fees-v2.service'
import {
  exportDueInstallmentsPrint,
  type DueExportFormat,
  type DueExportKey,
} from '@/utils/due-installments-export'
import { getErrorMessage } from '@/utils/error-reporting'
import { formatStudentDisplayName } from '@/utils/student-display-name'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const exporting = ref<DueExportFormat | null>(null)
const exportMenuOpen = ref(false)

const isFinancial = computed(() => {
  return route.meta.reportsKind === 'financial' || route.path.startsWith('/reports/financial')
})

const pageTitle = computed(() =>
  isFinancial.value ? t('reports.financialReports') : t('reports.academicReports'),
)

const pageHint = computed(() =>
  isFinancial.value ? t('reports.feeReportsHint') : t('reports.gradedReportsHint'),
)

const academicReports = computed(() => [
  {
    id: 'graded-class',
    title: t('reports.gradedClassTitle'),
    description: t('reports.gradedClassDesc'),
    route: '/reports/graded-marks/class',
  },
  {
    id: 'graded-student',
    title: t('reports.gradedStudentTitle'),
    description: t('reports.gradedStudentDesc'),
    route: '/reports/graded-marks/student',
  },
  {
    id: 'students-export',
    title: t('reports.exportsTitle'),
    description: t('reports.exportsDesc'),
    route: '/reports/exports',
  },
])

const financialReports = computed(() => [
  {
    id: 'due-installments',
    title: t('reports.dueFeesTitle'),
    description: t('reports.dueFeesDesc'),
    route: '/reports/fees/due-installments',
  },
])

const reports = computed(() => (isFinancial.value ? financialReports.value : academicReports.value))

function openReport(path: string) {
  void router.push(path)
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
  if (key === 'dueDate') return row.due_date || ''
  if (key === 'balance') return Number(row.balance || 0).toFixed(3)
  if (key === 'amountDue') return Number(row.amount_due || 0).toFixed(3)
  if (key === 'amountPaid') return Number(row.amount_paid || 0).toFixed(3)
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

async function exportDueInstallments(format: DueExportFormat) {
  exportMenuOpen.value = false
  if (exporting.value) return
  exporting.value = format
  try {
    const asOf = new Date().toISOString().slice(0, 10)
    const data = await feesV2Service.dueInstallmentsReport({ as_of: asOf, bucket: 'all' })
    const result = await exportDueInstallmentsPrint({
      format,
      rows: data.items || [],
      locale: locale.value === 'ar' ? 'ar' : 'en',
      rtl: isRTL.value,
      title: t('reports.dueFeesTitle'),
      subtitle: t('reports.dueHeroMeta', { date: asOf }),
      filename: `due-installments-${asOf}`,
      header: columnHeader,
      cell: dueCell,
    })
    if (result === 'empty') feedback.error(t('reports.exportEmpty'))
  } catch (error: unknown) {
    feedback.error(getErrorMessage(error, t('reports.exportFailed')))
  } finally {
    exporting.value = null
  }
}
</script>
