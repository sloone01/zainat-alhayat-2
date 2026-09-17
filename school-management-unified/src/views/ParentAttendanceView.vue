<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('parent.attendance')" />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-gray-600">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error">
        <ActivityCard :title="$t('parent.attendance')">
          <template #icon>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </template>
          <template #list>
            <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
              <p class="text-sm font-semibold text-zinc-800">{{ error }}</p>
              <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadInitial">
                {{ $t('common.retry') }}
              </button>
            </div>
          </template>
        </ActivityCard>
      </div>

      <template v-else>
        <div v-if="!today?.children?.length && !historyItems.length">
          <ActivityCard :title="$t('parent.attendance')">
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </template>
            <template #list>
              <div class="flex flex-col items-center justify-center rounded-xl border border-zinc-200/50 bg-zinc-50 px-4 py-10 text-center">
                <p class="text-sm font-semibold text-zinc-800">{{ $t('parent.noChildren') }}</p>
              </div>
            </template>
          </ActivityCard>
        </div>

        <div v-else class="space-y-6">
          <ActivityCard
            v-if="todayChildren.length > 1"
            :title="$t('parent.myChildren')"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </template>
            <template #list>
              <button
                v-for="child in todayChildren"
                :key="child.studentId"
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-start transition-colors duration-200"
                :class="selectedId === child.studentId
                  ? 'border-primary-300 bg-primary-50/70'
                  : 'border-zinc-200/50 bg-zinc-50 hover:border-zinc-300'"
                @click="selectChild(child.studentId)"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  :class="selectedId === child.studentId ? 'bg-primary-600' : 'bg-zinc-400'"
                >
                  {{ initials(child) }}
                </span>
                <span class="min-w-0 truncate text-sm font-medium text-zinc-800">
                  {{ child.firstName }} {{ child.lastName }}
                </span>
              </button>
            </template>
          </ActivityCard>

          <ActivityCard
            :title="selectedChildName"
            :category="selectedCategory"
            :metrics="todayMetrics"
          >
            <template #icon>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </template>

            <div v-if="displayHistory.length">
                <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('parent.recentAttendanceSection') }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="item in displayHistory"
                    :key="item.id"
                    class="relative flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <span
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      :class="historyIconClass(item.status)"
                      aria-hidden="true"
                    >
                      <svg v-if="item.status === 'present'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <svg v-else-if="item.status === 'absent'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <svg v-else-if="item.status === 'late'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 6.75h15A1.5 1.5 0 0121 8.25v11.25A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V8.25A1.5 1.5 0 014.5 6.75z" />
                      </svg>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-gray-900">
                        <span>{{ formatDisplayDate(item.attendance_date) }}</span>
                        <span class="text-xs font-normal leading-[inherit] text-gray-500">
                          {{ statusLabel(item.status) }}
                        </span>
                      </p>
                      <p class="mt-1 text-xs tabular-nums text-gray-500">
                        <template v-if="item.group?.name">{{ item.group.name }}</template>
                        <template v-if="item.check_in_time">
                          <template v-if="item.group?.name"> · </template>
                          {{ item.check_in_time?.slice(0, 5) }}
                          <template v-if="item.check_out_time"> – {{ item.check_out_time?.slice(0, 5) }}</template>
                        </template>
                      </p>
                    </div>
                  </div>
                  <button
                    v-if="historyHasMore"
                    type="button"
                    class="fk-btn fk-btn--pearl w-full sm:w-auto"
                    :disabled="loadingMore"
                    @click="loadMore"
                  >
                    <span v-if="loadingMore" class="inline-flex items-center justify-center gap-2">
                      <FikrLoader size="xs" />
                      {{ $t('parent.loading') }}
                    </span>
                    <span v-else>{{ $t('parent.loadMoreAttendance') }}</span>
                  </button>
                </div>
            </div>
          </ActivityCard>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ActivityCard, { type ActivityMetric } from '@/components/ui/activity-card.vue'
import { parentService } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import FikrLoader from '@/components/FikrLoader.vue'

const METRIC_COLORS = {
  present: '#2CD758',
  absent: '#FF2D55',
  pending: '#007AFF',
} as const

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const today = ref<any>(null)
const historyItems = ref<any[]>([])
const historyTotal = ref(0)
const historyHasMore = ref(false)
const selectedId = ref<string | null>(null)

const PAGE_SIZE = 5

const todayChildren = computed(() => today.value?.children || [])

const selectedChild = computed(() => {
  if (!selectedId.value) return todayChildren.value[0] || null
  return todayChildren.value.find((c: any) => c.studentId === selectedId.value) || todayChildren.value[0] || null
})

const selectedChildName = computed(() => {
  const child = selectedChild.value
  return child ? `${child.firstName} ${child.lastName}`.trim() : t('parent.attendance')
})

const selectedCategory = computed(() => {
  const child = selectedChild.value
  return child ? formatParentGroupNames(child.groupNames, t('parent.noGroupAssigned')) : ''
})

const selectedHistory = computed(() => {
  const id = selectedChild.value?.studentId
  if (!id) return historyItems.value
  return historyItems.value.filter((item: any) => item.student?.id === id)
})

const displayHistory = computed(() => {
  const child = selectedChild.value
  const record = child?.record
  const date = today.value?.date
  if (!child || !record || !date) return selectedHistory.value
  const alreadyListed = selectedHistory.value.some((item: any) => item.attendance_date === date)
  if (alreadyListed) return selectedHistory.value
  return [
    {
      id: `today-${child.studentId}`,
      attendance_date: date,
      status: record.status,
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time,
      group: record.groupName ? { id: 'today', name: record.groupName } : null,
    },
    ...selectedHistory.value,
  ]
})

const RING_VALUE = 'text-[13px] font-bold tabular-nums text-zinc-900 sm:text-sm'

const todayMetrics = computed<ActivityMetric[]>(() => {
  const child = selectedChild.value
  const history = selectedHistory.value
  let present = history.filter((i: any) => i.status === 'present').length
  let absent = history.filter((i: any) => i.status === 'absent').length
  let pending = 0
  if (child?.record?.status === 'present') present += 1
  else if (child?.record?.status === 'absent') absent += 1
  else if (!child?.record) pending = 1
  const total = present + absent + pending
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
  return [
    {
      key: 'present',
      label: t('attendanceManagement.status.present'),
      value: String(present),
      trend: pct(present),
      color: METRIC_COLORS.present,
      valueClass: RING_VALUE,
    },
    {
      key: 'absent',
      label: t('attendanceManagement.status.absent'),
      value: String(absent),
      trend: pct(absent),
      color: METRIC_COLORS.absent,
      valueClass: RING_VALUE,
    },
    {
      key: 'pending',
      label: t('parent.pendingAttendance'),
      value: String(pending),
      trend: pct(pending),
      color: METRIC_COLORS.pending,
      valueClass: RING_VALUE,
    },
  ]
})

function selectChild(id: string) {
  selectedId.value = id
}

function initials(child: { firstName?: string; lastName?: string }) {
  const a = (child.firstName || '').trim().charAt(0)
  const b = (child.lastName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

function historyIconClass(status?: string) {
  if (status === 'present') return 'bg-emerald-100 text-emerald-700'
  if (status === 'absent') return 'bg-rose-50 text-rose-600'
  if (status === 'late') return 'bg-amber-50 text-amber-700'
  return 'bg-navy-50 text-navy-700'
}

const loadInitial = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await parentService.getMyAttendance(0, PAGE_SIZE)
    today.value = data.today
    historyItems.value = [...(data.history?.items || [])]
    historyTotal.value = data.history?.total ?? 0
    historyHasMore.value = !!data.history?.hasMore
    if (!selectedId.value && data.today?.children?.length) {
      selectedId.value = data.today.children[0].studentId
    }
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

onMounted(() => {
  loadInitial()
})
</script>
