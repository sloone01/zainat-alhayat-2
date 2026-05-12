<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
        <h1 class="mb-2 text-2xl font-bold">{{ $t('parent.welcomeMessage') }}</h1>
        <p class="text-blue-100">{{ $t('parent.childrenOverview') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span class="ms-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div class="mb-2 text-red-600">
          <svg class="mx-auto mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="mb-2 text-lg font-semibold text-red-800">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button type="button" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700" @click="loadDashboardData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="stat-metric-card border-t-4 border-t-blue-500 text-blue-600">
            <div class="stat-metric-card__row">
              <div class="stat-metric-card__body">
                <div class="stat-metric-card__icon bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="stat-metric-card__label">{{ $t('parent.myChildren') }}</p>
                  <p class="stat-metric-card__value text-blue-950 tabular-nums">{{ dashboardData.summary?.totalChildren ?? 0 }}</p>
                  <p class="stat-metric-card__hint text-blue-600/80">{{ $t('parent.statHintChildren') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-metric-card border-t-4 border-t-emerald-500 text-emerald-600">
            <div class="stat-metric-card__row">
              <div class="stat-metric-card__body">
                <div class="stat-metric-card__icon bg-gradient-to-br from-emerald-500 to-teal-600">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="stat-metric-card__label">{{ $t('parent.summaryGroups') }}</p>
                  <p class="stat-metric-card__value text-emerald-950 tabular-nums">{{ dashboardData.summary?.totalGroups ?? 0 }}</p>
                  <p class="stat-metric-card__hint text-emerald-600/80">{{ $t('parent.statHintGroups') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-metric-card border-t-4 border-t-violet-500 text-violet-600">
            <div class="stat-metric-card__row">
              <div class="stat-metric-card__body">
                <div class="stat-metric-card__icon bg-gradient-to-br from-violet-500 to-purple-600">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="stat-metric-card__label">{{ $t('parent.summarySchedules') }}</p>
                  <p class="stat-metric-card__value text-violet-950 tabular-nums">{{ dashboardData.summary?.totalSchedules ?? 0 }}</p>
                  <p class="stat-metric-card__hint text-violet-600/80">{{ $t('parent.statHintSchedules') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-metric-card border-t-4 border-t-amber-500 text-amber-600">
            <div class="stat-metric-card__row">
              <div class="stat-metric-card__body">
                <div class="stat-metric-card__icon bg-gradient-to-br from-amber-500 to-orange-500">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="stat-metric-card__label">{{ $t('parent.weeklyPlans') }}</p>
                  <p class="stat-metric-card__value text-amber-950 tabular-nums">{{ dashboardData.summary?.totalWeeklyPlans ?? 0 }}</p>
                  <p class="stat-metric-card__hint text-amber-600/80">{{ $t('parent.statHintPlans') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's attendance -->
        <div
          v-if="attendanceToday && !attendanceLoadFailed"
          class="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-white p-5 shadow-sm sm:p-6"
        >
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('parent.todayAttendanceSection') }}</h2>
              <p class="text-sm text-gray-600">{{ formatAttendanceDate(attendanceToday.date) }}</p>
            </div>
            <router-link
              to="/parent/attendance"
              class="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
            >
              {{ $t('parent.dashboardAttendanceSeeAll') }}
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>

          <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div class="rounded-lg border border-emerald-100 bg-white/90 px-3 py-2.5 shadow-sm">
              <p class="text-xs font-medium text-emerald-700">{{ $t('attendanceManagement.status.present') }}</p>
              <p class="text-lg font-bold tabular-nums text-emerald-950">{{ attendanceToday.summary.present }}</p>
            </div>
            <div class="rounded-lg border border-rose-100 bg-white/90 px-3 py-2.5 shadow-sm">
              <p class="text-xs font-medium text-rose-700">{{ $t('attendanceManagement.status.absent') }}</p>
              <p class="text-lg font-bold tabular-nums text-rose-950">{{ attendanceToday.summary.absent }}</p>
            </div>
            <div class="rounded-lg border border-amber-100 bg-white/90 px-3 py-2.5 shadow-sm">
              <p class="text-xs font-medium text-amber-800">{{ $t('attendanceManagement.status.late') }}</p>
              <p class="text-lg font-bold tabular-nums text-amber-950">{{ attendanceToday.summary.late }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm">
              <p class="text-xs font-medium text-slate-600">{{ $t('parent.pendingAttendance') }}</p>
              <p class="text-lg font-bold tabular-nums text-slate-900">{{ attendanceToday.summary.pending }}</p>
            </div>
          </div>

          <div v-if="!attendanceToday.children.length" class="rounded-lg border border-dashed border-gray-200 bg-white/60 py-8 text-center text-sm text-gray-500">
            {{ $t('parent.noChildren') }}
          </div>
          <ul v-else class="divide-y divide-emerald-100/80 rounded-lg border border-emerald-100/60 bg-white/80">
            <li
              v-for="row in attendanceToday.children"
              :key="row.studentId"
              class="flex flex-col gap-2 px-4 py-3 first:rounded-t-lg last:rounded-b-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div :class="isRTL ? 'text-right' : 'text-left'">
                <p class="font-medium text-gray-900">{{ row.firstName }} {{ row.lastName }}</p>
                <p class="text-sm text-gray-500">{{ row.groupNames || $t('parent.noData') }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                <span v-if="!row.record" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {{ $t('parent.pendingAttendance') }}
                </span>
                <template v-else>
                  <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusPillClass(row.record.status)]">
                    {{ statusLabel(row.record.status) }}
                  </span>
                  <span v-if="row.record.is_excused" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
                    {{ $t('attendanceManagement.status.excused') }}
                  </span>
                  <span v-if="row.record.check_in_time" class="text-xs text-gray-600 tabular-nums">
                    {{ row.record.check_in_time?.slice(0, 5) }}
                    <template v-if="row.record.check_out_time"> – {{ row.record.check_out_time?.slice(0, 5) }}</template>
                  </span>
                </template>
              </div>
            </li>
          </ul>
        </div>

        <div
          v-else-if="attendanceLoadFailed"
          class="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-amber-900">{{ $t('parent.attendanceDashboardLoadError') }}</p>
          <router-link
            to="/parent/attendance"
            class="inline-flex justify-center rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
          >
            {{ $t('parent.attendance') }}
          </router-link>
        </div>

        <!-- Today's bus movements -->
        <div
          v-if="busLog !== null && !busLogLoadFailed"
          class="rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-white p-5 shadow-sm sm:p-6"
        >
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('parent.todayBusLogSection') }}</h2>
              <p class="text-sm text-gray-600">{{ formatAttendanceDate(busDateLabel) }}</p>
            </div>
          </div>

          <div
            v-if="!busLog.items.length"
            class="rounded-lg border border-dashed border-gray-200 bg-white/60 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('parent.noBusMovementsToday') }}
          </div>
          <ul v-else class="divide-y divide-sky-100/80 rounded-lg border border-sky-100/60 bg-white/80">
            <li
              v-for="row in busLog.items"
              :key="row.id"
              class="flex flex-col gap-1 px-4 py-3 first:rounded-t-lg last:rounded-b-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div :class="isRTL ? 'text-right' : 'text-left'">
                <p class="font-medium text-gray-900">{{ row.student_first_name }} {{ row.student_last_name }}</p>
                <p class="text-sm text-gray-500">{{ row.bus_title }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                <span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                  {{ busTripLabel(row.trip_type) }}
                </span>
                <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800 ring-1 ring-gray-200">
                  {{ busEventLabel(row.event_type) }}
                </span>
                <span class="text-xs text-gray-600 tabular-nums">{{ formatLogTime(row.logged_at) }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div
          v-else-if="busLogLoadFailed"
          class="rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900"
        >
          {{ $t('parent.busLogDashboardLoadError') }}
        </div>

        <!-- Children Overview -->
        <div class="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">{{ $t('parent.myChildren') }}</h2>

          <div v-if="dashboardData.children && dashboardData.children.length > 0" class="space-y-4">
            <div
              v-for="child in dashboardData.children"
              :key="child.id"
              class="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-center gap-4 rtl:flex-row-reverse">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span class="font-semibold text-blue-600">{{ child.firstName?.charAt(0) }}{{ child.lastName?.charAt(0) }}</span>
                </div>
                <div class="min-w-0" :class="isRTL ? 'text-right' : 'text-left'">
                  <h3 class="font-semibold text-gray-900">{{ child.firstName }} {{ child.lastName }}</h3>
                  <p class="text-sm text-gray-600">{{ child.groupNames || $t('parent.noData') }}</p>
                </div>
              </div>
              <div class="shrink-0 sm:text-end">
                <p class="text-sm text-gray-500">{{ $t('parent.lastUpdate') }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(child.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="py-8 text-center">
            <svg class="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 class="mb-2 text-lg font-medium text-gray-900">{{ $t('parent.noChildren') }}</h3>
            <p class="text-gray-500">{{ $t('parent.noData') }}</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white via-slate-50/40 to-white p-6 shadow-sm md:p-8">
          <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <h3 class="text-xl font-bold tracking-tight text-gray-900">{{ $t('dashboard.quickActions') }}</h3>
              <p class="mt-1 max-w-xl text-sm text-gray-500">{{ $t('parent.quickLinksSubtitle') }}</p>
            </div>
            <span
              class="inline-flex w-fit items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700"
            >
              {{ $t('dashboard.shortcuts') }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
            <router-link to="/parent/schedule" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-blue-500 to-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.schedule') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkScheduleHint') }}</span>
            </router-link>

            <router-link to="/parent/attendance" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-emerald-500 to-teal-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.attendance') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkAttendanceHint') }}</span>
            </router-link>

            <router-link to="/parent/weekly-plans" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-emerald-500 to-teal-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.weeklyPlans') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkPlansHint') }}</span>
            </router-link>

            <router-link to="/parent/assigned-activities" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-cyan-500 to-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.assignedActivities') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkAssignedActivitiesHint') }}</span>
            </router-link>

            <router-link to="/parent/weekly-activities" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-violet-500 to-purple-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.weeklyActivities') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkActivitiesHint') }}</span>
            </router-link>

            <router-link to="/parent/progress" class="dashboard-action-btn">
              <div class="dashboard-action-icon bg-gradient-to-br from-orange-500 to-amber-500">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ $t('parent.progress') }}</span>
              <span class="mt-1 text-center text-xs text-gray-500">{{ $t('parent.quickLinkProgressHint') }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { parentService } from '../services/parent.service'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const dashboardData = ref<Record<string, any>>({})
const attendanceToday = ref<any>(null)
const attendanceLoadFailed = ref(false)
const busLog = ref<{ date: string | null; items: any[] } | null>(null)
const busLogLoadFailed = ref(false)

function todayTripDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const busDateLabel = computed(() => busLog.value?.date ?? todayTripDate())

const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    attendanceLoadFailed.value = false
    attendanceToday.value = null
    busLogLoadFailed.value = false
    busLog.value = null

    const schoolId = Number((authService.getStoredUser() as { school_id?: number } | null)?.school_id ?? 1)

    const [dashResult, attResult, busResult] = await Promise.allSettled([
      parentService.getMyDashboardData(),
      parentService.getMyAttendance(0, 1),
      parentService.getMyBusMovements(schoolId, { date: todayTripDate(), limit: 40 }),
    ])

    if (dashResult.status === 'rejected') {
      throw dashResult.reason
    }
    dashboardData.value = dashResult.value

    if (attResult.status === 'fulfilled') {
      attendanceToday.value = attResult.value?.today ?? null
    } else {
      attendanceLoadFailed.value = true
      console.warn('Parent dashboard: attendance fetch failed', attResult.reason)
    }

    if (busResult.status === 'fulfilled') {
      busLog.value = busResult.value ?? { date: todayTripDate(), items: [] }
    } else {
      busLogLoadFailed.value = true
      console.warn('Parent dashboard: bus movements fetch failed', busResult.reason)
    }
  } catch (err: any) {
    console.error('Error loading parent dashboard data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return t('parent.noData')

  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(dateString).toLocaleDateString(loc, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return t('parent.noData')
  }
}

const formatAttendanceDate = (dateStr: string) => {
  if (!dateStr) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(loc, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const statusLabel = (status: string) => {
  const key = `attendanceManagement.status.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

const formatLogTime = (iso: string) => {
  if (!iso) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(iso).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const busTripLabel = (tripType: string) => {
  if (tripType === 'return') return t('busDailyLog.tripReturn')
  return t('busDailyLog.tripGoing')
}

const busEventLabel = (eventType: string) => {
  if (eventType === 'dropped_off') return t('busDailyLog.droppedOff')
  return t('busDailyLog.boarded')
}

const statusPillClass = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-800'
    case 'absent':
      return 'bg-rose-100 text-rose-800'
    case 'late':
      return 'bg-amber-100 text-amber-900'
    case 'excused':
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
