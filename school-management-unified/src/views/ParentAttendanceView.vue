<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.attendance')"
        :subtitle="$t('parent.attendanceSubtitle')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-alert fk-alert--error">
        <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
        <p>{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadInitial">
          {{ $t('common.retry') }}
        </button>
      </div>

      <template v-else>
        <!-- Today: summary metrics -->
        <section v-if="today">
          <h2 class="mb-4 text-lg font-semibold text-gray-900">
            {{ $t('parent.todayAttendanceSection') }} — {{ formatDisplayDate(today.date) }}
          </h2>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div class="stat-metric-card border-t-4 border-t-emerald-500 text-emerald-600">
              <div class="stat-metric-card__row">
                <div class="stat-metric-card__body">
                  <div class="stat-metric-card__icon bg-gradient-to-br from-emerald-500 to-teal-600">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="stat-metric-card__label">{{ $t('attendanceManagement.status.present') }}</p>
                    <p class="stat-metric-card__value text-emerald-950 tabular-nums">{{ today.summary.present }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="stat-metric-card border-t-4 border-t-rose-500 text-rose-600">
              <div class="stat-metric-card__row">
                <div class="stat-metric-card__body">
                  <div class="stat-metric-card__icon bg-gradient-to-br from-rose-500 to-red-600">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="stat-metric-card__label">{{ $t('attendanceManagement.status.absent') }}</p>
                    <p class="stat-metric-card__value text-rose-950 tabular-nums">{{ today.summary.absent }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="stat-metric-card border-t-4 border-t-amber-500 text-amber-600">
              <div class="stat-metric-card__row">
                <div class="stat-metric-card__body">
                  <div class="stat-metric-card__icon bg-gradient-to-br from-amber-500 to-orange-500">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="stat-metric-card__label">{{ $t('attendanceManagement.status.late') }}</p>
                    <p class="stat-metric-card__value text-amber-950 tabular-nums">{{ today.summary.late }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="stat-metric-card border-t-4 border-t-slate-400 text-slate-600">
              <div class="stat-metric-card__row">
                <div class="stat-metric-card__body">
                  <div class="stat-metric-card__icon bg-gradient-to-br from-slate-400 to-slate-600">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="stat-metric-card__label">{{ $t('parent.pendingAttendance') }}</p>
                    <p class="stat-metric-card__value text-slate-900 tabular-nums">{{ today.summary.pending }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Per-child today -->
          <div class="fk-card mt-6">
            <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
              <div class="min-w-0">
                <h2 class="fk-card__title truncate">{{ $t('parent.childrenToday') }}</h2>
              </div>
            </header>
            <div v-if="!today.children.length" class="flex min-h-[12rem] flex-col items-center justify-center px-6 py-12 text-center">
              <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noChildren') }}</h3>
            </div>
            <ul v-else class="divide-y divide-gray-100">
              <li
                v-for="row in today.children"
                :key="row.studentId"
                class="flex flex-col gap-2 px-5 py-4 first:pt-4 last:pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ row.firstName }} {{ row.lastName }}</p>
                  <p class="text-sm text-gray-500">{{ row.groupNames || $t('parent.noData') }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span v-if="!row.record" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {{ $t('parent.pendingAttendance') }}
                  </span>
                  <template v-else>
                    <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusPillClass(row.record.status)]">
                      {{ statusLabel(row.record.status) }}
                    </span>
                    <span v-if="row.record.is_excused" class="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-800">
                      {{ $t('attendanceManagement.status.excused') }}
                    </span>
                    <span v-if="row.record.check_in_time" class="text-xs text-gray-600 tabular-nums">
                      {{ row.record.check_in_time?.slice(0, 5) }}
                      <template v-if="row.record.check_out_time">
                        – {{ row.record.check_out_time?.slice(0, 5) }}
                      </template>
                    </span>
                  </template>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- History -->
        <section class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('parent.recentAttendanceSection') }}</h2>
              <p v-if="historyTotal > 0" class="fk-card__meta">
                {{
                  $t('parent.attendanceShowing', {
                    shown: historyItems.length,
                    total: historyTotal,
                  })
                }}
              </p>
            </div>
          </header>

          <div v-if="!historyItems.length" class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('parent.noAttendanceHistory') }}</h3>
          </div>
          <ul v-else class="divide-y divide-gray-100 px-2 sm:px-4">
            <li
              v-for="item in historyItems"
              :key="item.id"
              class="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-2"
            >
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900">
                  {{ item.student.firstName }} {{ item.student.lastName }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDisplayDate(item.attendance_date) }}
                  <span v-if="item.group?.name" class="text-gray-400"> · {{ item.group.name }}</span>
                </p>
                <p v-if="item.notes" class="mt-1 text-sm text-gray-600">{{ item.notes }}</p>
              </div>
              <div class="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusPillClass(item.status)]">
                  {{ statusLabel(item.status) }}
                </span>
                <span v-if="item.is_excused" class="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-800">
                  {{ $t('attendanceManagement.status.excused') }}
                </span>
                <span v-if="item.check_in_time" class="text-xs tabular-nums text-gray-600">
                  {{ item.check_in_time?.slice(0, 5) }}
                  <template v-if="item.check_out_time"> – {{ item.check_out_time?.slice(0, 5) }}</template>
                </span>
              </div>
            </li>
          </ul>

          <div v-if="historyHasMore" class="border-t border-fikr-hairline px-5 py-4 sm:px-6">
            <button
              type="button"
              class="fk-btn fk-btn--pearl w-full sm:w-auto"
              :disabled="loadingMore"
              @click="loadMore"
            >
              <span v-if="loadingMore" class="inline-flex items-center justify-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></span>
                {{ $t('parent.loading') }}
              </span>
              <span v-else>{{ $t('parent.loadMoreAttendance') }}</span>
            </button>
          </div>
        </section>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { parentService } from '@/services/parent.service'

const { t, locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const today = ref<any>(null)
const historyItems = ref<any[]>([])
const historyTotal = ref(0)
const historyHasMore = ref(false)

const PAGE_SIZE = 5

const loadInitial = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await parentService.getMyAttendance(0, PAGE_SIZE)
    today.value = data.today
    historyItems.value = [...(data.history?.items || [])]
    historyTotal.value = data.history?.total ?? 0
    historyHasMore.value = !!data.history?.hasMore
  } catch (e: any) {
    error.value = e?.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !historyHasMore.value) return
  try {
    loadingMore.value = true
    const offset = historyItems.value.length
    const data = await parentService.getMyAttendance(offset, PAGE_SIZE)
    const newItems = data.history?.items || []
    historyItems.value = [...historyItems.value, ...newItems]
    historyTotal.value = data.history?.total ?? historyTotal.value
    historyHasMore.value = !!data.history?.hasMore
  } catch (e: any) {
    error.value = e?.message || t('parent.error')
  } finally {
    loadingMore.value = false
  }
}

const formatDisplayDate = (dateStr: string) => {
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

const statusPillClass = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-800'
    case 'absent':
      return 'bg-rose-100 text-rose-800'
    case 'late':
      return 'bg-amber-100 text-amber-900'
    case 'excused':
      return 'bg-primary-100 text-primary-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadInitial()
})
</script>
