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
          <button
            v-for="report in reports"
            :key="report.id"
            type="button"
            class="fk-tile w-full text-start"
            @click="openReport(report.route)"
          >
            <div>
              <div class="fk-tile__value">{{ report.title }}</div>
              <div class="fk-tile__label mt-0.5">{{ report.description }}</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

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
</script>
