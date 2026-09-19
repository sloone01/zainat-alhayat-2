<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-elev">
        <div class="fk-empty-panel">
          <p>{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadInitial">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <template v-else>
        <div class="mx-auto w-full max-w-3xl space-y-8">
          <header class="space-y-4">
            <h1 class="fk-display text-[2rem] font-bold leading-tight text-navy-800 sm:text-4xl">
              {{ $t('parent.attendance') }}
            </h1>
            <div v-if="todayChildren.length > 1" class="flex flex-wrap gap-3">
              <button
                v-for="child in todayChildren"
                :key="child.studentId"
                type="button"
                class="fk-fchip"
                :class="selectedId === child.studentId ? 'fk-fchip--active' : ''"
                :aria-pressed="selectedId === child.studentId"
                @click="selectChild(child.studentId)"
              >
                {{ childChipLabel(child) }}
              </button>
            </div>
          </header>

          <div v-if="!todayChildren.length" class="fk-elev">
            <div class="fk-empty-panel">
              <p>{{ $t('parent.noChildren') }}</p>
            </div>
          </div>

          <template v-else>

          <!-- Today card (design 4a) -->
          <section
            class="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
            :aria-label="$t('parent.todayAttendanceSection')"
          >
            <div class="mb-2 flex items-center justify-between gap-3 px-1 pb-2">
              <p class="text-sm text-fikr-ink-muted">{{ todayDateLabel }}</p>
              <span class="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="todayStatusDotClass"
                  aria-hidden="true"
                />
                {{ todayStatusLabel }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-lg bg-fikr-mist p-4">
                <p class="text-xs leading-5 text-fikr-ink-muted">{{ $t('parent.attendanceCheckIn') }}</p>
                <p
                  class="fk-display text-2xl font-bold leading-8 tabular-nums"
                  :class="checkInTime ? 'text-navy-800' : 'text-[#afafaf]'"
                  dir="ltr"
                >
                  {{ checkInTime || $t('parent.attendanceNoTime') }}
                </p>
              </div>
              <div class="rounded-lg bg-fikr-mist p-4">
                <p class="text-xs leading-5 text-fikr-ink-muted">{{ $t('parent.attendanceCheckOut') }}</p>
                <p
                  class="fk-display text-2xl font-bold leading-8 tabular-nums"
                  :class="checkOutTime ? 'text-navy-800' : 'text-[#afafaf]'"
                  dir="ltr"
                >
                  {{ checkOutTime || $t('parent.attendanceNoTime') }}
                </p>
              </div>
            </div>

            <div
              v-if="busRowLabel"
              class="mt-2 flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4"
            >
              <span class="text-sm text-fikr-ink-muted">{{ busRowKicker }}</span>
              <span class="text-sm font-medium text-navy-800">{{ busRowLabel }}</span>
            </div>
          </section>

          <!-- Month strip -->
          <section :aria-label="monthTitle">
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="fk-display text-xl font-bold leading-7 text-navy-800">{{ monthTitle }}</h2>
              <p class="text-sm text-fikr-ink-muted">
                {{ $t('parent.attendanceRateLabel') }}
                <span class="font-medium text-navy-800">{{ monthRateLabel }}</span>
              </p>
            </div>

            <div
              class="mt-4 grid grid-cols-5 gap-2 text-center text-xs leading-5 text-fikr-ink-muted"
              aria-hidden="true"
            >
              <span v-for="d in weekdayLabels" :key="d">{{ d }}</span>
            </div>

            <div class="mt-1 grid grid-cols-5 gap-2">
              <span
                v-for="(cell, idx) in monthCells"
                :key="idx"
                class="grid h-11 place-items-center rounded-lg text-xs font-medium"
                :class="monthCellClass(cell)"
              >
                <template v-if="cell.kind === 'absent'">{{ $t('attendanceManagement.status.absent') }}</template>
                <template v-else-if="cell.kind === 'late'">{{ $t('attendanceManagement.status.late') }}</template>
                <template v-else-if="cell.kind === 'excused'">{{ $t('attendanceManagement.status.excused') }}</template>
              </span>
            </div>

            <div class="mt-3 flex flex-wrap gap-4 text-xs leading-5 text-fikr-ink-muted">
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm bg-primary-500" aria-hidden="true" />
                {{ $t('parent.attendanceLegendPresent', { n: monthStats.present }) }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm bg-navy-800" aria-hidden="true" />
                {{ $t('parent.attendanceLegendAbsent', { n: monthStats.absent }) }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm border border-navy-800" aria-hidden="true" />
                {{ $t('parent.attendanceLegendLate', { n: monthStats.late }) }}
              </span>
            </div>
          </section>

          <!-- Unexcused absence promo -->
          <section
            v-if="unexcusedAbsence"
            class="fk-promo"
            role="status"
          >
            <p class="fk-promo__eyebrow">{{ $t('parent.attendanceUnexcusedEyebrow') }}</p>
            <h2 class="fk-promo__title">{{ formatDisplayDate(unexcusedAbsence.attendance_date) }}</h2>
            <p class="fk-promo__body">{{ $t('parent.attendanceUnexcusedBody') }}</p>
            <div class="fk-promo__actions">
              <router-link to="/messages" class="fk-btn fk-btn--white">
                {{ $t('parent.attendanceMessageTeacher') }}
              </router-link>
            </div>
          </section>

          <!-- Recent days -->
          <section :aria-label="$t('parent.attendanceRecentDays')">
            <h2 class="fk-display mb-1 text-xl font-bold leading-7 text-navy-800">
              {{ $t('parent.attendanceRecentDays') }}
            </h2>

            <div v-if="!visibleHistory.length" class="fk-elev">
              <div class="fk-empty-panel">
                <p>{{ $t('parent.noAttendanceHistory') }}</p>
              </div>
            </div>

            <div v-else class="flex flex-col">
              <div
                v-for="item in visibleHistory"
                :key="item.id"
                class="fk-sched__row"
              >
                <span
                  class="fk-sched__dot"
                  :class="historyDotClass(item)"
                  aria-hidden="true"
                >
                  {{ historyDotGlyph(item) }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="fk-sched__title">{{ formatDisplayDate(item.attendance_date) }}</p>
                  <p class="fk-sched__meta">{{ historyMeta(item) }}</p>
                </div>
              </div>
              <FikrPagination
                :page="currentPage"
                :pages="totalPages"
                :show="showFullMonth && historyList.length > 0"
                @update:page="goToPage"
              />
            </div>

            <button
              v-if="canExpandMonth || historyHasMore"
              type="button"
              class="fk-btn fk-btn--mist mt-4 w-full"
              :disabled="loadingMore"
              @click="onExpandOrLoadMore"
            >
              <span v-if="loadingMore" class="inline-flex items-center justify-center gap-2">
                <FikrLoader size="xs" />
                {{ $t('parent.loading') }}
              </span>
              <span v-else-if="!showFullMonth && canExpandMonth">
                {{ $t('parent.attendanceViewFullMonth') }}
              </span>
              <span v-else>{{ $t('parent.loadMoreAttendance') }}</span>
            </button>
          </section>
          </template>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { parentService } from '@/services/parent.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'

type TodayChild = {
  studentId: string
  firstName: string
  lastName: string
  groupNames: string
  record: null | {
    id: string
    status: string
    check_in_time: string | null
    check_out_time: string | null
    notes: string | null
    is_excused: boolean
    reason: string | null
    groupName: string | null
  }
}

type HistoryItem = {
  id: string
  attendance_date: string
  status: string
  check_in_time: string | null
  check_out_time: string | null
  notes: string | null
  is_excused: boolean
  reason: string | null
  student?: { id: string; firstName: string; lastName: string }
  group?: { id: string; name: string } | null
}

type MonthCell = {
  kind: 'empty' | 'future' | 'present' | 'absent' | 'late' | 'excused' | 'today' | 'pending'
  date?: string
  isToday?: boolean
}

const HISTORY_PAGE = 50
const RECENT_PREVIEW = 5

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const today = ref<{ date: string; children: TodayChild[] } | null>(null)
const historyItems = ref<HistoryItem[]>([])
const historyHasMore = ref(false)
const selectedId = ref<string | null>(null)
const showFullMonth = ref(false)
const busItems = ref<any[]>([])

const todayChildren = computed(() => today.value?.children || [])

const selectedChild = computed(() => {
  if (!selectedId.value) return todayChildren.value[0] || null
  return todayChildren.value.find((c) => c.studentId === selectedId.value) || todayChildren.value[0] || null
})

function childChipLabel(child: TodayChild) {
  const name = (child.firstName || '').trim() || t('parent.childName')
  const group = formatParentGroupNames(child.groupNames, '')
  return group ? `${name} · ${group}` : name
}

function selectChild(id: string) {
  selectedId.value = id
  showFullMonth.value = false
  currentPage.value = 1
}

function sliceTime(raw?: string | null) {
  if (!raw) return ''
  return String(raw).slice(0, 5)
}

const checkInTime = computed(() => sliceTime(selectedChild.value?.record?.check_in_time))
const checkOutTime = computed(() => sliceTime(selectedChild.value?.record?.check_out_time))

const todayStatusLabel = computed(() => {
  const status = selectedChild.value?.record?.status
  if (!status) return t('parent.pendingAttendance')
  if (selectedChild.value?.record?.is_excused) return t('attendanceManagement.status.excused')
  return statusLabel(status)
})

const todayStatusDotClass = computed(() => {
  const status = selectedChild.value?.record?.status
  if (!status) return 'bg-[#afafaf]'
  if (status === 'present') return 'bg-primary-500'
  if (status === 'late') return 'bg-amber-500'
  if (status === 'absent' || selectedChild.value?.record?.is_excused) return 'bg-navy-800'
  return 'bg-[#afafaf]'
})

const todayDateLabel = computed(() => {
  const dateStr = today.value?.date
  if (!dateStr) return t('parent.todayAttendanceSection')
  return t('parent.attendanceTodayLabel', { date: formatDisplayDate(dateStr) })
})

const selectedHistory = computed(() => {
  const id = selectedChild.value?.studentId
  if (!id) return historyItems.value
  return historyItems.value.filter((item) => item.student?.id === id)
})

const childMonthRecords = computed(() => {
  const id = selectedChild.value?.studentId
  const date = today.value?.date
  const items = [...selectedHistory.value]
  const record = selectedChild.value?.record
  if (id && date && record) {
    const already = items.some((i) => i.attendance_date === date)
    if (!already) {
      items.unshift({
        id: `today-${id}`,
        attendance_date: date,
        status: record.status,
        check_in_time: record.check_in_time,
        check_out_time: record.check_out_time,
        notes: record.notes,
        is_excused: record.is_excused,
        reason: record.reason,
        student: { id, firstName: selectedChild.value!.firstName, lastName: selectedChild.value!.lastName },
        group: record.groupName ? { id: 'today', name: record.groupName } : null,
      })
    }
  }
  return items
})

const monthTitle = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return new Date().toLocaleDateString(loc, { month: 'long' })
})

const weekdayLabels = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  // Sun–Thu school week
  const base = new Date(2024, 0, 7) // Sunday
  return [0, 1, 2, 3, 4].map((i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d.toLocaleDateString(loc, { weekday: 'short' })
  })
})

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const monthCells = computed((): MonthCell[] => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const todayStr = today.value?.date || ymd(now)
  const byDate = new Map<string, HistoryItem>()
  for (const item of childMonthRecords.value) {
    if (!byDate.has(item.attendance_date)) byDate.set(item.attendance_date, item)
  }

  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  // Pad so first school day column aligns (Sun=0 … Thu=4). Skip Fri/Sat.
  const startDow = first.getDay() // 0=Sun
  const pad = startDow <= 4 ? startDow : 0
  const cells: MonthCell[] = []
  for (let i = 0; i < pad; i++) cells.push({ kind: 'empty' })

  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day)
    const dow = d.getDay()
    if (dow > 4) continue // Fri/Sat
    const date = ymd(d)
    const isToday = date === todayStr
    const rec = byDate.get(date)
    if (date > todayStr) {
      cells.push({ kind: 'future', date, isToday })
      continue
    }
    if (!rec) {
      cells.push({ kind: isToday ? 'today' : 'pending', date, isToday })
      continue
    }
    let kind: MonthCell['kind'] = 'present'
    if (rec.is_excused) kind = 'excused'
    else if (rec.status === 'absent') kind = 'absent'
    else if (rec.status === 'late') kind = 'late'
    else if (rec.status === 'present') kind = 'present'
    else kind = 'pending'
    cells.push({ kind, date, isToday })
  }

  // Fill trailing cells to complete last row
  while (cells.length % 5 !== 0) cells.push({ kind: 'empty' })
  return cells
})

function monthCellClass(cell: MonthCell) {
  const outline = cell.isToday ? 'outline outline-2 outline-offset-2 outline-navy-800' : ''
  switch (cell.kind) {
    case 'present':
      return `bg-primary-500 text-white ${outline}`
    case 'absent':
      return `bg-navy-800 text-white ${outline}`
    case 'late':
      return `border border-navy-800 bg-white text-navy-800 ${outline}`
    case 'excused':
      return `bg-navy-800 text-white ${outline}`
    case 'today':
      return 'border border-dashed border-navy-800 bg-white text-navy-800'
    case 'future':
    case 'empty':
    case 'pending':
    default:
      return 'bg-fikr-mist'
  }
}

const monthStats = computed(() => {
  let present = 0
  let absent = 0
  let late = 0
  for (const cell of monthCells.value) {
    if (cell.kind === 'present') present++
    else if (cell.kind === 'absent' || cell.kind === 'excused') absent++
    else if (cell.kind === 'late') late++
  }
  return { present, absent, late }
})

const monthRateLabel = computed(() => {
  const { present, absent, late } = monthStats.value
  const total = present + absent + late
  if (total === 0) return '—'
  return `${Math.round((present / total) * 100)}%`
})

const unexcusedAbsence = computed(() => {
  return childMonthRecords.value.find(
    (item) => item.status === 'absent' && !item.is_excused,
  ) || null
})

const historyList = computed(() =>
  childMonthRecords.value.filter((item) => item.attendance_date !== today.value?.date),
)

const {
  currentPage,
  paginatedItems,
  totalPages,
  goToPage,
} = useClientPagination(historyList)

const visibleHistory = computed(() => {
  if (showFullMonth.value) return paginatedItems.value
  return historyList.value.slice(0, RECENT_PREVIEW)
})

const canExpandMonth = computed(() => {
  return !showFullMonth.value && historyList.value.length > RECENT_PREVIEW
})

const busForChild = computed(() => {
  const id = selectedChild.value?.studentId
  if (!id) return null
  return busItems.value.find((b: any) => String(b.student_id) === id) || null
})

const busRowKicker = computed(() => {
  const bus = busForChild.value
  const route = bus?.bus_title
  if (route) return t('parent.homeBusRoute', { route })
  return t('parent.homeBus')
})

const busRowLabel = computed(() => {
  const bus = busForChild.value
  if (!bus) return ''
  const eventKey =
    bus.event_type === 'boarded'
      ? 'parent.recordBusBoarded'
      : bus.event_type === 'dropped_off'
        ? 'parent.recordBusDropped'
        : ''
  const name = selectedChild.value?.firstName || ''
  const eventLabel = eventKey ? t(eventKey, { name }) : ''
  let time = ''
  if (bus.logged_at) {
    try {
      const d = new Date(bus.logged_at)
      time = d.toLocaleTimeString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch {
      time = ''
    }
  }
  if (eventLabel && time) return `${eventLabel} · ${time}`
  return eventLabel || time
})

function historyDotClass(item: HistoryItem) {
  if (item.is_excused || item.status === 'absent') return 'fk-sched__dot--late'
  if (item.status === 'present') return 'fk-sched__dot--paid'
  if (item.status === 'late') return 'fk-sched__dot--wait'
  return 'fk-sched__dot--wait'
}

function historyDotGlyph(item: HistoryItem) {
  if (item.status === 'present') return '✓'
  if (item.status === 'late') return '◔'
  if (item.status === 'absent' || item.is_excused) return '!'
  return '·'
}

function historyMeta(item: HistoryItem) {
  const parts: string[] = [statusLabel(item.is_excused ? 'excused' : item.status)]
  const cin = sliceTime(item.check_in_time)
  const cout = sliceTime(item.check_out_time)
  if (cin && cout) parts.push(`${cin} – ${cout}`)
  else if (cin) parts.push(cin)
  return parts.join(' · ')
}

function statusLabel(status: string) {
  const key = `attendanceManagement.status.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(loc, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

async function loadBus() {
  try {
    const data = await parentService.getMyBusMovements({
      date: today.value?.date,
      limit: 30,
    })
    busItems.value = data?.items || []
  } catch {
    busItems.value = []
  }
}

const loadInitial = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await parentService.getMyAttendance(0, HISTORY_PAGE)
    today.value = data.today
    historyItems.value = [...(data.history?.items || [])]
    historyHasMore.value = !!data.history?.hasMore
    if (!selectedId.value && data.today?.children?.length) {
      selectedId.value = data.today.children[0].studentId
    }
    await loadBus()
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
    const data = await parentService.getMyAttendance(offset, HISTORY_PAGE)
    const newItems = data.history?.items || []
    historyItems.value = [...historyItems.value, ...newItems]
    historyHasMore.value = !!data.history?.hasMore
  } catch (e: any) {
    error.value = e?.message || t('parent.error')
  } finally {
    loadingMore.value = false
  }
}

async function onExpandOrLoadMore() {
  if (!showFullMonth.value && canExpandMonth.value) {
    showFullMonth.value = true
    return
  }
  await loadMore()
}

watch(selectedId, () => {
  showFullMonth.value = false
})

onMounted(() => {
  loadInitial()
})
</script>
