<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
        <h1 class="mb-2 text-2xl font-bold">{{ $t('parent.attendance') }}</h1>
        <p class="text-emerald-100">{{ $t('parent.attendanceSubtitle') }}</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
        <span class="ms-3 text-gray-600">{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 class="mb-2 text-lg font-semibold text-red-800">{{ $t('parent.error') }}</h3>
        <p class="text-red-600">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          @click="loadInitial"
        >
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
          <div class="mt-6 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h3 class="mb-4 text-base font-semibold text-gray-900">{{ $t('parent.childrenToday') }}</h3>
            <div v-if="!today.children.length" class="py-8 text-center text-gray-500">
              {{ $t('parent.noChildren') }}
            </div>
            <ul v-else class="divide-y divide-gray-100">
              <li
                v-for="row in today.children"
                :key="row.studentId"
                class="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
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
                    <span v-if="row.record.is_excused" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
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
        <section class="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('parent.recentAttendanceSection') }}</h2>
            <p v-if="historyTotal > 0" class="mt-1 text-sm text-gray-500">
              {{
                $t('parent.attendanceShowing', {
                  shown: historyItems.length,
                  total: historyTotal,
                })
              }}
            </p>
          </div>

          <div v-if="!historyItems.length" class="px-4 py-12 text-center text-gray-500 sm:px-6">
            {{ $t('parent.noAttendanceHistory') }}
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
                <span v-if="item.is_excused" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
                  {{ $t('attendanceManagement.status.excused') }}
                </span>
                <span v-if="item.check_in_time" class="text-xs tabular-nums text-gray-600">
                  {{ item.check_in_time?.slice(0, 5) }}
                  <template v-if="item.check_out_time"> – {{ item.check_out_time?.slice(0, 5) }}</template>
                </span>
              </div>
            </li>
          </ul>

          <div v-if="historyHasMore" class="border-t border-gray-100 px-4 py-4 sm:px-6">
            <button
              type="button"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 sm:w-auto sm:px-8"
              :disabled="loadingMore"
              @click="loadMore"
            >
              <span v-if="loadingMore" class="inline-flex items-center justify-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
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
      return 'bg-violet-100 text-violet-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadInitial()
})
</script>
